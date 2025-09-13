#!/usr/bin/env python3
"""
Gamification Demo Script
Populates the database with sample data to showcase gamification features
"""

import sqlite3
from datetime import datetime, timedelta
import random

def create_demo_data():
    """Create demo data to showcase gamification features"""
    conn = sqlite3.connect('../src/backend/pos_system.db')
    c = conn.cursor()
    
    # Clear existing data
    c.execute("DELETE FROM inventory")
    c.execute("DELETE FROM sales")
    
    # Add inventory items
    items = [
        ('Bread', 15.0, 50),
        ('Milk', 25.0, 30),
        ('Airtime R10', 10.0, 100),
        ('Airtime R20', 20.0, 50),
        ('Cigarettes', 35.0, 40),
        ('Coca Cola', 18.0, 60),
        ('Chips', 12.0, 80),
        ('Sweets', 5.0, 200)
    ]
    
    c.executemany("INSERT INTO inventory (name, price, quantity) VALUES (?, ?, ?)", items)
    
    # Generate sales data for gamification demo
    base_date = datetime.now() - timedelta(days=14)
    inventory_dict = dict([(item[0], item[1]) for item in items])
    
    sales_data = []
    
    # Generate 14 days of progressive sales (showing improvement)
    for day in range(14):
        current_date = base_date + timedelta(days=day)
        
        # Progressive improvement: more sales and digital adoption over time
        daily_transactions = random.randint(3 + day//2, 8 + day//2)
        digital_chance = min(0.1 + (day * 0.05), 0.7)  # Increasing digital adoption
        
        for transaction in range(daily_transactions):
            item_name = random.choice(list(inventory_dict.keys()))
            quantity = random.randint(1, 3)
            total = inventory_dict[item_name] * quantity
            
            # Progressive digital adoption
            if random.random() < digital_chance:
                payment_method = random.choice(['mobile_money', 'qr_code'])
            else:
                payment_method = 'cash'
            
            # Random time during business hours
            sale_time = current_date + timedelta(
                hours=random.randint(8, 18),
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
    
    # Count digital payments
    c.execute("SELECT COUNT(*) FROM sales WHERE payment_method != 'cash'")
    digital_count = c.fetchone()[0]
    digital_adoption = (digital_count / transaction_count * 100) if transaction_count else 0
    
    avg_transaction = total_sales / transaction_count if transaction_count else 0
    score = min(int(total_sales/10 + avg_transaction/2 + transaction_count*5), 100)
    
    conn.close()
    
    print("🎮 GAMIFICATION DEMO DATA CREATED")
    print("=" * 50)
    print(f"📊 Business Performance:")
    print(f"   Total Sales: R{total_sales:.2f}")
    print(f"   Transactions: {transaction_count}")
    print(f"   Digital Adoption: {digital_adoption:.1f}%")
    print(f"   Credit Score: {score}/100")
    print(f"   Days Active: 14")
    
    print(f"\n🎯 Gamification Features Unlocked:")
    
    # Calculate level and XP
    xp = transaction_count * 10 + total_sales / 5
    level = int(xp / 100) + 1
    print(f"   Level: {level}")
    print(f"   XP: {int(xp)}")
    
    # Show badges earned
    badges = []
    if transaction_count >= 10:
        badges.append("🏪 First Steps")
    if transaction_count >= 50:
        badges.append("🔥 Busy Shop")
    if score >= 60:
        badges.append("⭐ Credit Builder")
    if score >= 80:
        badges.append("👑 Credit Master")
    if digital_adoption >= 30:
        badges.append("📱 Digital Pioneer")
    
    print(f"   Badges: {', '.join(badges) if badges else 'None yet'}")
    
    # Show garden status
    if score >= 80:
        garden = "🌳🌺🦋 Flourishing Garden"
    elif score >= 60:
        garden = "🌿🌸🐝 Growing Garden"
    elif score >= 40:
        garden = "🌱🌼🐛 Young Garden"
    else:
        garden = "🌰💧🐛 Seed Stage"
    
    print(f"   Credit Garden: {garden}")
    
    print(f"\n🚀 Now start the frontend to see the gamification in action!")
    print(f"   1. Start backend: python3 src/backend/server_5001.py")
    print(f"   2. Start frontend: cd src/frontend && npm start")
    print(f"   3. Click the '🎮 Game' tab to see your progress!")

if __name__ == "__main__":
    create_demo_data()