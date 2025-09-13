import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Button,
  Title,
  Chip,
  Portal,
  Dialog,
  FAB,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useApp } from '../context/AppContext';

const InventoryScreen = () => {
  const { state, actions } = useApp();
  const { inventory, isOnline } = state;
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    quantity: '',
    category: 'Other'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'Food & Drinks',
    'Airtime & Data',
    'Cigarettes',
    'Household',
    'Other'
  ];

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (isOnline) {
        await actions.syncNow();
      }
    } catch (error) {
      Alert.alert('Refresh Failed', error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const { name, price, quantity, category } = newItem;
      
      if (!name.trim() || !price || !quantity) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      const priceNum = parseFloat(price);
      const quantityNum = parseInt(quantity);

      if (priceNum <= 0 || quantityNum <= 0) {
        Alert.alert('Error', 'Price and quantity must be greater than 0');
        return;
      }

      await actions.addInventoryItem({
        name: name.trim(),
        price: priceNum,
        quantity: quantityNum,
        category
      });

      setNewItem({ name: '', price: '', quantity: '', category: 'Other' });
      setShowAddDialog(false);
      Alert.alert('Success', 'Item added successfully');

    } catch (error) {
      Alert.alert('Error', 'Failed to add item: ' + error.message);
    }
  };

  const handleDeleteItem = (item) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await actions.deleteInventoryItem(item.id);
              Alert.alert('Success', 'Item deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: 'Out of Stock', color: '#F44336' };
    if (quantity < 5) return { label: 'Low Stock', color: '#FF9800' };
    return { label: 'In Stock', color: '#4CAF50' };
  };

  const renderInventoryItem = ({ item }) => {
    const stockStatus = getStockStatus(item.quantity);
    
    return (
      <Card style={styles.itemCard}>
        <Card.Content>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(item)}
            >
              <Icon name="delete" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.itemDetails}>
            <View style={styles.priceQuantityRow}>
              <Text style={styles.itemPrice}>R{item.price.toFixed(2)}</Text>
              <Text style={styles.itemQuantity}>{item.quantity} units</Text>
            </View>
            
            <Chip
              mode="outlined"
              style={[styles.statusChip, { borderColor: stockStatus.color }]}
              textStyle={{ color: stockStatus.color }}
            >
              {stockStatus.label}
            </Chip>
          </View>
          
          {!item.synced && !isOnline && (
            <View style={styles.syncStatus}>
              <Icon name="cloud-off" size={16} color="#FF9800" />
              <Text style={styles.syncText}>Pending sync</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="inventory" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No inventory items</Text>
      <Text style={styles.emptySubtext}>Tap the + button to add your first item</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search inventory..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Inventory Stats */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{inventory.length}</Text>
              <Text style={styles.statLabel}>Total Items</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {inventory.filter(item => item.quantity < 5).length}
              </Text>
              <Text style={styles.statLabel}>Low Stock</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {inventory.filter(item => item.quantity === 0).length}
              </Text>
              <Text style={styles.statLabel}>Out of Stock</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Inventory List */}
      <FlatList
        data={filteredInventory}
        renderItem={renderInventoryItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Item FAB */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddDialog(true)}
      />

      {/* Add Item Dialog */}
      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)}>
          <Dialog.Title>Add New Item</Dialog.Title>
          <Dialog.Content>
            <TextInput
              style={styles.input}
              placeholder="Item name"
              value={newItem.name}
              onChangeText={(text) => setNewItem({ ...newItem, name: text })}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Price (R)"
              value={newItem.price}
              onChangeText={(text) => setNewItem({ ...newItem, price: text })}
              keyboardType="numeric"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              value={newItem.quantity}
              onChangeText={(text) => setNewItem({ ...newItem, quantity: text })}
              keyboardType="numeric"
            />

            <Text style={styles.categoryLabel}>Category:</Text>
            <View style={styles.categoryContainer}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    newItem.category === category && styles.categoryChipSelected
                  ]}
                  onPress={() => setNewItem({ ...newItem, category })}
                >
                  <Text style={[
                    styles.categoryChipText,
                    newItem.category === category && styles.categoryChipTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onPress={handleAddItem}>Add Item</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemCard: {
    marginBottom: 12,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceQuantityRow: {
    flex: 1,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  syncText: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  categoryChipSelected: {
    backgroundColor: '#2196F3',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#666',
  },
  categoryChipTextSelected: {
    color: 'white',
  },
});

export default InventoryScreen;
