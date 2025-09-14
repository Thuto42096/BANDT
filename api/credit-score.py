from http.server import BaseHTTPRequestHandler
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # Demo credit score data
        credit_data = {
            "score": 45,
            "total_sales": 230.0,
            "transaction_count": 12,
            "avg_transaction": 19.17,
            "digital_adoption": 25.0,
            "active_days": 8
        }
        
        self.wfile.write(json.dumps(credit_data).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()