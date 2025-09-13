from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime
import requests

app = Flask(__name__)
CORS(app)

# Initialize database
def init_db():
    conn = sqlite3.connect('pos_system.db')
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS inventory
                 (id INTEGER PRIMARY KEY, name TEXT, price REAL, quantity INTEGER)''')
    
    # Check if sales table exists and has new columns
    c.execute("PRAGMA table_info(sales)")
    columns = [column[1] for column in c.fetchall()]
    
    if 'amount_received' not in columns:
        # Create new sales table with updated schema
        c.execute('''CREATE TABLE IF NOT EXISTS sales_new
                     (id INTEGER PRIMARY KEY, item_name TEXT, quantity INTEGER, 
                      total REAL, payment_method TEXT, amount_received REAL, 
                      change_given REAL, timestamp TEXT)''')
        
        # Copy existing data if sales table exists
        if 'item_name' in columns:
            c.execute('''INSERT INTO sales_new (id, item_name, quantity, total, payment_method, amount_received, change_given, timestamp)
                         SELECT id, item_name, quantity, total, payment_method, total, 0, timestamp FROM sales''')
            c.execute('DROP TABLE sales')
        
        c.execute('ALTER TABLE sales_new RENAME TO sales')
    else:
        c.execute('''CREATE TABLE IF NOT EXISTS sales
                     (id INTEGER PRIMARY KEY, item_name TEXT, quantity INTEGER, 
                      total REAL, payment_method TEXT, amount_received REAL, 
                      change_given REAL, timestamp TEXT)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS credit_score
                 (id INTEGER PRIMARY KEY, shop_id TEXT, score INTEGER, 
                  total_sales REAL, transaction_count INTEGER, updated_at TEXT)''')
    
    conn.commit()
    conn.close()

@app.route('/api/inventory', methods=['GET', 'POST'])
def inventory():
    conn = sqlite3.connect('pos_system.db')
    c = conn.cursor()
    
    if request.method == 'POST':
        data = request.json
        c.execute("INSERT INTO inventory (name, price, quantity) VALUES (?, ?, ?)",
                 (data['name'], data['price'], data['quantity']))
        conn.commit()
        conn.close()
        return jsonify({"message": "Item added successfully"})
    
    c.execute("SELECT * FROM inventory")
    items = [{"id": row[0], "name": row[1], "price": row[2], "quantity": row[3]} 
             for row in c.fetchall()]
    conn.close()
    return jsonify(items)

@app.route('/api/sell', methods=['POST'])
def sell_item():
    data = request.json
    conn = sqlite3.connect('pos_system.db')
    c = conn.cursor()
    
    # Check inventory
    c.execute("SELECT price, quantity FROM inventory WHERE name = ?", (data['item_name'],))
    result = c.fetchone()
    
    if not result:
        return jsonify({"error": "Item not found"}), 400
    
    price, stock = result
    if stock < data['quantity']:
        return jsonify({"error": "Not enough stock"}), 400
    
    total = price * data['quantity']
    
    # Update inventory
    c.execute("UPDATE inventory SET quantity = quantity - ? WHERE name = ?",
             (data['quantity'], data['item_name']))
    
    # Record sale
    amount_received = data.get('amount_received', total)
    change = data.get('change', 0)
    
    c.execute("INSERT INTO sales (item_name, quantity, total, payment_method, amount_received, change_given, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
             (data['item_name'], data['quantity'], total, data['payment_method'], amount_received, change, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    
    update_credit_score()
    return jsonify({"message": f"Sold {data['quantity']} x {data['item_name']} for R{total}"})

@app.route('/api/credit-score', methods=['GET'])
def get_credit_score():
    conn = sqlite3.connect('pos_system.db')
    c = conn.cursor()
    
    c.execute("SELECT SUM(total), COUNT(*) FROM sales")
    result = c.fetchone()
    total_sales, transaction_count = result[0] or 0, result[1] or 0
    
    avg_transaction = total_sales / transaction_count if transaction_count else 0
    score = min(int(total_sales/10 + avg_transaction/2 + transaction_count*5), 100)
    
    conn.close()
    return jsonify({
        "score": score,
        "total_sales": total_sales,
        "transaction_count": transaction_count,
        "avg_transaction": avg_transaction
    })

def update_credit_score():
    conn = sqlite3.connect('pos_system.db')
    c = conn.cursor()
    
    c.execute("SELECT SUM(total), COUNT(*) FROM sales")
    result = c.fetchone()
    total_sales, transaction_count = result[0] or 0, result[1] or 0
    
    avg_transaction = total_sales / transaction_count if transaction_count else 0
    score = min(int(total_sales/10 + avg_transaction/2 + transaction_count*5), 100)
    
    c.execute("INSERT OR REPLACE INTO credit_score (id, shop_id, score, total_sales, transaction_count, updated_at) VALUES (1, 'shop_001', ?, ?, ?, ?)",
             (score, total_sales, transaction_count, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()

@app.route('/api/sales-history', methods=['GET'])
def sales_history():
    conn = sqlite3.connect('pos_system.db')
    c = conn.cursor()
    
    c.execute("SELECT * FROM sales ORDER BY timestamp DESC LIMIT 50")
    sales = [{"id": row[0], "item_name": row[1], "quantity": row[2], 
              "total": row[3], "payment_method": row[4], 
              "amount_received": row[5] if len(row) > 5 else row[3], 
              "change_given": row[6] if len(row) > 6 else 0, 
              "timestamp": row[7] if len(row) > 7 else row[5]} 
             for row in c.fetchall()]
    
    conn.close()
    return jsonify(sales)

if __name__ == '__main__':
    init_db()
    app.run(debug=True)