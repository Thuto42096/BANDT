#!/usr/bin/env python3
import json
import sqlite3
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import random

class DemoHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        path = urlparse(self.path).path
        
        if path == '/api/inventory':
            self.wfile.write(json.dumps(self.get_demo_inventory()).encode())
        elif path == '/api/credit-score':
            self.wfile.write(json.dumps(self.get_demo_credit_score()).encode())
        elif path == '/api/sales-history':
            self.wfile.write(json.dumps(self.get_demo_sales()).encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        path = urlparse(self.path).path
        
        if path == '/api/inventory':
            result = {"message": "Item added successfully"}
        elif path == '/api/sell':
            result = self.process_demo_sale(data)
        else:
            result = {"error": "Not found"}
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())

    def get_demo_inventory(self):
        return [
            {"id": 1, "name": "Bread", "price": 15.0, "quantity": 50},
            {"id": 2, "name": "Milk", "price": 25.0, "quantity": 20},
            {"id": 3, "name": "Eggs", "price": 35.0, "quantity": 30},
            {"id": 4, "name": "Sugar", "price": 18.0, "quantity": 15},
            {"id": 5, "name": "Airtime", "price": 10.0, "quantity": 100}
        ]

    def get_demo_credit_score(self):
        # Simulate Thabo's successful 2-month business
        return {
            "score": 78,  # Good rating - Low Risk
            "total_sales": 30000.0,  # R500/day * 60 days
            "transaction_count": 120,  # 2 transactions per day
            "avg_transaction": 250.0
        }

    def get_demo_sales(self):
        # Generate recent demo sales
        sales = []
        items = ["Bread", "Milk", "Eggs", "Sugar", "Airtime"]
        payment_methods = ["cash", "mobile_money", "qr_code"]
        
        for i in range(10):
            item = random.choice(items)
            quantity = random.randint(1, 3)
            price = {"Bread": 15, "Milk": 25, "Eggs": 35, "Sugar": 18, "Airtime": 10}[item]
            total = price * quantity
            payment_method = random.choice(payment_methods)
            
            sales.append({
                "id": i + 1,
                "item_name": item,
                "quantity": quantity,
                "total": total,
                "payment_method": payment_method,
                "amount_received": total + random.randint(0, 20) if payment_method == "cash" else total,
                "change_given": random.randint(0, 20) if payment_method == "cash" else 0,
                "timestamp": (datetime.now() - timedelta(hours=i)).isoformat()
            })
        
        return sales

    def process_demo_sale(self, data):
        item_name = data.get('item_name', '')
        quantity = data.get('quantity', 1)
        
        # Demo prices
        prices = {"Bread": 15, "Milk": 25, "Eggs": 35, "Sugar": 18, "Airtime": 10}
        price = prices.get(item_name, 10)
        total = price * quantity
        
        change = data.get('change', 0)
        
        message = f"Sold {quantity} x {item_name} for R{total}"
        if change > 0:
            message += f" - Change: R{change:.2f}"
        
        return {"message": message}

if __name__ == '__main__':
    server = HTTPServer(('localhost', 5000), DemoHandler)
    print("Demo Server running on http://localhost:5000")
    print("Simulating Thabo's Spaza Shop - 2 months of successful trading")
    print("Credit Score: 78 (Good Rating - Low Risk)")
    print("Loan Eligibility: R3,000 at 15% interest")
    server.serve_forever()