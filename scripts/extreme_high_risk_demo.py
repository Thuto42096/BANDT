#!/usr/bin/env python3
"""
Extreme High Risk Scenario Demo
Simulates a failing shop with very poor performance
"""

import sqlite3
from datetime import datetime, timedelta
import random

def simulate_extreme_high_risk():
    """Simulate extremely poor shop performance"""
    conn = sqlite3.connect('demo_extreme_risk.db')
    c = conn.cursor()
    
    # Create tables
    c.execute('''CREATE TABLE IF NOT EXISTS inventory
                 (id INTEGER PRIMARY KEY, name TEXT, price REAL, quantity INTEGER)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS sales
                 (id INTEGER PRIMARY KEY, item_name TEXT, quantity INTEGER, 
                  total REAL, payment_method TEXT, amount_received REAL, 
                  change_given REAL, timestamp TEXT)''')
    
    # Add inventory
    items = [('Bread', 15.0, 5), ('Milk', 25.0, 3), ('Airtime', 10.0, 10)]
    c.executemany("INSERT OR REPLACE INTO inventory (name, price, quantity) VALUES (?, ?, ?)", items)
    
    # Simulate 30 days of extremely poor sales
    base_date = datetime.now() - timedelta(days=30)
    inventory = {'Bread': 15.0, 'Milk': 25.0, 'Airtime': 10.0}
    
    extreme_sales = []
    
    for day in range(30):
        current_date = base_date + timedelta(days=day)
        
        # Extreme high risk characteristics:
        # - Many days with NO sales (60% of days)
        # - When sales happen, only 1-2 transactions
        # - 100% cash payments (zero digital adoption)
        # - Very low values
        
        if random.random() < 0.6:  # 60% chance of NO sales that day
            continue
            
        daily_transactions = random.randint(1, 2)  # Maximum 2 transactions per day
        
        for _ in range(daily_transactions):
            item = random.choice(list(inventory.keys()))
            quantity = 1
            total = inventory[item] * quantity
            
            # 100% cash payments - zero digital adoption
            payment_method = 'cash'
            
            sale_time = current_date + timedelta(
                hours=random.randint(9, 16),  # Limited business hours
                minutes=random.randint(0, 59)
            )
            
            extreme_sales.append((
                item, quantity, total, payment_method, 
                total, 0, sale_time.isoformat()
            ))
    
    c.executemany("""INSERT INTO sales 
                     (item_name, quantity, total, payment_method, amount_received, change_given, timestamp) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)""", extreme_sales)
    
    conn.commit()
    
    # Calculate score
    c.execute("SELECT SUM(total), COUNT(*) FROM sales")
    result = c.fetchone()
    total_sales, transaction_count = result[0] or 0, result[1] or 0
    
    avg_transaction = total_sales / transaction_count if transaction_count else 0
    digital_adoption = 0  # Zero digital adoption
    
    score = min(int(
        (total_sales / 10) * 0.4 +
        (transaction_count * 5) * 0.3 +
        (avg_transaction / 2) * 0.2 +
        (digital_adoption * 2) * 0.1
    ), 100)
    
    conn.close()
    
    # Display results
    print("\n" + "="*60)
    print("🏪 EXTREME HIGH RISK SCENARIO - FAILING SHOP")
    print("="*60)
    
    print(f"\n📊 BUSINESS PERFORMANCE (Last 30 Days)")
    print(f"   Total Sales: R{total_sales:.2f}")
    print(f"   Transactions: {transaction_count}")
    print(f"   Avg Transaction: R{avg_transaction:.2f}")
    print(f"   Digital Adoption: {digital_adoption}%")
    print(f"   Days with Sales: {len(set([s[6][:10] for s in extreme_sales]))}/30")
    
    print(f"\n🎯 TOWNSHIP CREDIT SCORE")
    print(f"   Score: {score}/100")
    print(f"   Rating: {'Poor' if score < 40 else 'Fair'}")
    print(f"   Risk Level: 🔴 Very High Risk")
    
    print(f"\n💰 LOAN ELIGIBILITY")
    print(f"   Maximum Loan: R500")
    print(f"   Interest Rate: 22%")
    print(f"   Status: ⚠️ High Risk - Requires Guarantor")
    
    print(f"\n🚨 CRITICAL RISK FACTORS:")
    print(f"   • Extremely low sales volume (R{total_sales:.2f} in 30 days)")
    print(f"   • Very few transactions ({transaction_count} total)")
    print(f"   • Zero digital payment adoption")
    print(f"   • Irregular business operations")
    print(f"   • Many days with no sales activity")
    
    print(f"\n🆘 URGENT RECOMMENDATIONS:")
    print(f"   • Business intervention required")
    print(f"   • Consider business training/mentorship")
    print(f"   • Improve product mix and pricing")
    print(f"   • Extend business hours")
    print(f"   • Implement basic marketing strategies")
    print(f"   • Start with micro-loans (R500 max)")
    
    print("\n" + "="*60)
    print("💡 This shop would be classified as 'Very High Risk' by lenders")
    print("🏦 Traditional banks would likely reject loan applications")
    print("🤝 Microfinance with mentorship support recommended")

if __name__ == "__main__":
    print("🚀 Running Extreme High Risk Scenario...")
    simulate_extreme_high_risk()
    print("\n✅ Extreme high risk demo completed!")