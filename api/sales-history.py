from http.server import BaseHTTPRequestHandler
import json
from datetime import datetime, timedelta

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Demo sales history
        sales_history = [
            {
                "id": 1,
                "item_name": "Bread",
                "quantity": 1,
                "total": 15.0,
                "payment_method": "cash",
                "amount_received": 20.0,
                "change_given": 5.0,
                "timestamp": (datetime.now() - timedelta(hours=2)).isoformat()
            },
            {
                "id": 2,
                "item_name": "Milk",
                "quantity": 1,
                "total": 25.0,
                "payment_method": "mtn_momo",
                "amount_received": 25.0,
                "change_given": 0.0,
                "timestamp": (datetime.now() - timedelta(hours=5)).isoformat()
            }
        ]
        
        self.wfile.write(json.dumps(sales_history).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()