import NetInfo from '@react-native-community/netinfo';
import DatabaseService from './DatabaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SyncService {
  constructor() {
    this.isOnline = false;
    this.isSyncing = false;
    this.syncInterval = null;
    this.baseURL = 'http://localhost:5001/api'; // Change this to your server URL
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  async initialize() {
    try {
      // Check initial network status
      const netInfo = await NetInfo.fetch();
      this.isOnline = netInfo.isConnected && netInfo.isInternetReachable;

      // Set up network listener
      this.setupNetworkListener();

      // Set up periodic sync (every 5 minutes when online)
      this.setupPeriodicSync();

      console.log('SyncService initialized');
    } catch (error) {
      console.error('Failed to initialize SyncService:', error);
      throw error;
    }
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;

      console.log('Network status changed:', this.isOnline ? 'Online' : 'Offline');

      // If we just came back online, trigger sync
      if (wasOffline && this.isOnline) {
        console.log('Back online - triggering sync');
        this.syncAll();
      }
    });
  }

  setupPeriodicSync() {
    // Clear existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Set up new interval (5 minutes)
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        console.log('Periodic sync triggered');
        this.syncAll();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  async queueOperation(tableName, operation, data) {
    try {
      await DatabaseService.addToSyncQueue(tableName, operation, data);
      console.log(`Queued ${operation} operation for ${tableName}`);

      // If online, try to sync immediately
      if (this.isOnline && !this.isSyncing) {
        this.syncAll();
      }
    } catch (error) {
      console.error('Failed to queue operation:', error);
      throw error;
    }
  }

  async syncAll() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    if (!this.isOnline) {
      console.log('Cannot sync - offline');
      return;
    }

    try {
      this.isSyncing = true;
      console.log('Starting sync...');

      // Get all pending sync operations
      const syncQueue = await DatabaseService.getSyncQueue();
      console.log(`Found ${syncQueue.length} items to sync`);

      let successCount = 0;
      let failureCount = 0;

      for (const item of syncQueue) {
        try {
          await this.processSyncItem(item);
          await DatabaseService.removeSyncQueueItem(item.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          failureCount++;
          
          // Update retry count and error message
          await this.updateSyncItemError(item.id, error.message);
        }
      }

      console.log(`Sync completed: ${successCount} success, ${failureCount} failures`);

      // Update last sync time
      await AsyncStorage.setItem('lastSyncTime', new Date().toISOString());

    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  async processSyncItem(item) {
    const { table_name, operation, data } = item;

    switch (table_name) {
      case 'inventory':
        return await this.syncInventoryItem(operation, data);
      case 'sales':
        return await this.syncSalesItem(operation, data);
      case 'credit_score':
        return await this.syncCreditScore(data);
      default:
        throw new Error(`Unknown table: ${table_name}`);
    }
  }

  async syncInventoryItem(operation, data) {
    const url = `${this.baseURL}/inventory`;

    switch (operation) {
      case 'create':
        return await this.makeRequest('POST', url, data);
      case 'update':
        return await this.makeRequest('PUT', `${url}/${data.id}`, data);
      case 'delete':
        return await this.makeRequest('DELETE', `${url}/${data.id}`);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async syncSalesItem(operation, data) {
    const url = `${this.baseURL}/sell`;

    switch (operation) {
      case 'create':
        // Transform data to match backend API
        const saleData = {
          item_name: data.item_name,
          quantity: data.quantity,
          payment_method: data.payment_method,
          amount_received: data.amount_received,
          change: data.change_given
        };
        return await this.makeRequest('POST', url, saleData);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async syncCreditScore(data) {
    // Credit score is usually calculated on the server, so we might just need to trigger a recalculation
    // For now, we'll just log it
    console.log('Credit score sync:', data);
    return Promise.resolve();
  }

  async makeRequest(method, url, data = null, retries = 0) {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (method !== 'DELETE') {
        return await response.json();
      }

      return { success: true };
    } catch (error) {
      console.error(`Request failed (${method} ${url}):`, error);

      // Retry logic
      if (retries < this.maxRetries) {
        console.log(`Retrying in ${this.retryDelay}ms... (attempt ${retries + 1}/${this.maxRetries})`);
        await this.delay(this.retryDelay);
        return this.makeRequest(method, url, data, retries + 1);
      }

      throw error;
    }
  }

  async updateSyncItemError(itemId, errorMessage) {
    try {
      // This would require adding an update method to DatabaseService
      // For now, we'll just log the error
      console.error(`Sync item ${itemId} failed:`, errorMessage);
    } catch (error) {
      console.error('Failed to update sync item error:', error);
    }
  }

  async getLastSyncTime() {
    try {
      const lastSync = await AsyncStorage.getItem('lastSyncTime');
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }

  async getPendingSyncCount() {
    try {
      return await DatabaseService.getPendingSyncCount();
    } catch (error) {
      console.error('Failed to get pending sync count:', error);
      return 0;
    }
  }

  // Utility methods
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Manual sync trigger
  async forcSync() {
    console.log('Force sync triggered');
    return await this.syncAll();
  }

  // Check if we can sync
  canSync() {
    return this.isOnline && !this.isSyncing;
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.getLastSyncTime(),
      pendingSyncCount: this.getPendingSyncCount(),
    };
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export default new SyncService();
