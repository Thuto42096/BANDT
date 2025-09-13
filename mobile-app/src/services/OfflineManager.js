import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import DatabaseService from './DatabaseService';
import SyncService from './SyncService';

class OfflineManager {
  constructor() {
    this.isOnline = false;
    this.listeners = [];
    this.optimisticUpdates = new Map();
    this.conflictResolutionStrategy = 'client-wins'; // 'client-wins', 'server-wins', 'merge'
  }

  async initialize() {
    try {
      // Check initial network status
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected && netInfo.isInternetReachable;

      // Set up network listener
      this.setupNetworkListener();

      // Load persisted state
      await this.loadPersistedState();

      console.log('OfflineManager initialized');
    } catch (error) {
      console.error('Failed to initialize OfflineManager:', error);
      throw error;
    }
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;

      console.log('Network status changed:', this.isOnline ? 'Online' : 'Offline');

      // Notify listeners
      this.notifyListeners({
        type: 'NETWORK_STATUS_CHANGED',
        payload: { isOnline: this.isOnline, wasOffline }
      });

      // If we just came back online, trigger sync
      if (wasOffline && this.isOnline) {
        this.handleBackOnline();
      }
    });
  }

  async handleBackOnline() {
    try {
      console.log('Back online - processing optimistic updates and syncing');
      
      // Process optimistic updates
      await this.processOptimisticUpdates();
      
      // Trigger full sync
      await SyncService.syncAll();
      
      // Clear processed optimistic updates
      this.optimisticUpdates.clear();
      await this.persistOptimisticUpdates();
      
    } catch (error) {
      console.error('Failed to handle back online:', error);
    }
  }

  // Optimistic updates management
  async addOptimisticUpdate(id, operation, data, rollbackData = null) {
    const update = {
      id,
      operation,
      data,
      rollbackData,
      timestamp: new Date().toISOString(),
      status: 'pending' // 'pending', 'confirmed', 'failed'
    };

    this.optimisticUpdates.set(id, update);
    await this.persistOptimisticUpdates();

    console.log(`Added optimistic update: ${id}`);
    return update;
  }

  async confirmOptimisticUpdate(id) {
    const update = this.optimisticUpdates.get(id);
    if (update) {
      update.status = 'confirmed';
      this.optimisticUpdates.set(id, update);
      await this.persistOptimisticUpdates();
      console.log(`Confirmed optimistic update: ${id}`);
    }
  }

  async rollbackOptimisticUpdate(id) {
    const update = this.optimisticUpdates.get(id);
    if (update && update.rollbackData) {
      try {
        // Apply rollback data
        await this.applyRollback(update);
        
        update.status = 'failed';
        this.optimisticUpdates.set(id, update);
        await this.persistOptimisticUpdates();
        
        console.log(`Rolled back optimistic update: ${id}`);
        
        // Notify listeners
        this.notifyListeners({
          type: 'OPTIMISTIC_UPDATE_ROLLBACK',
          payload: { id, update }
        });
        
      } catch (error) {
        console.error(`Failed to rollback optimistic update ${id}:`, error);
      }
    }
  }

  async applyRollback(update) {
    const { operation, rollbackData } = update;
    
    switch (operation) {
      case 'ADD_INVENTORY_ITEM':
        // Remove the optimistically added item
        if (rollbackData.id) {
          await DatabaseService.deleteInventoryItem(rollbackData.id);
        }
        break;
        
      case 'UPDATE_INVENTORY_ITEM':
        // Restore previous item state
        await DatabaseService.updateInventoryItem(rollbackData);
        break;
        
      case 'DELETE_INVENTORY_ITEM':
        // Restore deleted item
        await DatabaseService.addInventoryItem(rollbackData);
        break;
        
      case 'PROCESS_SALE':
        // This is more complex - would need to reverse inventory changes
        // and remove sale record
        console.warn('Sale rollback not implemented yet');
        break;
        
      default:
        console.warn(`Unknown rollback operation: ${operation}`);
    }
  }

  async processOptimisticUpdates() {
    const pendingUpdates = Array.from(this.optimisticUpdates.values())
      .filter(update => update.status === 'pending');

    console.log(`Processing ${pendingUpdates.length} optimistic updates`);

    for (const update of pendingUpdates) {
      try {
        await this.syncOptimisticUpdate(update);
        await this.confirmOptimisticUpdate(update.id);
      } catch (error) {
        console.error(`Failed to sync optimistic update ${update.id}:`, error);
        
        // Decide whether to rollback or retry based on error type
        if (this.shouldRollback(error)) {
          await this.rollbackOptimisticUpdate(update.id);
        }
      }
    }
  }

  async syncOptimisticUpdate(update) {
    const { operation, data } = update;
    
    switch (operation) {
      case 'ADD_INVENTORY_ITEM':
        await SyncService.queueOperation('inventory', 'create', data);
        break;
        
      case 'UPDATE_INVENTORY_ITEM':
        await SyncService.queueOperation('inventory', 'update', data);
        break;
        
      case 'DELETE_INVENTORY_ITEM':
        await SyncService.queueOperation('inventory', 'delete', data);
        break;
        
      case 'PROCESS_SALE':
        await SyncService.queueOperation('sales', 'create', data);
        break;
        
      default:
        throw new Error(`Unknown sync operation: ${operation}`);
    }
  }

  shouldRollback(error) {
    // Determine if we should rollback based on error type
    // For now, rollback on client errors (4xx) but not server errors (5xx)
    if (error.message && error.message.includes('400')) return true;
    if (error.message && error.message.includes('404')) return true;
    if (error.message && error.message.includes('409')) return true; // Conflict
    
    return false; // Retry server errors
  }

  // Conflict resolution
  async resolveConflict(localData, serverData, operation) {
    switch (this.conflictResolutionStrategy) {
      case 'client-wins':
        return localData;
        
      case 'server-wins':
        return serverData;
        
      case 'merge':
        return this.mergeData(localData, serverData, operation);
        
      default:
        return localData;
    }
  }

  mergeData(localData, serverData, operation) {
    // Simple merge strategy - use latest timestamp
    const localTime = new Date(localData.updated_at || localData.timestamp);
    const serverTime = new Date(serverData.updated_at || serverData.timestamp);
    
    return localTime > serverTime ? localData : serverData;
  }

  // Persistence
  async persistOptimisticUpdates() {
    try {
      const updates = Array.from(this.optimisticUpdates.entries());
      await AsyncStorage.setItem('optimistic_updates', JSON.stringify(updates));
    } catch (error) {
      console.error('Failed to persist optimistic updates:', error);
    }
  }

  async loadPersistedState() {
    try {
      const updatesJson = await AsyncStorage.getItem('optimistic_updates');
      if (updatesJson) {
        const updates = JSON.parse(updatesJson);
        this.optimisticUpdates = new Map(updates);
        console.log(`Loaded ${updates.length} persisted optimistic updates`);
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error);
    }
  }

  // State management helpers
  async persistAppState(state) {
    try {
      await AsyncStorage.setItem('app_state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to persist app state:', error);
    }
  }

  async loadAppState() {
    try {
      const stateJson = await AsyncStorage.getItem('app_state');
      return stateJson ? JSON.parse(stateJson) : null;
    } catch (error) {
      console.error('Failed to load app state:', error);
      return null;
    }
  }

  // Event listeners
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Listener error:', error);
      }
    });
  }

  // Utility methods
  isOnlineMode() {
    return this.isOnline;
  }

  getPendingUpdatesCount() {
    return Array.from(this.optimisticUpdates.values())
      .filter(update => update.status === 'pending').length;
  }

  getFailedUpdatesCount() {
    return Array.from(this.optimisticUpdates.values())
      .filter(update => update.status === 'failed').length;
  }

  async clearFailedUpdates() {
    const failedUpdates = Array.from(this.optimisticUpdates.entries())
      .filter(([_, update]) => update.status === 'failed');
    
    failedUpdates.forEach(([id, _]) => {
      this.optimisticUpdates.delete(id);
    });
    
    await this.persistOptimisticUpdates();
    console.log(`Cleared ${failedUpdates.length} failed updates`);
  }

  // Cleanup
  destroy() {
    this.listeners = [];
    this.optimisticUpdates.clear();
  }
}

export default new OfflineManager();
