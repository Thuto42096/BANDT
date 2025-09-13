import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {
  Modal,
  Portal,
  Card,
  Button,
  Title,
  Paragraph,
  Chip,
  ProgressBar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useApp } from '../context/AppContext';
import SyncService from '../services/SyncService';
import DatabaseService from '../services/DatabaseService';

const SyncStatusModal = ({ visible, onDismiss }) => {
  const { state, actions } = useApp();
  const { isOnline, isSyncing, pendingSyncCount, lastSyncTime } = state;
  
  const [syncQueue, setSyncQueue] = useState([]);
  const [syncStats, setSyncStats] = useState({
    totalOperations: 0,
    completedOperations: 0,
    failedOperations: 0,
  });

  useEffect(() => {
    if (visible) {
      loadSyncData();
    }
  }, [visible]);

  const loadSyncData = async () => {
    try {
      const queue = await DatabaseService.getSyncQueue();
      setSyncQueue(queue);
      
      // Calculate stats
      const stats = {
        totalOperations: queue.length,
        completedOperations: 0,
        failedOperations: queue.filter(item => item.attempts > 0 && item.error_message).length,
      };
      setSyncStats(stats);
    } catch (error) {
      console.error('Failed to load sync data:', error);
    }
  };

  const handleManualSync = async () => {
    try {
      await actions.syncNow();
      await loadSyncData();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const handleClearFailedOperations = async () => {
    try {
      // Remove failed operations from queue
      const failedItems = syncQueue.filter(item => item.error_message);
      for (const item of failedItems) {
        await DatabaseService.removeSyncQueueItem(item.id);
      }
      await loadSyncData();
    } catch (error) {
      console.error('Failed to clear failed operations:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getOperationIcon = (operation) => {
    switch (operation) {
      case 'create': return 'add';
      case 'update': return 'edit';
      case 'delete': return 'delete';
      default: return 'sync';
    }
  };

  const getOperationColor = (item) => {
    if (item.error_message) return '#F44336';
    if (item.attempts > 0) return '#FF9800';
    return '#2196F3';
  };

  const renderSyncItem = ({ item }) => (
    <Card style={styles.syncItem}>
      <Card.Content>
        <View style={styles.syncItemHeader}>
          <Icon 
            name={getOperationIcon(item.operation)} 
            size={20} 
            color={getOperationColor(item)} 
          />
          <Text style={styles.syncItemTitle}>
            {item.operation.toUpperCase()} {item.table_name}
          </Text>
          <Chip 
            mode="outlined" 
            style={[styles.statusChip, { borderColor: getOperationColor(item) }]}
            textStyle={{ color: getOperationColor(item) }}
          >
            {item.error_message ? 'Failed' : item.attempts > 0 ? 'Retrying' : 'Pending'}
          </Chip>
        </View>
        
        <Text style={styles.syncItemTime}>
          Created: {formatTimestamp(item.created_at)}
        </Text>
        
        {item.attempts > 0 && (
          <Text style={styles.syncItemAttempts}>
            Attempts: {item.attempts}
            {item.last_attempt && ` (Last: ${formatTimestamp(item.last_attempt)})`}
          </Text>
        )}
        
        {item.error_message && (
          <Text style={styles.syncItemError}>
            Error: {item.error_message}
          </Text>
        )}
        
        <Text style={styles.syncItemData} numberOfLines={2}>
          Data: {JSON.stringify(item.data)}
        </Text>
      </Card.Content>
    </Card>
  );

  const renderEmptyQueue = () => (
    <View style={styles.emptyContainer}>
      <Icon name="cloud-done" size={64} color="#4CAF50" />
      <Text style={styles.emptyTitle}>All Synced!</Text>
      <Text style={styles.emptySubtitle}>
        No pending operations. Your data is up to date.
      </Text>
    </View>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.modalCard}>
          <Card.Content>
            <View style={styles.header}>
              <Title>Sync Status</Title>
              <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Connection Status */}
            <View style={styles.connectionStatus}>
              <Icon 
                name={isOnline ? 'cloud-done' : 'cloud-off'} 
                size={24} 
                color={isOnline ? '#4CAF50' : '#F44336'} 
              />
              <Text style={[styles.connectionText, { color: isOnline ? '#4CAF50' : '#F44336' }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
              {lastSyncTime && (
                <Text style={styles.lastSyncText}>
                  Last sync: {formatTimestamp(lastSyncTime)}
                </Text>
              )}
            </View>

            {/* Sync Progress */}
            {isSyncing && (
              <View style={styles.syncProgress}>
                <Text style={styles.syncProgressText}>Syncing...</Text>
                <ProgressBar indeterminate color="#2196F3" style={styles.progressBar} />
              </View>
            )}

            {/* Sync Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{syncStats.totalOperations}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#FF9800' }]}>
                  {syncStats.totalOperations - syncStats.failedOperations}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#F44336' }]}>
                  {syncStats.failedOperations}
                </Text>
                <Text style={styles.statLabel}>Failed</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={handleManualSync}
                disabled={!isOnline || isSyncing}
                style={styles.actionButton}
              >
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              
              {syncStats.failedOperations > 0 && (
                <Button
                  mode="outlined"
                  onPress={handleClearFailedOperations}
                  style={styles.actionButton}
                >
                  Clear Failed
                </Button>
              )}
            </View>

            {/* Sync Queue */}
            <View style={styles.queueContainer}>
              <Text style={styles.queueTitle}>Sync Queue</Text>
              <FlatList
                data={syncQueue}
                renderItem={renderSyncItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.queueList}
                ListEmptyComponent={renderEmptyQueue}
                showsVerticalScrollIndicator={false}
                maxHeight={300}
              />
            </View>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    margin: 20,
  },
  modalCard: {
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  connectionText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  lastSyncText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 'auto',
  },
  syncProgress: {
    marginBottom: 16,
  },
  syncProgressText: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  queueContainer: {
    flex: 1,
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  queueList: {
    maxHeight: 300,
  },
  syncItem: {
    marginBottom: 8,
    elevation: 2,
  },
  syncItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  syncItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  syncItemTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  syncItemAttempts: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 4,
  },
  syncItemError: {
    fontSize: 12,
    color: '#F44336',
    marginBottom: 4,
  },
  syncItemData: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default SyncStatusModal;
