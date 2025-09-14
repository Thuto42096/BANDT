from http.server import BaseHTTPRequestHandler
import json
import sqlite3
import os
from datetime import datetime

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Get inventory from database
        inventory = self.get_inventory()
        self.wfile.write(json.dumps(inventory).encode())
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        # Add item to inventory
        result = self.add_inventory(data)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(result).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def get_inventory(self):
        # For Vercel, we'll use a simple in-memory store or external database
        # This is a simplified version - you'd want to use a proper database
        return [
            {"id": 1, "name": "Bread", "price": 15.0, "quantity": 10},
            {"id": 2, "name": "Milk", "price": 25.0, "quantity": 5}
        ]
    
    def add_inventory(self, data):
        # In production, this would save to a database
        return {"message": "Item added successfully (demo mode)"}