import { Alert, PermissionsAndroid, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

class DeviceService {
  constructor() {
    this.notificationChannelCreated = false;
    this.cameraPermissionGranted = false;
  }

  async initialize() {
    try {
      await this.setupNotifications();
      await this.requestPermissions();
      console.log('DeviceService initialized');
    } catch (error) {
      console.error('Failed to initialize DeviceService:', error);
    }
  }

  // Notification Management
  async setupNotifications() {
    try {
      PushNotification.configure({
        onRegister: function (token) {
          console.log('TOKEN:', token);
        },
        onNotification: function (notification) {
          console.log('NOTIFICATION:', notification);
        },
        onAction: function (notification) {
          console.log('ACTION:', notification.action);
          console.log('NOTIFICATION:', notification);
        },
        onRegistrationError: function(err) {
          console.error(err.message, err);
        },
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: true,
        requestPermissions: true,
      });

      // Create notification channel for Android
      if (Platform.OS === 'android') {
        PushNotification.createChannel(
          {
            channelId: 'township-pos-alerts',
            channelName: 'Township POS Alerts',
            channelDescription: 'Notifications for inventory alerts and business updates',
            playSound: true,
            soundName: 'default',
            importance: 4,
            vibrate: true,
          },
          (created) => {
            this.notificationChannelCreated = created;
            console.log(`Notification channel created: ${created}`);
          }
        );
      }

      this.notificationChannelCreated = true;
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  }

  async sendLocalNotification(title, message, data = {}) {
    try {
      PushNotification.localNotification({
        channelId: 'township-pos-alerts',
        title,
        message,
        playSound: true,
        soundName: 'default',
        actions: ['View'],
        userInfo: data,
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async scheduleNotification(title, message, date, data = {}) {
    try {
      PushNotification.localNotificationSchedule({
        channelId: 'township-pos-alerts',
        title,
        message,
        date,
        playSound: true,
        soundName: 'default',
        actions: ['View'],
        userInfo: data,
      });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  // Low Stock Alerts
  async checkLowStockAlerts(inventory) {
    try {
      const lowStockItems = inventory.filter(item => item.quantity < 5 && item.quantity > 0);
      const outOfStockItems = inventory.filter(item => item.quantity === 0);

      // Check if we've already sent alerts today
      const today = new Date().toDateString();
      const lastAlertDate = await AsyncStorage.getItem('last_stock_alert_date');

      if (lastAlertDate !== today) {
        if (lowStockItems.length > 0) {
          await this.sendLocalNotification(
            'Low Stock Alert',
            `${lowStockItems.length} items are running low. Check your inventory.`,
            { type: 'low_stock', items: lowStockItems }
          );
        }

        if (outOfStockItems.length > 0) {
          await this.sendLocalNotification(
            'Out of Stock Alert',
            `${outOfStockItems.length} items are out of stock. Restock needed.`,
            { type: 'out_of_stock', items: outOfStockItems }
          );
        }

        // Update last alert date
        await AsyncStorage.setItem('last_stock_alert_date', today);
      }
    } catch (error) {
      console.error('Failed to check low stock alerts:', error);
    }
  }

  // Daily Sales Reminders
  async scheduleDailySalesReminder() {
    try {
      const reminderTime = new Date();
      reminderTime.setHours(18, 0, 0, 0); // 6 PM

      // If it's already past 6 PM today, schedule for tomorrow
      if (reminderTime <= new Date()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      await this.scheduleNotification(
        'Daily Sales Summary',
        'Check your daily sales performance and credit score progress!',
        reminderTime,
        { type: 'daily_reminder' }
      );
    } catch (error) {
      console.error('Failed to schedule daily reminder:', error);
    }
  }

  // Camera and Barcode Scanning
  async requestCameraPermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Township POS needs camera access to scan barcodes',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        this.cameraPermissionGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.IOS.CAMERA);
        this.cameraPermissionGranted = result === RESULTS.GRANTED;
      }

      return this.cameraPermissionGranted;
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      return false;
    }
  }

  async checkCameraPermission() {
    try {
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        this.cameraPermissionGranted = result;
      } else {
        const result = await check(PERMISSIONS.IOS.CAMERA);
        this.cameraPermissionGranted = result === RESULTS.GRANTED;
      }

      return this.cameraPermissionGranted;
    } catch (error) {
      console.error('Failed to check camera permission:', error);
      return false;
    }
  }

  // Storage Management
  async getStorageInfo() {
    try {
      // Get app storage usage
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return {
        totalKeys: keys.length,
        estimatedSize: totalSize,
        formattedSize: this.formatBytes(totalSize),
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }

  async clearAppCache() {
    try {
      // Clear non-essential cached data
      const keysToKeep = [
        'app_state',
        'optimistic_updates',
        'last_sync_time',
        'user_preferences',
      ];

      const allKeys = await AsyncStorage.getAllKeys();
      const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`Cleared ${keysToRemove.length} cache entries`);
      }

      return keysToRemove.length;
    } catch (error) {
      console.error('Failed to clear app cache:', error);
      return 0;
    }
  }

  // Device Information
  async getDeviceInfo() {
    try {
      const deviceInfo = {
        platform: Platform.OS,
        version: Platform.Version,
        isTablet: Platform.isPad || (Platform.OS === 'android' && Platform.constants.uiMode === 'tablet'),
      };

      return deviceInfo;
    } catch (error) {
      console.error('Failed to get device info:', error);
      return null;
    }
  }

  // Backup and Restore
  async createDataBackup() {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {}
      };

      // Get all app data
      const keys = await AsyncStorage.getAllKeys();
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          backupData.data[key] = value;
        }
      }

      // Store backup
      const backupKey = `backup_${Date.now()}`;
      await AsyncStorage.setItem(backupKey, JSON.stringify(backupData));

      return {
        success: true,
        backupKey,
        size: JSON.stringify(backupData).length,
      };
    } catch (error) {
      console.error('Failed to create backup:', error);
      return { success: false, error: error.message };
    }
  }

  async restoreDataBackup(backupKey) {
    try {
      const backupJson = await AsyncStorage.getItem(backupKey);
      if (!backupJson) {
        throw new Error('Backup not found');
      }

      const backupData = JSON.parse(backupJson);
      
      // Restore data
      for (const [key, value] of Object.entries(backupData.data)) {
        await AsyncStorage.setItem(key, value);
      }

      return { success: true, timestamp: backupData.timestamp };
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return { success: false, error: error.message };
    }
  }

  async getAvailableBackups() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const backupKeys = keys.filter(key => key.startsWith('backup_'));
      
      const backups = [];
      for (const key of backupKeys) {
        const backupJson = await AsyncStorage.getItem(key);
        if (backupJson) {
          const backup = JSON.parse(backupJson);
          backups.push({
            key,
            timestamp: backup.timestamp,
            size: backupJson.length,
          });
        }
      }

      return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Failed to get available backups:', error);
      return [];
    }
  }

  // Permissions Management
  async requestPermissions() {
    try {
      const permissions = [];

      // Camera permission for barcode scanning
      if (!(await this.checkCameraPermission())) {
        permissions.push('camera');
      }

      // Request permissions if needed
      if (permissions.length > 0) {
        const results = await Promise.all([
          permissions.includes('camera') ? this.requestCameraPermission() : Promise.resolve(true),
        ]);

        console.log('Permission results:', results);
      }
    } catch (error) {
      console.error('Failed to request permissions:', error);
    }
  }

  // Utility Methods
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  // Cleanup
  destroy() {
    PushNotification.cancelAllLocalNotifications();
  }
}

export default new DeviceService();
