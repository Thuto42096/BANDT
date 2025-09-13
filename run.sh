#!/bin/bash

echo "🚀 Starting Township POS System with Gamification..."

# Kill any existing processes
pkill -f "python3.*server_5001.py" 2>/dev/null
pkill -f "npm start" 2>/dev/null

# Start backend server
echo "📡 Starting backend server on port 5001..."
cd src/backend
python3 server_5001.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend
echo "🌐 Starting React frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ System started successfully!"
echo "📡 Backend: http://localhost:5001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "🎮 Features available:"
echo "   • POS - Process sales with change calculation"
echo "   • Inventory - Add and manage stock"
echo "   • Dashboard - View analytics and credit score"
echo "   • 🎮 Game - Gamification with avatars, missions, badges"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait