#!/usr/bin/env python3
"""
High Risk Scenario Demo for Township POS System
Simulates a shop with poor performance leading to high credit risk
"""

import sqlite3
import json
from datetime import datetime, timedelta
import random

def init_demo_db():
    """Initialize database with demo data"""
    conn = sqlite3.connect('demo_high_risk.db')
    c = conn.cursor()
    
    # Create tables
    c.execute('''CREATE TABLE IF NOT EXISTS inventory
                 (id INTEGER PRIMARY KEY, name TEXT, price REAL, quantity INTEGER)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS sales
                 (id INTEGER PRIMARY KEY, item_name TEXT, quantity INTEGER, 
                  total REAL, payment_method TEXT, amount_received REAL, 
                  change_given REAL, timestamp TEXT)''')
    
    # Add basic inventory
    items = [
        ('Bread', 15.0, 10),
        ('Milk', 25.0, 5),
        ('Airtime', 10.0, 20),
        ('Cigarettes', 35.0, 8)
    ]
    
    c.executemany("INSERT OR REPLACE INTO inventory (name, price, quantity) VALUES (?, ?, ?)", items)
    
    conn.commit()
    conn.close()
    print("✅ Demo database initialized")

def simulate_high_risk_sales():
    """Simulate poor sales performance - high risk scenario"""
    conn = sqlite3.connect('demo_high_risk.db')
    c = conn.cursor()
    
    # Get inventory
    c.execute("SELECT name, price FROM inventory")
    inventory = dict(c.fetchall())
    
    # Simulate 30 days of poor sales
    base_date = datetime.now() - timedelta(days=30)
    
    high_risk_sales = []
    
    for day in range(30):
        current_date = base_date + timedelta(days=day)
        
        # High risk characteristics:
        # - Very few transactions per day (0-3)
        # - Low transaction values
        # - Mostly cash payments (no digital adoption)
        # - Irregular sales patterns
        
        daily_transactions = random.randint(0, 3)  # Very low transaction count
        
        for _ in range(daily_transactions):
            # Random gaps in sales (some days no sales)
            if random.random() < 0.3:  # 30% chance of no sale
                continue
                
            item = random.choice(list(inventory.keys()))
            quantity = 1  # Always single items
            total = inventory[item] * quantity
            
            # 90% cash payments (poor digital adoption)
            payment_method = 'cash' if random.random() < 0.9 else 'mobile_money'
            
            sale_time = current_date + timedelta(
                hours=random.randint(8, 18),
                minutes=random.randint(0, 59)
            )
            
            high_risk_sales.append((
                item, quantity, total, payment_method, 
                total, 0, sale_time.isoformat()
            ))
    
    # Insert sales
    c.executemany("""INSERT INTO sales 
                     (item_name, quantity, total, payment_method, amount_received, change_given, timestamp) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)""", high_risk_sales)
    
    conn.commit()
    conn.close()
    
    print(f"✅ Simulated {len(high_risk_sales)} high-risk sales transactions")

def calculate_credit_score():
    """Calculate and display credit score"""
    conn = sqlite3.connect('demo_high_risk.db')
    c = conn.cursor()
    
    c.execute("SELECT SUM(total), COUNT(*), payment_method FROM sales GROUP BY payment_method")
    payment_data = c.fetchall()
    
    c.execute("SELECT SUM(total), COUNT(*) FROM sales")
    result = c.fetchone()
    total_sales, transaction_count = result[0] or 0, result[1] or 0
    
    avg_transaction = total_sales / transaction_count if transaction_count else 0
    
    # Calculate digital payment adoption
    digital_transactions = 0
    for payment_total, payment_count, payment_method in payment_data:
        if payment_method != 'cash':
            digital_transactions += payment_count
    
    digital_adoption = (digital_transactions / transaction_count * 100) if transaction_count else 0
    
    # Township Credit Score Algorithm
    # Total Sales (40%) + Transaction Frequency (30%) + Avg Transaction (20%) + Digital Adoption (10%)
    score = min(int(
        (total_sales / 10) * 0.4 +           # Sales volume component
        (transaction_count * 5) * 0.3 +      # Frequency component  
        (avg_transaction / 2) * 0.2 +        # Average transaction component
        (digital_adoption * 2) * 0.1         # Digital adoption component
    ), 100)
    
    conn.close()
    
    return {
        'score': score,
        'total_sales': total_sales,
        'transaction_count': transaction_count,
        'avg_transaction': avg_transaction,
        'digital_adoption': digital_adoption
    }

def get_risk_assessment(score):
    """Get risk level and loan eligibility"""
    if score >= 80:
        return {
            'risk_level': 'Low Risk',
            'rating': 'Excellent',
            'max_loan': 5000,
            'interest_rate': '12%',
            'color': '🟢'
        }
    elif score >= 60:
        return {
            'risk_level': 'Medium Risk',
            'rating': 'Good', 
            'max_loan': 3000,
            'interest_rate': '15%',
            'color': '🟡'
        }
    elif score >= 40:
        return {
            'risk_level': 'High Risk',
            'rating': 'Fair',
            'max_loan': 1500,
            'interest_rate': '18%',
            'color': '🟠'
        }
    else:
        return {
            'risk_level': 'Very High Risk',
            'rating': 'Poor',
            'max_loan': 500,
            'interest_rate': '22%',
            'color': '🔴'
        }

def display_demo_results():
    """Display the high-risk scenario results"""
    credit_data = calculate_credit_score()
    risk_info = get_risk_assessment(credit_data['score'])
    
    print("\n" + "="*60)
    print("🏪 TOWNSHIP POS SYSTEM - HIGH RISK SCENARIO DEMO")
    print("="*60)
    
    print(f"\n📊 BUSINESS PERFORMANCE (Last 30 Days)")
    print(f"   Total Sales: R{credit_data['total_sales']:.2f}")
    print(f"   Transactions: {credit_data['transaction_count']}")
    print(f"   Avg Transaction: R{credit_data['avg_transaction']:.2f}")
    print(f"   Digital Adoption: {credit_data['digital_adoption']:.1f}%")
    
    print(f"\n🎯 TOWNSHIP CREDIT SCORE")
    print(f"   Score: {credit_data['score']}/100")
    print(f"   Rating: {risk_info['rating']}")
    print(f"   Risk Level: {risk_info['color']} {risk_info['risk_level']}")
    
    print(f"\n💰 LOAN ELIGIBILITY")
    print(f"   Maximum Loan: R{risk_info['max_loan']:,}")
    print(f"   Interest Rate: {risk_info['interest_rate']}")
    
    print(f"\n⚠️  HIGH RISK FACTORS IDENTIFIED:")
    print(f"   • Very low transaction volume ({credit_data['transaction_count']} transactions)")
    print(f"   • Poor digital payment adoption ({credit_data['digital_adoption']:.1f}%)")
    print(f"   • Low average transaction value (R{credit_data['avg_transaction']:.2f})")
    print(f"   • Irregular sales patterns")
    
    print(f"\n📈 RECOMMENDATIONS FOR IMPROVEMENT:")
    print(f"   • Increase daily transaction volume")
    print(f"   • Encourage mobile money and digital payments")
    print(f"   • Offer bundle deals to increase transaction values")
    print(f"   • Maintain consistent business hours")
    print(f"   • Track all sales through the POS system")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    print("🚀 Starting High Risk Scenario Demo...")
    
    init_demo_db()
    simulate_high_risk_sales()
    display_demo_results()
    
    print("\n✅ Demo completed! Database saved as 'demo_high_risk.db'")
    print("💡 This demonstrates how poor business performance leads to high credit risk")