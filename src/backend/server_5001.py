#!/usr/bin/env python3
import json
import sqlite3
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

class POSHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        path = urlparse(self.path).path
        
        if path == '/api/inventory':
            data = self.get_inventory()
        elif path == '/api/credit-score':
            data = self.get_credit_score()
        elif path == '/api/sales-history':
            data = self.get_sales_history()
        else:
            data = {"error": "Not found"}
            
        self.wfile.write(json.dumps(data).encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        path = urlparse(self.path).path
        
        if path == '/api/inventory':
            result = self.add_inventory(data)
        elif path == '/api/inventory/refill':
            result = self.refill_inventory(data)
        elif path == '/api/sell':
            result = self.process_sale(data)
        else:
            result = {"error": "Not found"}
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def do_DELETE(self):
        path = urlparse(self.path).path
        
        if path.startswith('/api/inventory/'):
            item_id = path.split('/')[-1]
            result = self.delete_inventory(item_id)
        else:
            result = {"error": "Not found"}
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def get_inventory(self):
        conn = sqlite3.connect('pos_system.db')
        c = conn.cursor()
        c.execute("SELECT * FROM inventory")
        items = [{"id": row[0], "name": row[1], "price": row[2], "quantity": row[3]} 
                 for row in c.fetchall()]
        conn.close()
        return items

    def add_inventory(self, data):
        conn = sqlite3.connect('pos_system.db')
        c = conn.cursor()
        c.execute("INSERT INTO inventory (name, price, quantity) VALUES (?, ?, ?)",
                 (data['name'], data['price'], data['quantity']))
        conn.commit()
        conn.close()
        return {"message": "Item added successfully"}

    def process_sale(self, data):
        conn = sqlite3.connect('pos_system.db')
        c = conn.cursor()
        
        c.execute("SELECT price, quantity FROM inventory WHERE name = ?", (data['item_name'],))
        result = c.fetchone()
        
        if not result:
            conn.close()
            return {"error": "Item not found"}
        
        price, stock = result
        if stock < data['quantity']:
            conn.close()
            return {"error": "Not enough stock"}
        
        total = price * data['quantity']
        amount_received = data.get('amount_received', total)
        change = data.get('change', 0)
        
        c.execute("UPDATE inventory SET quantity = quantity - ? WHERE name = ?",
                 (data['quantity'], data['item_name']))
        
        c.execute("INSERT INTO sales (item_name, quantity, total, payment_method, amount_received, change_given, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
                 (data['item_name'], data['quantity'], total, data['payment_method'], amount_received, change, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
        return {"message": f"Sold {data['quantity']} x {data['item_name']} for R{total}"}

    def get_credit_score(self):
        conn = sqlite3.connect('pos_system.db')
        c = conn.cursor()
        
        c.execute("SELECT SUM(total), COUNT(*) FROM sales")
        result = c.fetchone()
        total_sales, transaction_count = result[0] or 0, result[1] or 0
        
        avg_transaction = total_sales / transaction_count if transaction_count else 0
        score = min(int(total_sales/10 + avg_transaction/2 + transaction_count*5), 100)
        
        conn.close()
        return {
            "score": score,
            "total_sales": total_sales,
            "transaction_count": transaction_count,
            "avg_transaction": avg_transaction
        }

    def get_sales_history(self):
        conn = sqlite3.connect('pos_system.db')
        c = conn.cursor()
        
        c.execute("SELECT * FROM sales ORDER BY timestamp DESC LIMIT 50")
        sales = []
        for row in c.fetchall():
            if len(row) >= 8:
                sales.append({
                    "id": row[0], "item_name": row[1], "quantity": row[2], 
                    "total": row[3], "payment_method": row[4], 
                    "amount_received": row[5], "change_given": row[6], 
                    "timestamp": row[7]
                })
            else:
                sales.append({
                    "id": row[0], "item_name": row[1], "quantity": row[2], 
                    "total": row[3], "payment_method": row[4], 
                    "timestamp": row[5]
                })
        
        conn.close()
        return sales

    def delete_inventory(self, item_id):
        conn = sqlite3.connect('pos_system.db')
        c = conn.cursor()
        
        # Check if item exists
        c.execute("SELECT * FROM inventory WHERE id = ?", (item_id,))
        if not c.fetchone():
            conn.close()
            return {"error": "Item not found"}
        
        # Delete the item
        c.execute("DELETE FROM inventory WHERE id = ?", (item_id,))
        rows_affected = c.rowcount
        conn.commit()
        conn.close()
        
        if rows_affected > 0:
            return {"message": "Item deleted successfully"}
        else:
            return {"error": "Failed to delete item"}

    def refill_inventory(self, data):
        conn = sqlite3.connect('pos_system.db')
        c = conn.cursor()
        
        print(f"DEBUG: Refill request for item_id: {data['item_id']}, quantity: {data['quantity']}")
        
        # Check if item exists first
        c.execute("SELECT name, quantity FROM inventory WHERE id = ?", (data['item_id'],))
        result = c.fetchone()
        
        print(f"DEBUG: Database result: {result}")
        
        if not result:
            conn.close()
            return {"error": "Item not found"}
        
        item_name, current_quantity = result
        new_quantity = current_quantity + data['quantity']
        
        print(f"DEBUG: Current: {current_quantity}, Adding: {data['quantity']}, New: {new_quantity}")
        
        # Update quantity by adding to existing stock
        c.execute("UPDATE inventory SET quantity = ? WHERE id = ?",
                 (new_quantity, data['item_id']))
        
        rows_affected = c.rowcount
        print(f"DEBUG: Rows affected: {rows_affected}")
        
        conn.commit()
        
        # Verify the update
        c.execute("SELECT quantity FROM inventory WHERE id = ?", (data['item_id'],))
        final_quantity = c.fetchone()[0]
        print(f"DEBUG: Final quantity in DB: {final_quantity}")
        
        conn.close()
        
        return {"message": f"Added {data['quantity']} {item_name} to stock. New total: {new_quantity}"}

if __name__ == '__main__':
    # Initialize database
    conn = sqlite3.connect('pos_system.db')
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS inventory
                 (id INTEGER PRIMARY KEY, name TEXT, price REAL, quantity INTEGER)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS sales
                 (id INTEGER PRIMARY KEY, item_name TEXT, quantity INTEGER, 
                  total REAL, payment_method TEXT, amount_received REAL, 
                  change_given REAL, timestamp TEXT)''')
    
    conn.commit()
    conn.close()
    
    print("Server starting on http://localhost:5001")
    server = HTTPServer(('localhost', 5001), POSHandler)
    server.serve_forever()