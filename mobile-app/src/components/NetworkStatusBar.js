import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Banner, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';
import { useApp } from '../context/AppContext';

const NetworkStatusBar = () => {
  const { state, actions } = useApp();
  const { isOnline, isSyncing, pendingSyncCount, lastSyncTime } = state;
  
  const [showBanner, setShowBanner] = useState(false);
  const [networkType, setNetworkType] = useState('unknown');
  const [connectionQuality, setConnectionQuality] = useState('unknown');
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkType(state.type);
      setConnectionQuality(state.details?.strength || 'unknown');
      
      // Show banner when going offline or coming back online
      if (!state.isConnected || !state.isInternetReachable) {
        setShowBanner(true);
        slideDown();
      } else if (showBanner && !isOnline) {
        // Just came back online
        setTimeout(() => {
          setShowBanner(false);
          slideUp();
        }, 3000); // Show "back online" message for 3 seconds
      }
    });

    return unsubscribe;
  }, [isOnline, showBanner]);

  const slideDown = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const slideUp = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowBanner(false));
  };

  const handleManualSync = async () => {
    try {
      await actions.syncNow();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const getConnectionIcon = () => {
    if (!isOnline) return 'cloud-off';
    if (isSyncing) return 'sync';
    if (networkType === 'wifi') return 'wifi';
    if (networkType === 'cellular') return 'signal-cellular-4-bar';
    return 'cloud-done';
  };

  const getConnectionColor = () => {
    if (!isOnline) return '#F44336';
    if (isSyncing) return '#FF9800';
    return '#4CAF50';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Working Offline';
    if (isSyncing) return 'Syncing...';
    if (pendingSyncCount > 0) return `${pendingSyncCount} pending`;
    return 'Online';
  };

  const formatLastSyncTime = () => {
    if (!lastSyncTime) return 'Never synced';
    
    const now = new Date();
    const syncTime = new Date(lastSyncTime);
    const diffMinutes = Math.floor((now - syncTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (!showBanner && isOnline && !isSyncing && pendingSyncCount === 0) {
    return null; // Don't show anything when everything is normal
  }

  return (
    <>
      {/* Persistent Status Indicator */}
      <View style={styles.statusIndicator}>
        <Icon 
          name={getConnectionIcon()} 
          size={16} 
          color={getConnectionColor()}
          style={isSyncing ? styles.syncingIcon : null}
        />
        <Text style={[styles.statusText, { color: getConnectionColor() }]}>
          {getStatusText()}
        </Text>
        
        {isOnline && !isSyncing && pendingSyncCount === 0 && (
          <Text style={styles.lastSyncText}>
            {formatLastSyncTime()}
          </Text>
        )}
        
        {isOnline && pendingSyncCount > 0 && (
          <TouchableOpacity 
            style={styles.syncButton}
            onPress={handleManualSync}
            disabled={isSyncing}
          >
            <Icon name="sync" size={14} color="#2196F3" />
          </TouchableOpacity>
        )}
      </View>

      {/* Offline Banner */}
      {showBanner && (
        <Animated.View 
          style={[
            styles.bannerContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Banner
            visible={true}
            actions={[
              isOnline && pendingSyncCount > 0 ? {
                label: 'Sync Now',
                onPress: handleManualSync,
                disabled: isSyncing,
              } : null,
              {
                label: 'Dismiss',
                onPress: () => {
                  setShowBanner(false);
                  slideUp();
                },
              },
            ].filter(Boolean)}
            icon={({ size }) => (
              <Icon 
                name={getConnectionIcon()} 
                size={size} 
                color={getConnectionColor()} 
              />
            )}
            style={[
              styles.banner,
              { backgroundColor: isOnline ? '#E8F5E8' : '#FFEBEE' }
            ]}
          >
            {!isOnline ? (
              <View>
                <Text style={styles.bannerTitle}>Working Offline</Text>
                <Text style={styles.bannerSubtitle}>
                  Your changes will sync when connection is restored
                  {pendingSyncCount > 0 && ` (${pendingSyncCount} pending)`}
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.bannerTitle}>Back Online!</Text>
                <Text style={styles.bannerSubtitle}>
                  {isSyncing 
                    ? 'Syncing your changes...' 
                    : pendingSyncCount > 0 
                      ? `${pendingSyncCount} changes ready to sync`
                      : 'All data is up to date'
                  }
                </Text>
              </View>
            )}
          </Banner>
        </Animated.View>
      )}

      {/* Sync Progress Indicator */}
      {isSyncing && (
        <View style={styles.syncProgress}>
          <View style={styles.syncProgressBar}>
            <Animated.View style={styles.syncProgressFill} />
          </View>
          <Text style={styles.syncProgressText}>
            Syncing data...
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  lastSyncText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 8,
  },
  syncButton: {
    marginLeft: 8,
    padding: 4,
  },
  syncingIcon: {
    // Add rotation animation if needed
  },
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  banner: {
    elevation: 8,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  syncProgress: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  syncProgressBar: {
    height: 3,
    backgroundColor: '#BBDEFB',
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  syncProgressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    width: '100%',
    // Add animation for indeterminate progress
  },
  syncProgressText: {
    fontSize: 11,
    color: '#1976D2',
    textAlign: 'center',
  },
});

export default NetworkStatusBar;
