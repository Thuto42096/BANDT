import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

function Dashboard({ creditScore }) {
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

  const getCreditRating = (score) => {
    if (score >= 80) return { rating: 'Excellent', color: '#4CAF50' };
    if (score >= 60) return { rating: 'Good', color: '#2196F3' };
    if (score >= 40) return { rating: 'Fair', color: '#FF9800' };
    return { rating: 'Poor', color: '#F44336' };
  };

  const getLoanEligibility = (score) => {
    if (score >= 80) return { amount: 5000, rate: '12%' };
    if (score >= 60) return { amount: 3000, rate: '15%' };
    if (score >= 40) return { amount: 1500, rate: '18%' };
    return { amount: 500, rate: '22%' };
  };

  const paymentMethodData = salesHistory.reduce((acc, sale) => {
    const method = sale.payment_method;
    const existing = acc.find(item => item.name === method);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: method, value: 1 });
    }
    return acc;
  }, []);

  console.log('Sales History:', salesHistory.length, 'items');
  console.log('Payment Method Data:', paymentMethodData);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (!creditScore) {
    return <div>Loading dashboard...</div>;
  }

  const { rating, color } = getCreditRating(creditScore.score);
  const loanInfo = getLoanEligibility(creditScore.score);

  return (
    <div className="dashboard-container">
      <h2>Business Dashboard</h2>
      
      <div className="dashboard-grid">
        <div className="credit-score-card">
          <h3>Township Credit Score</h3>
          <div className="score-display" style={{ color }}>
            <span className="score-number">{creditScore.score}</span>
            <span className="score-rating">{rating}</span>
          </div>
          <div className="score-details">
            <p>Total Sales: R{creditScore.total_sales?.toFixed(2) || 0}</p>
            <p>Transactions: {creditScore.transaction_count || 0}</p>
            <p>Avg Transaction: R{creditScore.avg_transaction?.toFixed(2) || 0}</p>
            <p>Digital Adoption: {creditScore.digital_adoption?.toFixed(1) || 0}%</p>
            <p>Active Days: {creditScore.active_days || 0}/30</p>
          </div>
        </div>

        <div className="loan-eligibility-card">
          <h3>Loan Eligibility</h3>
          <div className="loan-info">
            <p className="loan-amount">Up to R{loanInfo.amount}</p>
            <p className="loan-rate">Interest Rate: {loanInfo.rate}</p>
            <button className="apply-loan-btn">Apply for Loan</button>
          </div>
        </div>

        <div className="chart-container">
          <h3>Payment Methods</h3>
          {paymentMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No payment data available</p>
          )}
        </div>

        <div className="recent-sales">
          <h3>Recent Sales</h3>
          <div className="sales-list">
            {salesHistory.slice(0, 5).map(sale => (
              <div key={sale.id} className="sale-item">
                <span>{sale.item_name} x{sale.quantity}</span>
                <span>R{sale.total}</span>
                <span className="payment-method">{sale.payment_method}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;