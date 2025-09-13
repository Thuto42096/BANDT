import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

function Inventory({ inventory, onUpdate }) {
  const [newItem, setNewItem] = useState({ name: '', price: '', quantity: '' });
  const [message, setMessage] = useState('');

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
        <h3>Current Inventory</h3>
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
            {inventory.map(item => (
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
                    className="delete-btn"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventory;