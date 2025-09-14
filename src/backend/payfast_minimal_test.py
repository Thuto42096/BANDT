#!/usr/bin/env python3
"""
Minimal PayFast test to identify the exact issue
"""

import hashlib
import urllib.parse

# Your PayFast credentials
MERCHANT_ID = "31742791"
MERCHANT_KEY = "uqaeapgutmsua"
PASSPHRASE = "-20021980Sihle"

def create_minimal_payfast_data():
    """Create minimal PayFast payment data"""
    
    # Minimal required fields only
    payment_data = {
        'merchant_id': MERCHANT_ID,
        'merchant_key': MERCHANT_KEY,
        'amount': '10.00',  # Above R5 minimum
        'item_name': 'Test Item',
        'return_url': 'http://localhost:3000/success',
        'cancel_url': 'http://localhost:3000/cancel',
        'notify_url': 'http://localhost:5001/notify'
    }
    
    # Generate signature
    signature = generate_signature(payment_data)
    payment_data['signature'] = signature
    
    return payment_data

def generate_signature(data):
    """Generate PayFast signature"""
    # Build parameter string
    param_string = ""
    for key in sorted(data.keys()):
        if key != 'signature':
            param_string += f"{key}={urllib.parse.quote_plus(str(data[key]))}&"
    
    # Remove last &
    param_string = param_string.rstrip('&')
    
    # Add passphrase
    param_string += f"&passphrase={urllib.parse.quote_plus(PASSPHRASE)}"
    
    print(f"Signature string: {param_string}")
    
    # Generate MD5 hash
    signature = hashlib.md5(param_string.encode('utf-8')).hexdigest()
    print(f"Generated signature: {signature}")
    
    return signature

def create_html_form():
    """Create HTML form for manual testing"""
    
    data = create_minimal_payfast_data()
    
    html = """
<!DOCTYPE html>
<html>
<head>
    <title>PayFast Test</title>
</head>
<body>
    <h2>PayFast Payment Test</h2>
    <form action="https://www.payfast.co.za/eng/process" method="post">
"""
    
    for key, value in data.items():
        html += f'        <input type="hidden" name="{key}" value="{value}">\n'
    
    html += """
        <input type="submit" value="Pay with PayFast">
    </form>
    
    <h3>Debug Info:</h3>
    <pre>
"""
    
    for key, value in data.items():
        html += f"{key}: {value}\n"
    
    html += """
    </pre>
</body>
</html>
"""
    
    return html

if __name__ == "__main__":
    print("Creating minimal PayFast test...")
    
    # Create payment data
    data = create_minimal_payfast_data()
    
    print("\nPayment Data:")
    for key, value in data.items():
        print(f"  {key}: {value}")
    
    # Create HTML test file
    html = create_html_form()
    with open('payfast_test.html', 'w') as f:
        f.write(html)
    
    print("\nHTML test file created: payfast_test.html")
    print("Open this file in a browser to test PayFast payment")
    
    # Check if using production
    if "sandbox" not in "https://www.payfast.co.za/eng/process":
        print("\nWARNING: Using PRODUCTION PayFast - real money will be charged!")
        print("Change to sandbox URL for testing: https://sandbox.payfast.co.za/eng/process")