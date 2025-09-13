import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

function POS({ inventory, onSale }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [message, setMessage] = useState('');
  const [salesHistory, setSalesHistory] = useState([]);

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  const fetchSalesHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/sales-history`);
      setSalesHistory(response.data);
    } catch (error) {
      console.error('Error fetching sales history:', error);
    }
  };

  const getSelectedItemPrice = () => {
    return selectedItem ? selectedItem.price : 0;
  };

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
    return getSelectedItemPrice() * quantity;
  };

  const calculateChange = () => {
    const total = calculateTotal();
    const received = parseFloat(amountReceived) || 0;
    return received - total;
  };

  const handleSale = async (e) => {
    e.preventDefault();
    
    // Validate cash payment
    if (paymentMethod === 'cash') {
      const change = calculateChange();
      if (change < 0) {
        setMessage('Insufficient payment received');
        return;
      }
    }
    
    try {
      const response = await axios.post(`${API_BASE}/sell`, {
        item_name: selectedItem.name,
        quantity: parseInt(quantity),
        payment_method: paymentMethod,
        amount_received: paymentMethod === 'cash' ? parseFloat(amountReceived) : calculateTotal(),
        change: paymentMethod === 'cash' ? calculateChange() : 0
      });
      
      if (paymentMethod === 'cash' && calculateChange() > 0) {
        setMessage(`${response.data.message} - Change: R${calculateChange().toFixed(2)}`);
      } else {
        setMessage(response.data.message);
      }
      
      setSelectedItem(null);
      setSelectedCategory('');
      setQuantity(1);
      setAmountReceived('');
      fetchSalesHistory();
      onSale();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Sale failed');
    }
  };

  const getTodaysSales = () => {
    const today = new Date().toDateString();
    return salesHistory.filter(sale => new Date(sale.timestamp).toDateString() === today).length;
  };

  const getDigitalPaymentsToday = () => {
    const today = new Date().toDateString();
    return salesHistory.filter(sale => 
      new Date(sale.timestamp).toDateString() === today && 
      sale.payment_method !== 'cash'
    ).length;
  };

  const getTodaysSalesValue = () => {
    const today = new Date().toDateString();
    return salesHistory
      .filter(sale => new Date(sale.timestamp).toDateString() === today)
      .reduce((sum, sale) => sum + sale.total, 0);
  };

  const missions = [
    {
      id: 'daily_sales',
      title: '🎯 Daily Hustle',
      description: 'Complete 5 transactions',
      progress: Math.min(getTodaysSales(), 5),
      target: 5,
      reward: '50 XP'
    },
    {
      id: 'digital_payment',
      title: '📱 Go Digital',
      description: 'Accept 3 mobile payments',
      progress: getDigitalPaymentsToday(),
      target: 3,
      reward: '30 XP'
    },
    {
      id: 'daily_target',
      title: '💰 Daily Target',
      description: 'Reach R200 in sales',
      progress: Math.min(getTodaysSalesValue(), 200),
      target: 200,
      reward: '75 XP'
    }
  ];

  return (
    <div className="pos-layout">
      <div className="pos-main">
        <h2>Point of Sale</h2>
        
        <div className="pos-interface">
          <div className="categories-section">
            <h3>Categories</h3>
            <div className="categories-grid">
              {Object.keys(categories).map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                  type="button"
                >
                  {category}
                  <span className="item-count">({categories[category].length})</span>
                </button>
              ))}
            </div>
          </div>
          
          {selectedCategory && (
            <div className="items-section">
              <h3>{selectedCategory} Items</h3>
              <div className="items-grid">
                {categories[selectedCategory].map(item => (
                  <button
                    key={item.id}
                    className={`item-btn ${selectedItem?.id === item.id ? 'selected' : ''}`}
                    onClick={() => setSelectedItem(item)}
                    type="button"
                    disabled={item.quantity === 0}
                  >
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">R{item.price}</div>
                    <div className="item-stock">{item.quantity} in stock</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {selectedItem && (
          <form onSubmit={handleSale} className="pos-form">
            <div className="selected-item-info">
              <h3>Selected: {selectedItem.name}</h3>
              <p>Price: R{selectedItem.price} | Stock: {selectedItem.quantity}</p>
            </div>

            <div className="form-group">
              <label>Quantity:</label>
              <input 
                type="number" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                max={selectedItem.quantity}
                required
              />
            </div>

            <div className="form-group">
              <label>Payment Method:</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="qr_code">QR Code</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div className="transaction-summary">
              <div className="total-display">
                <strong>Total: R{calculateTotal().toFixed(2)}</strong>
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div className="form-group">
                <label>Amount Received:</label>
                <input 
                  type="number" 
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)}
                  placeholder="Enter amount received"
                  step="0.01"
                />
                {amountReceived && (
                  <div className="change-display">
                    <strong>Change: R{calculateChange().toFixed(2)}</strong>
                    {calculateChange() < 0 && (
                      <span className="insufficient-payment"> (Insufficient payment)</span>
                    )}
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit" 
              className="sale-btn"
              disabled={paymentMethod === 'cash' && calculateChange() < 0}
            >
              Process Sale
            </button>
          </form>
        )}

        {message && (
          <div className={`message ${message.includes('error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
      
      <div className="missions-sidebar">
        <h3>🎮 Daily Missions</h3>
        <div className="missions-mini">
          {missions.map(mission => (
            <div key={mission.id} className="mission-mini">
              <div className="mission-mini-header">
                <span className="mission-mini-title">{mission.title}</span>
                {mission.progress >= mission.target && <span className="mission-complete-mini">✅</span>}
              </div>
              <p className="mission-mini-desc">{mission.description}</p>
              <div className="mission-mini-progress">
                <div className="progress-bar-mini">
                  <div 
                    className="progress-fill-mini"
                    style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                  ></div>
                </div>
                <span className="progress-text-mini">
                  {typeof mission.progress === 'number' && mission.target === 200 
                    ? `R${mission.progress}/R${mission.target}`
                    : `${mission.progress}/${mission.target}`
                  }
                </span>
              </div>
              <div className="mission-reward-mini">{mission.reward}</div>
            </div>
          ))}
        </div>
        
        <div className="daily-stats">
          <h4>📊 Today's Stats</h4>
          <div className="stat-item">
            <span>Sales:</span>
            <span>{getTodaysSales()}</span>
          </div>
          <div className="stat-item">
            <span>Revenue:</span>
            <span>R{getTodaysSalesValue().toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span>Digital:</span>
            <span>{getDigitalPaymentsToday()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default POS;