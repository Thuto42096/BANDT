import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

function Inventory({ inventory, onUpdate }) {
  const [newItem, setNewItem] = useState({ name: '', price: '', quantity: '' });
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categorizeInventory = () => {
    const categories = {
      'Food & Drinks': ['bread', 'milk', 'coca', 'cola', 'chips', 'sweets', 'chicken', 'meat', 'fish', 'rice', 'maize', 'sugar', 'tea', 'coffee', 'juice', 'water', 'biscuits', 'cake'],
      'Airtime & Data': ['airtime', 'data', 'voucher', 'recharge', 'top up', 'credit'],
      'Cigarettes': ['cigarettes', 'tobacco', 'smoke', 'lighter'],
      'Household': ['soap', 'detergent', 'candles', 'matches', 'toilet paper', 'cleaning', 'washing powder'],
      'Other': []
    };
    
    const categorized = { 'All': inventory };
    
    Object.keys(categories).forEach(category => {
      categorized[category] = inventory.filter(item => {
        const itemName = item.name.toLowerCase();
        return categories[category].some(keyword => 
          itemName.includes(keyword.toLowerCase())
        );
      });
    });
    
    // Add uncategorized items to 'Other'
    const categorizedItems = Object.values(categorized).flat().filter(item => item);
    const uniqueCategorizedIds = new Set();
    Object.keys(categories).forEach(cat => {
      if (cat !== 'Other') {
        categorized[cat].forEach(item => uniqueCategorizedIds.add(item.id));
      }
    });
    
    categorized['Other'] = inventory.filter(item => 
      !uniqueCategorizedIds.has(item.id)
    );
    
    return categorized;
  };

  const categorizedInventory = categorizeInventory();
  const displayedItems = categorizedInventory[selectedCategory] || [];

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API_BASE}/inventory`, {
        name: newItem.name,
        price: parseFloat(newItem.price),
        quantity: parseInt(newItem.quantity)
      });
      
      setMessage('Item added successfully');
      setNewItem({ name: '', price: '', quantity: '' });
      onUpdate();
    } catch (error) {
      setMessage('Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_BASE}/inventory/${itemId}`);
        setMessage('Item deleted successfully');
        onUpdate();
      } catch (error) {
        setMessage('Failed to delete item');
      }
    }
  };

  const handleRefillItem = async (itemId) => {
    const quantity = prompt('How many items to add to stock?');
    if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
      try {
        const response = await axios.post(`${API_BASE}/inventory/refill`, {
          item_id: itemId,
          quantity: parseInt(quantity)
        });
        setMessage(response.data.message || `Added ${quantity} items to stock`);
        // Force refresh by calling onUpdate multiple times
        setTimeout(() => {
          onUpdate();
          setTimeout(() => onUpdate(), 100);
        }, 100);
      } catch (error) {
        setMessage('Failed to refill item');
      }
    }
  };

  const handleUpdatePrice = async (itemId, currentPrice) => {
    const newPrice = prompt(`Enter new price (current: R${currentPrice}):`);
    if (newPrice && !isNaN(newPrice) && parseFloat(newPrice) > 0) {
      try {
        const response = await axios.post(`${API_BASE}/inventory/update-price`, {
          item_id: itemId,
          price: parseFloat(newPrice)
        });
        setMessage(response.data.message || `Updated price to R${newPrice}`);
        setTimeout(() => {
          onUpdate();
          setTimeout(() => onUpdate(), 100);
        }, 100);
      } catch (error) {
        setMessage('Failed to update price');
      }
    }
  };

  return (
    <div className="inventory-container">
      <h2>Inventory Management</h2>
      
      <form onSubmit={handleAddItem} className="add-item-form">
        <h3>Add New Item</h3>
        <div className="form-row">
          <input 
            type="text" 
            placeholder="Item name"
            value={newItem.name}
            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            required
          />
          <input 
            type="number" 
            placeholder="Price (R)"
            value={newItem.price}
            onChange={(e) => setNewItem({...newItem, price: e.target.value})}
            step="0.01"
            required
          />
          <input 
            type="number" 
            placeholder="Quantity"
            value={newItem.quantity}
            onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
            required
          />
          <button type="submit">Add Item</button>
        </div>
      </form>

      {message && <div className="message">{message}</div>}

      <div className="inventory-list">
        <div className="inventory-header">
          <h3>Current Inventory</h3>
          <div className="category-filter">
            <label>Filter by Category:</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {Object.keys(categorizedInventory).map(category => (
                <option key={category} value={category}>
                  {category} ({categorizedInventory[category].length})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>R{item.price}</td>
                <td>{item.quantity}</td>
                <td className={item.quantity < 5 ? 'low-stock' : 'in-stock'}>
                  {item.quantity < 5 ? 'Low Stock' : 'In Stock'}
                </td>
                <td>
                  <button 
                    className="refill-btn"
                    onClick={() => handleRefillItem(item.id)}
                  >
                    📦 Refill
                  </button>
                  <button 
                    className="update-price-btn"
                    onClick={() => handleUpdatePrice(item.id, item.price)}
                  >
                    💰 Price
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
            {displayedItems.length === 0 && (
              <tr>
                <td colSpan="5" className="no-items">
                  No items in {selectedCategory} category
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventory;