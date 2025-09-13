import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Gamification from './components/Gamification';
import './App.css';

const API_BASE = 'http://localhost:5001/api';

function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [inventory, setInventory] = useState([]);
  const [creditScore, setCreditScore] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);

  useEffect(() => {
    fetchInventory();
    fetchCreditScore();
    fetchSalesHistory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/inventory`);
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const fetchCreditScore = async () => {
    try {
      const response = await axios.get(`${API_BASE}/credit-score`);
      setCreditScore(response.data);
    } catch (error) {
      console.error('Error fetching credit score:', error);
    }
  };

  const fetchSalesHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/sales-history`);
      setSalesHistory(response.data);
    } catch (error) {
      console.error('Error fetching sales history:', error);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Township POS System</h1>
        <nav>
          <button 
            className={activeTab === 'pos' ? 'active' : ''} 
            onClick={() => setActiveTab('pos')}
          >
            POS
          </button>
          <button 
            className={activeTab === 'inventory' ? 'active' : ''} 
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === 'game' ? 'active' : ''} 
            onClick={() => setActiveTab('game')}
          >
            🎮 Game
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'pos' && (
          <POS 
            inventory={inventory} 
            onSale={() => {
              fetchInventory();
              fetchCreditScore();
              fetchSalesHistory();
            }} 
          />
        )}
        {activeTab === 'inventory' && (
          <Inventory 
            inventory={inventory} 
            onUpdate={fetchInventory} 
          />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard creditScore={creditScore} />
        )}
        {activeTab === 'game' && (
          <Gamification creditScore={creditScore} salesHistory={salesHistory} />
        )}
      </main>
    </div>
  );
}

export default App;