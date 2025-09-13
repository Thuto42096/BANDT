#!/usr/bin/env python3
"""
Create True High Risk Scenario
The credit scoring algorithm gives too much weight to transaction count.
This creates a scenario with very few transactions to get a truly low score.
"""

import sqlite3
from datetime import datetime, timedelta
import random

def create_true_high_risk():
    """Create a truly high-risk scenario with very low credit score"""
    
    conn = sqlite3.connect('../src/backend/pos_system.db')
    c = conn.cursor()
    
    # Clear ALL existing data
    c.execute("DELETE FROM inventory")
    c.execute("DELETE FROM sales")
    
    # Try to clear credit_score table if it exists
    try:
        c.execute("DELETE FROM credit_score")
    except:
        pass  # Table doesn't exist, ignore
    
    # Add minimal inventory for a struggling shop
    items = [
        ('Bread', 15.0, 2),      # Very low stock
        ('Milk', 25.0, 1),       # Almost out
    ]
    
    c.executemany("INSERT INTO inventory (name, price, quantity) VALUES (?, ?, ?)", items)
    
    # Create only 3 sales in the last 30 days (extremely poor performance)
    base_date = datetime.now() - timedelta(days=30)
    
    sales_data = [
        # Sale 1: 25 days ago
        ('Bread', 1, 15.0, 'cash', 15.0, 0, (base_date + timedelta(days=5)).isoformat()),
        # Sale 2: 15 days ago  
        ('Milk', 1, 25.0, 'cash', 25.0, 0, (base_date + timedelta(days=15)).isoformat()),
        # Sale 3: 5 days ago
        ('Bread', 1, 15.0, 'cash', 15.0, 0, (base_date + timedelta(days=25)).isoformat()),
    ]
    
    c.executemany("""INSERT INTO sales 
                     (item_name, quantity, total, payment_method, amount_received, change_given, timestamp) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)""", sales_data)
    
    conn.commit()
    
    # Calculate the actual score
    c.execute("SELECT SUM(total), COUNT(*) FROM sales")
    result = c.fetchone()
    total_sales, transaction_count = result[0] or 0, result[1] or 0
    
    avg_transaction = total_sales / transaction_count if transaction_count else 0
    
    # Current algorithm: total_sales/10 + avg_transaction/2 + transaction_count*5
    score = min(int(total_sales/10 + avg_transaction/2 + transaction_count*5), 100)
    
    conn.close()
    
    print("🔴 TRUE HIGH RISK SCENARIO CREATED")
    print("=" * 50)
    print(f"📊 Business Performance (Last 30 Days):")
    print(f"   Total Sales: R{total_sales:.2f}")
    print(f"   Transactions: {transaction_count}")
    print(f"   Average Transaction: R{avg_transaction:.2f}")
    print(f"   Digital Adoption: 0%")
    print(f"   Days with Sales: 3/30")
    
    print(f"\n🎯 Credit Score Calculation:")
    print(f"   Sales Component: {total_sales/10:.1f} (R{total_sales}/10)")
    print(f"   Avg Transaction: {avg_transaction/2:.1f} (R{avg_transaction:.2f}/2)")
    print(f"   Transaction Count: {transaction_count*5} ({transaction_count}*5)")
    print(f"   TOTAL SCORE: {score}/100")
    
    if score < 40:
        risk_level = "🔴 Very High Risk"
        rating = "Poor"
        max_loan = 500
        interest = "22%"
    elif score < 60:
        risk_level = "🟠 High Risk"
        rating = "Fair"
        max_loan = 1500
        interest = "18%"
    else:
        risk_level = "🟡 Medium Risk"
        rating = "Good"
        max_loan = 3000
        interest = "15%"
    
    print(f"\n💰 Loan Eligibility:")
    print(f"   Risk Level: {risk_level}")
    print(f"   Rating: {rating}")
    print(f"   Maximum Loan: R{max_loan}")
    print(f"   Interest Rate: {interest}")
    
    print(f"\n🎮 Gamification Status:")
    xp = transaction_count * 10 + total_sales / 5
    level = int(xp / 100) + 1
    print(f"   Level: {level}")
    print(f"   XP: {int(xp)}")
    print(f"   Garden: 🌰💧🐛 Seed Stage (struggling)")
    
    print(f"\n🚀 Restart system to see the high-risk scenario!")

if __name__ == "__main__":
    create_true_high_risk()