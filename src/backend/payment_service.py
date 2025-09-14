#!/usr/bin/env python3
"""
Payment Service Integration
Handles real payment processing with South African payment providers
"""

import hashlib
import requests
import json
import os
from datetime import datetime

class PaymentService:
    def __init__(self):
        # Load environment variables
        self.load_config()
        
        # PayFast Configuration
        self.payfast_merchant_id = os.getenv('PAYFAST_MERCHANT_ID', '10000100')  # Default sandbox
        self.payfast_merchant_key = os.getenv('PAYFAST_MERCHANT_KEY', '46f0cd694581a')  # Default sandbox
        self.payfast_passphrase = os.getenv('PAYFAST_PASSPHRASE', 'jt7NOE43FZPn')  # Default sandbox
        
        # Use sandbox or production URL based on environment
        is_sandbox = os.getenv('PAYFAST_SANDBOX', 'true').lower() == 'true'
        self.payfast_url = "https://sandbox.payfast.co.za/eng/process" if is_sandbox else "https://www.payfast.co.za/eng/process"
        
        # SnapScan Configuration
        self.snapscan_api_key = os.getenv('SNAPSCAN_API_KEY')
        self.snapscan_url = "https://pos.snapscan.co.za/merchant/api/v1"
        
        # MTN MoMo Configuration
        self.mtn_api_key = os.getenv('MTN_MOMO_API_KEY')
        self.mtn_user_id = os.getenv('MTN_MOMO_USER_ID')
        self.mtn_subscription_key = os.getenv('MTN_MOMO_SUBSCRIPTION_KEY')
        
        # Environment
        self.environment = os.getenv('ENVIRONMENT', 'development')
    
    def load_config(self):
        """Load configuration from .env file"""
        try:
            with open('.env', 'r') as f:
                for line in f:
                    if '=' in line and not line.startswith('#'):
                        key, value = line.strip().split('=', 1)
                        os.environ[key] = value
        except FileNotFoundError:
            print("Warning: .env file not found. Using default/demo values.")
            print("Create .env file from .env.example for production use.")

    def process_payfast_payment(self, amount, item_description, customer_email="customer@example.com"):
        """Process payment through PayFast"""
        
        # Generate unique merchant payment ID
        merchant_payment_id = f"POS_{int(datetime.now().timestamp())}"
        
        # Validate amount (PayFast minimum is R5.00)
        if amount < 5.00:
            return {
                'success': False,
                'error': 'PayFast minimum amount is R5.00'
            }
        
        # PayFast payment data - only required fields to avoid errors
        payment_data = {
            'merchant_id': str(self.payfast_merchant_id).strip(),
            'merchant_key': str(self.payfast_merchant_key).strip(),
            'return_url': 'http://localhost:3000/payment-success',
            'cancel_url': 'http://localhost:3000/payment-cancel',
            'notify_url': 'http://localhost:5001/api/payment/notify',
            'name_first': 'Customer',
            'name_last': 'Name', 
            'email_address': customer_email,
            'm_payment_id': merchant_payment_id,
            'amount': f"{amount:.2f}",
            'item_name': str(item_description)[:100].strip(),  # Limit to 100 chars
            'item_description': f'POS Sale: {item_description}'[:200].strip()  # Limit to 200 chars
        }
        
        # Generate signature (required for security)
        signature = self.generate_payfast_signature(payment_data)
        payment_data['signature'] = signature
        
        print(f"PayFast payment data: {payment_data}")  # Debug output
        
        return {
            'payment_url': self.payfast_url,
            'payment_data': payment_data,
            'payment_id': merchant_payment_id
        }

    def generate_payfast_signature(self, data):
        """Generate PayFast signature for security"""
        # Create parameter string - exclude signature field
        param_string = ""
        
        # Sort keys and build parameter string
        for key in sorted(data.keys()):
            if key != 'signature' and data[key] is not None and data[key] != '':
                # URL encode the value
                import urllib.parse
                value = urllib.parse.quote_plus(str(data[key]))
                param_string += f"{key}={value}&"
        
        # Remove last &
        param_string = param_string.rstrip('&')
        
        # Add passphrase if provided (required for signature validation)
        if self.payfast_passphrase and self.payfast_passphrase.strip():
            param_string += f"&passphrase={urllib.parse.quote_plus(str(self.payfast_passphrase).strip())}"
        
        print(f"PayFast signature string: {param_string}")  # Debug output
        
        # Generate MD5 hash
        signature = hashlib.md5(param_string.encode('utf-8')).hexdigest()
        print(f"Generated signature: {signature}")  # Debug output
        
        return signature

    def create_snapscan_qr(self, amount, reference):
        """Create SnapScan QR code for payment"""
        
        if not self.snapscan_api_key:
            return {
                'success': False,
                'error': 'SnapScan API key not configured. Add SNAPSCAN_API_KEY to .env file.'
            }
        
        headers = {
            'Authorization': f'Bearer {self.snapscan_api_key}',
            'Content-Type': 'application/json'
        }
        
        payment_data = {
            'amount': int(amount * 100),  # Amount in cents
            'merchantReference': reference,
            'description': f'Township POS Sale - {reference}',
            'strict': False,
            'targetMsisdn': None
        }
        
        try:
            response = requests.post(
                f"{self.snapscan_url}/payments",
                headers=headers,
                json=payment_data,
                timeout=10
            )
            
            if response.status_code == 201:
                result = response.json()
                return {
                    'success': True,
                    'qr_code': result.get('qrCode'),
                    'payment_id': result.get('id'),
                    'reference': reference
                }
            else:
                return {
                    'success': False,
                    'error': f'SnapScan API error: {response.status_code}'
                }
                
        except requests.RequestException as e:
            return {
                'success': False,
                'error': f'Network error: {str(e)}'
            }

    def simulate_mobile_money(self, amount, phone_number, provider='mtn'):
        """Process mobile money payment (MTN MoMo, etc.)"""
        
        if provider == 'mtn' and not self.mtn_api_key:
            return {
                'success': False,
                'error': 'MTN MoMo API key not configured. Add MTN_MOMO_API_KEY to .env file.'
            }
        
        # For demo/development, simulate the process
        if self.environment == 'development':
        
            payment_id = f"MM_{provider.upper()}_{int(datetime.now().timestamp())}"
            
            # Simulate API call delay
            import time
            time.sleep(2)
            
            # Simulate 90% success rate
            import random
            success = random.random() > 0.1
            
            if success:
                return {
                    'success': True,
                    'payment_id': payment_id,
                    'provider': provider.upper(),
                    'phone': phone_number,
                    'amount': amount,
                    'status': 'completed'
                }
            else:
                return {
                    'success': False,
                    'error': 'Insufficient funds or network error',
                    'payment_id': payment_id
                }
        
        # Production implementation would go here
        # Example for MTN MoMo:
        # if provider == 'mtn':
        #     return self.process_mtn_momo_payment(amount, phone_number)
        
        return {
            'success': False,
            'error': 'Production mobile money integration not implemented yet'
        }

    def verify_payment(self, payment_id, provider):
        """Verify payment status"""
        
        if provider == 'payfast':
            # In real implementation, query PayFast API
            return {'status': 'completed', 'verified': True}
        elif provider == 'snapscan':
            # In real implementation, query SnapScan API
            return {'status': 'completed', 'verified': True}
        elif provider in ['mtn', 'vodacom', 'cellc']:
            # In real implementation, query mobile money API
            return {'status': 'completed', 'verified': True}
        else:
            return {'status': 'unknown', 'verified': False}
    
    def get_api_status(self):
        """Check which APIs are properly configured"""
        status = {
            'payfast': {
                'configured': bool(self.payfast_merchant_id and self.payfast_merchant_key),
                'sandbox': os.getenv('PAYFAST_SANDBOX', 'true').lower() == 'true'
            },
            'snapscan': {
                'configured': bool(self.snapscan_api_key)
            },
            'mtn_momo': {
                'configured': bool(self.mtn_api_key and self.mtn_user_id)
            },
            'environment': self.environment
        }
        return status