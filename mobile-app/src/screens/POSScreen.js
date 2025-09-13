import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import {
  Card,
  Button,
  Title,
  Chip,
  Portal,
  Dialog,
  RadioButton,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useApp } from '../context/AppContext';

const POSScreen = () => {
  const { state, actions } = useApp();
  const { inventory, salesHistory } = state;
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [message, setMessage] = useState('');

  const categorizeInventory = () => {
    const categories = {
      'Food & Drinks': ['Bread', 'Milk', 'Coca Cola', 'Chips', 'Sweets'],
      'Airtime & Data': ['Airtime R10', 'Airtime R20', 'Airtime R50', 'Data'],
      'Cigarettes': ['Cigarettes', 'Tobacco'],
      'Household': ['Soap', 'Detergent', 'Candles'],
      'Other': []
    };
    
    const categorized = {};
    
    Object.keys(categories).forEach(category => {
      categorized[category] = inventory.filter(item => 
        categories[category].some(catItem => item.name.includes(catItem))
      );
    });
    
    // Add uncategorized items to 'Other'
    const categorizedItems = Object.values(categorized).flat();
    categorized['Other'] = inventory.filter(item => 
      !categorizedItems.some(catItem => catItem.id === item.id)
    );
    
    return categorized;
  };

  const categories = categorizeInventory();

  const calculateTotal = () => {
    if (!selectedItem) return 0;
    return selectedItem.price * parseInt(quantity || '1');
  };

  const calculateChange = () => {
    const total = calculateTotal();
    const received = parseFloat(amountReceived) || 0;
    return received - total;
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setQuantity('1');
    setAmountReceived('');
    setMessage('');
  };

  const handleProcessSale = () => {
    if (!selectedItem) {
      Alert.alert('Error', 'Please select an item');
      return;
    }

    const qty = parseInt(quantity);
    if (qty <= 0 || qty > selectedItem.quantity) {
      Alert.alert('Error', 'Invalid quantity');
      return;
    }

    setShowPaymentDialog(true);
  };

  const confirmSale = async () => {
    try {
      // Validate cash payment
      if (paymentMethod === 'cash') {
        const change = calculateChange();
        if (change < 0) {
          Alert.alert('Error', 'Insufficient payment received');
          return;
        }
      }

      const saleData = {
        item_name: selectedItem.name,
        item_id: selectedItem.id,
        quantity: parseInt(quantity),
        payment_method: paymentMethod,
        amount_received: paymentMethod === 'cash' ? parseFloat(amountReceived) : calculateTotal(),
      };

      await actions.processSale(saleData);

      const total = calculateTotal();
      const change = paymentMethod === 'cash' ? calculateChange() : 0;
      
      let successMessage = `Sold ${quantity} x ${selectedItem.name} for R${total.toFixed(2)}`;
      if (change > 0) {
        successMessage += ` - Change: R${change.toFixed(2)}`;
      }

      setMessage(successMessage);
      setShowPaymentDialog(false);
      resetForm();

      // Show success alert
      Alert.alert('Sale Completed', successMessage);

    } catch (error) {
      Alert.alert('Sale Failed', error.message);
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setSelectedCategory('');
    setQuantity('1');
    setAmountReceived('');
    setPaymentMethod('cash');
  };

  const getTodaysSales = () => {
    const today = new Date().toDateString();
    return salesHistory.filter(sale => 
      new Date(sale.timestamp).toDateString() === today
    ).length;
  };

  const getTodaysSalesValue = () => {
    const today = new Date().toDateString();
    return salesHistory
      .filter(sale => new Date(sale.timestamp).toDateString() === today)
      .reduce((sum, sale) => sum + sale.total, 0);
  };

  const getDigitalPaymentsToday = () => {
    const today = new Date().toDateString();
    return salesHistory.filter(sale => 
      new Date(sale.timestamp).toDateString() === today && 
      sale.payment_method !== 'cash'
    ).length;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Today's Stats */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title>Today's Performance</Title>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{getTodaysSales()}</Text>
                <Text style={styles.statLabel}>Sales</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>R{getTodaysSalesValue().toFixed(2)}</Text>
                <Text style={styles.statLabel}>Revenue</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{getDigitalPaymentsToday()}</Text>
                <Text style={styles.statLabel}>Digital</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Categories */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Categories</Title>
            <View style={styles.categoriesGrid}>
              {Object.keys(categories).map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive
                  ]}>
                    {category}
                  </Text>
                  <Text style={styles.itemCount}>({categories[category].length})</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Items */}
        {selectedCategory && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{selectedCategory} Items</Title>
              <View style={styles.itemsGrid}>
                {categories[selectedCategory].map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.itemButton,
                      selectedItem?.id === item.id && styles.itemButtonSelected,
                      item.quantity === 0 && styles.itemButtonDisabled
                    ]}
                    onPress={() => handleItemSelect(item)}
                    disabled={item.quantity === 0}
                  >
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>R{item.price}</Text>
                    <Text style={[
                      styles.itemStock,
                      item.quantity < 5 && styles.lowStock
                    ]}>
                      {item.quantity} in stock
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Selected Item */}
        {selectedItem && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Selected Item</Title>
              <View style={styles.selectedItemInfo}>
                <Text style={styles.selectedItemName}>{selectedItem.name}</Text>
                <Text style={styles.selectedItemDetails}>
                  Price: R{selectedItem.price} | Stock: {selectedItem.quantity}
                </Text>
              </View>

              <View style={styles.quantityContainer}>
                <Text style={styles.label}>Quantity:</Text>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="1"
                />
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>
                  Total: R{calculateTotal().toFixed(2)}
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={handleProcessSale}
                style={styles.processButton}
                disabled={!selectedItem || parseInt(quantity) <= 0}
              >
                Process Sale
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Message */}
        {message && (
          <Card style={[styles.card, styles.messageCard]}>
            <Card.Content>
              <Text style={styles.messageText}>{message}</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Payment Dialog */}
      <Portal>
        <Dialog visible={showPaymentDialog} onDismiss={() => setShowPaymentDialog(false)}>
          <Dialog.Title>Payment Details</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogTotal}>
              Total: R{calculateTotal().toFixed(2)}
            </Text>

            <Text style={styles.label}>Payment Method:</Text>
            <RadioButton.Group
              onValueChange={setPaymentMethod}
              value={paymentMethod}
            >
              <TouchableOpacity style={styles.radioOption} onPress={() => setPaymentMethod('cash')}>
                <RadioButton value="cash" />
                <Text>Cash</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption} onPress={() => setPaymentMethod('mobile_money')}>
                <RadioButton value="mobile_money" />
                <Text>Mobile Money</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption} onPress={() => setPaymentMethod('qr_code')}>
                <RadioButton value="qr_code" />
                <Text>QR Code</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.radioOption} onPress={() => setPaymentMethod('card')}>
                <RadioButton value="card" />
                <Text>Card</Text>
              </TouchableOpacity>
            </RadioButton.Group>

            {paymentMethod === 'cash' && (
              <View style={styles.cashPaymentContainer}>
                <Text style={styles.label}>Amount Received:</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amountReceived}
                  onChangeText={setAmountReceived}
                  keyboardType="numeric"
                  placeholder="Enter amount received"
                />
                {amountReceived && (
                  <Text style={[
                    styles.changeText,
                    calculateChange() < 0 && styles.insufficientPayment
                  ]}>
                    Change: R{calculateChange().toFixed(2)}
                    {calculateChange() < 0 && ' (Insufficient payment)'}
                  </Text>
                )}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button
              onPress={confirmSale}
              disabled={paymentMethod === 'cash' && calculateChange() < 0}
            >
              Confirm Sale
            </Button>
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
  scrollView: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  statsCard: {
    backgroundColor: '#E3F2FD',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  categoryButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    margin: 4,
    borderRadius: 8,
    minWidth: '45%',
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#2196F3',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  itemButton: {
    backgroundColor: 'white',
    padding: 12,
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: '45%',
    alignItems: 'center',
  },
  itemButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  itemButtonDisabled: {
    opacity: 0.5,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  itemStock: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  lowStock: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  selectedItemInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedItemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedItemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 12,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    width: 80,
    textAlign: 'center',
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  processButton: {
    marginTop: 8,
  },
  messageCard: {
    backgroundColor: '#E8F5E8',
  },
  messageText: {
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: '500',
  },
  dialogTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#4CAF50',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  cashPaymentContainer: {
    marginTop: 16,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  changeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  insufficientPayment: {
    color: '#F44336',
  },
});

export default POSScreen;
