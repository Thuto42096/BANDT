import React, { createContext, useContext, useReducer, useEffect } from 'react';
import DatabaseService from '../services/DatabaseService';
import SyncService from '../services/SyncService';

// Initial state
const initialState = {
  inventory: [],
  salesHistory: [],
  creditScore: null,
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
  pendingSyncCount: 0,
};

// Action types
const ActionTypes = {
  SET_INVENTORY: 'SET_INVENTORY',
  ADD_INVENTORY_ITEM: 'ADD_INVENTORY_ITEM',
  UPDATE_INVENTORY_ITEM: 'UPDATE_INVENTORY_ITEM',
  DELETE_INVENTORY_ITEM: 'DELETE_INVENTORY_ITEM',
  SET_SALES_HISTORY: 'SET_SALES_HISTORY',
  ADD_SALE: 'ADD_SALE',
  SET_CREDIT_SCORE: 'SET_CREDIT_SCORE',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  SET_SYNC_STATUS: 'SET_SYNC_STATUS',
  SET_LAST_SYNC_TIME: 'SET_LAST_SYNC_TIME',
  SET_PENDING_SYNC_COUNT: 'SET_PENDING_SYNC_COUNT',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_INVENTORY:
      return { ...state, inventory: action.payload };
    
    case ActionTypes.ADD_INVENTORY_ITEM:
      return { 
        ...state, 
        inventory: [...state.inventory, action.payload] 
      };
    
    case ActionTypes.UPDATE_INVENTORY_ITEM:
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    
    case ActionTypes.DELETE_INVENTORY_ITEM:
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload),
      };
    
    case ActionTypes.SET_SALES_HISTORY:
      return { ...state, salesHistory: action.payload };
    
    case ActionTypes.ADD_SALE:
      return { 
        ...state, 
        salesHistory: [action.payload, ...state.salesHistory] 
      };
    
    case ActionTypes.SET_CREDIT_SCORE:
      return { ...state, creditScore: action.payload };
    
    case ActionTypes.SET_ONLINE_STATUS:
      return { ...state, isOnline: action.payload };
    
    case ActionTypes.SET_SYNC_STATUS:
      return { ...state, isSyncing: action.payload };
    
    case ActionTypes.SET_LAST_SYNC_TIME:
      return { ...state, lastSyncTime: action.payload };
    
    case ActionTypes.SET_PENDING_SYNC_COUNT:
      return { ...state, pendingSyncCount: action.payload };
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const inventory = await DatabaseService.getInventory();
      const salesHistory = await DatabaseService.getSalesHistory();
      const creditScore = await DatabaseService.getCreditScore();
      const pendingCount = await DatabaseService.getPendingSyncCount();

      dispatch({ type: ActionTypes.SET_INVENTORY, payload: inventory });
      dispatch({ type: ActionTypes.SET_SALES_HISTORY, payload: salesHistory });
      dispatch({ type: ActionTypes.SET_CREDIT_SCORE, payload: creditScore });
      dispatch({ type: ActionTypes.SET_PENDING_SYNC_COUNT, payload: pendingCount });
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  // Actions
  const actions = {
    // Inventory actions
    addInventoryItem: async (item) => {
      try {
        const newItem = await DatabaseService.addInventoryItem(item);
        dispatch({ type: ActionTypes.ADD_INVENTORY_ITEM, payload: newItem });
        
        // Queue for sync
        await SyncService.queueOperation('inventory', 'create', newItem);
        return newItem;
      } catch (error) {
        console.error('Failed to add inventory item:', error);
        throw error;
      }
    },

    updateInventoryItem: async (item) => {
      try {
        const updatedItem = await DatabaseService.updateInventoryItem(item);
        dispatch({ type: ActionTypes.UPDATE_INVENTORY_ITEM, payload: updatedItem });
        
        // Queue for sync
        await SyncService.queueOperation('inventory', 'update', updatedItem);
        return updatedItem;
      } catch (error) {
        console.error('Failed to update inventory item:', error);
        throw error;
      }
    },

    deleteInventoryItem: async (itemId) => {
      try {
        await DatabaseService.deleteInventoryItem(itemId);
        dispatch({ type: ActionTypes.DELETE_INVENTORY_ITEM, payload: itemId });
        
        // Queue for sync
        await SyncService.queueOperation('inventory', 'delete', { id: itemId });
      } catch (error) {
        console.error('Failed to delete inventory item:', error);
        throw error;
      }
    },

    // Sales actions
    processSale: async (saleData) => {
      try {
        const sale = await DatabaseService.processSale(saleData);
        dispatch({ type: ActionTypes.ADD_SALE, payload: sale });
        
        // Update inventory
        const updatedInventory = await DatabaseService.getInventory();
        dispatch({ type: ActionTypes.SET_INVENTORY, payload: updatedInventory });
        
        // Update credit score
        const creditScore = await DatabaseService.getCreditScore();
        dispatch({ type: ActionTypes.SET_CREDIT_SCORE, payload: creditScore });
        
        // Queue for sync
        await SyncService.queueOperation('sales', 'create', sale);
        
        return sale;
      } catch (error) {
        console.error('Failed to process sale:', error);
        throw error;
      }
    },

    // Sync actions
    setOnlineStatus: (isOnline) => {
      dispatch({ type: ActionTypes.SET_ONLINE_STATUS, payload: isOnline });
    },

    setSyncStatus: (isSyncing) => {
      dispatch({ type: ActionTypes.SET_SYNC_STATUS, payload: isSyncing });
    },

    setLastSyncTime: (time) => {
      dispatch({ type: ActionTypes.SET_LAST_SYNC_TIME, payload: time });
    },

    setPendingSyncCount: (count) => {
      dispatch({ type: ActionTypes.SET_PENDING_SYNC_COUNT, payload: count });
    },

    // Manual sync trigger
    syncNow: async () => {
      try {
        dispatch({ type: ActionTypes.SET_SYNC_STATUS, payload: true });
        await SyncService.syncAll();
        
        // Reload data after sync
        await loadInitialData();
        
        dispatch({ type: ActionTypes.SET_LAST_SYNC_TIME, payload: new Date().toISOString() });
      } catch (error) {
        console.error('Sync failed:', error);
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_SYNC_STATUS, payload: false });
      }
    },
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export { ActionTypes };
