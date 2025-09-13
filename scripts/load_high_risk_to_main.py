#!/usr/bin/env python3
"""
Load High Risk Data to Main Database
Replaces the current database with high-risk scenario data
"""

import sqlite3
import shutil
from datetime import datetime, timedelta
import random

def create_high_risk_data():
    """Create high-risk scenario data in main database"""
    
    # Clear existing database
    conn = sqlite3.connect('../src/backend/pos_system.db')
    c = conn.cursor()
    
    # Clear existing data
    c.execute("DELETE FROM inventory")
    c.execute("DELETE FROM sales")
    
    # Add minimal inventory (struggling shop)
    items = [
        ('Bread', 15.0, 3),      # Low stock
        ('Milk', 25.0, 2),       # Very low stock
        ('Airtime R10', 10.0, 5) # Limited options
    ]
    
    c.executemany("INSERT INTO inventory (name, price, quantity) VALUES (?, ?, ?)", items)
    
    # Generate very poor sales data (last 30 days)
    base_date = datetime.now() - timedelta(days=30)
    inventory_dict = {'Bread': 15.0, 'Milk': 25.0, 'Airtime R10': 10.0}
    
    sales_data = []
    
    # Only 12 transactions in 30 days (very poor performance)
    for i in range(12):
        # Random day in the last 30 days
        day_offset = random.randint(0, 29)
        sale_date = base_date + timedelta(days=day_offset)
        
        item_name = random.choice(list(inventory_dict.keys()))
        quantity = 1  # Always single items
        total = inventory_dict[item_name] * quantity
        
        # 100% cash payments (zero digital adoption)
        payment_method = 'cash'
        
        # Random time during limited business hours
        sale_time = sale_date + timedelta(
            hours=random.randint(10, 15),  # Short business hours
            minutes=random.randint(0, 59)
        )
        
        sales_data.append((
            item_name, quantity, total, payment_method,
            total, 0, sale_time.isoformat()
        ))
    
    # Insert sales data
    c.executemany("""INSERT INTO sales 
                     (item_name, quantity, total, payment_method, amount_received, change_given, timestamp) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)""", sales_data)
    
    conn.commit()
    
    # Calculate final stats
    c.execute("SELECT SUM(total), COUNT(*) FROM sales")
    result = c.fetchone()
    total_sales, transaction_count = result[0] or 0, result[1] or 0
    
    avg_transaction = total_sales / transaction_count if transaction_count else 0
    digital_adoption = 0  # Zero digital adoption
    
    # Calculate very low credit score
    score = min(int(
        (total_sales / 10) * 0.4 +
        (transaction_count * 5) * 0.3 +
        (avg_transaction / 2) * 0.2 +
        (digital_adoption * 2) * 0.1
    ), 100)
    
    conn.close()
    
    print("🔴 HIGH RISK DATA LOADED TO MAIN DATABASE")
    print("=" * 50)
    print(f"📊 Business Performance:")
    print(f"   Total Sales: R{total_sales:.2f}")
    print(f"   Transactions: {transaction_count}")
    print(f"   Digital Adoption: {digital_adoption}%")
    print(f"   Credit Score: {score}/100")
    print(f"   Risk Level: 🔴 Very High Risk")
    
    print(f"\n🎮 Gamification Status:")
    xp = transaction_count * 10 + total_sales / 5
    level = int(xp / 100) + 1
    print(f"   Level: {level}")
    print(f"   XP: {int(xp)}")
    print(f"   Badges: None (too few transactions)")
    print(f"   Garden: 🌰💧🐛 Seed Stage")
    
    print(f"\n💰 Loan Status:")
    print(f"   Maximum Loan: R500")
    print(f"   Interest Rate: 22%")
    print(f"   Status: ⚠️ High Risk - Requires Guarantor")
    
    print(f"\n🚀 Now restart the system to see high-risk scenario:")
    print(f"   1. Stop current servers (Ctrl+C)")
    print(f"   2. Run: ./run.sh")
    print(f"   3. See struggling shop with low credit score")

if __name__ == "__main__":
    create_high_risk_data()