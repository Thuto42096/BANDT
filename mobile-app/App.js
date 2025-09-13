import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StatusBar, Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Import screens
import POSScreen from './src/screens/POSScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import GamificationScreen from './src/screens/GamificationScreen';

// Import services
import DatabaseService from './src/services/DatabaseService';
import SyncService from './src/services/SyncService';
import { AppProvider } from './src/context/AppContext';

const Tab = createBottomTabNavigator();

const App = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
    setupNetworkListener();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await DatabaseService.initDatabase();
      
      // Initialize sync service
      await SyncService.initialize();
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      Alert.alert('Initialization Error', 'Failed to initialize the app. Please restart.');
    }
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isOnline;
      const isNowOnline = state.isConnected && state.isInternetReachable;
      
      setIsOnline(isNowOnline);
      
      // If we just came back online, trigger sync
      if (wasOffline && isNowOnline) {
        SyncService.syncAll();
      }
    });

    return unsubscribe;
  };

  if (!isInitialized) {
    return null; // You can add a loading screen here
  }

  return (
    <PaperProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'POS') {
                  iconName = 'point-of-sale';
                } else if (route.name === 'Inventory') {
                  iconName = 'inventory';
                } else if (route.name === 'Dashboard') {
                  iconName = 'dashboard';
                } else if (route.name === 'Game') {
                  iconName = 'games';
                }

                return <Icon name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#2196F3',
              tabBarInactiveTintColor: 'gray',
              headerStyle: {
                backgroundColor: '#2196F3',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}
          >
            <Tab.Screen 
              name="POS" 
              component={POSScreen}
              options={{ title: 'Point of Sale' }}
            />
            <Tab.Screen 
              name="Inventory" 
              component={InventoryScreen}
              options={{ title: 'Inventory' }}
            />
            <Tab.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ title: 'Dashboard' }}
            />
            <Tab.Screen 
              name="Game" 
              component={GamificationScreen}
              options={{ title: 'Game' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </AppProvider>
    </PaperProvider>
  );
};

export default App;
