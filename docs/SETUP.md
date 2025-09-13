# Setup Instructions

## Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

## Backend Setup

1. Navigate to the backend directory:
```bash
cd src/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the Flask server:
```bash
python app.py
```

The backend will run on `http://localhost:5000`

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd src/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Database
The system uses SQLite database which will be automatically created when you first run the backend server.

## Testing the System

1. Start both backend and frontend servers
2. Open `http://localhost:3000` in your browser
3. Add some inventory items in the Inventory tab
4. Process sales in the POS tab
5. View analytics and credit score in the Dashboard tab

## Payment Integration (Future)
To integrate with payment providers like Snapscan, Paystack, or MTN Pay, you'll need to:
1. Register for API keys with the payment providers
2. Add the API integration code to the backend
3. Update the frontend to handle payment flows