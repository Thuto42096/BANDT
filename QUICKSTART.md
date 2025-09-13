# 🚀 Quick Start Guide

## Run the Complete System

```bash
./run.sh
```

This will start both backend and frontend automatically.

## Manual Setup (Alternative)

### 1. Start Backend Server
```bash
cd src/backend
python3 server_5001.py
```

### 2. Start Frontend (New Terminal)
```bash
cd src/frontend
npm start
```

## 🎮 Access the System

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001

## 🎯 Features to Try

### 1. **POS Tab**
- Add items to inventory first
- Process sales with change calculation
- Try different payment methods

### 2. **Inventory Tab** 
- Add new products (Bread, Milk, Airtime, etc.)
- Monitor stock levels

### 3. **Dashboard Tab**
- View credit score and analytics
- See loan eligibility
- Check sales charts

### 4. **🎮 Game Tab** (NEW!)
- See your credit avatar and level
- Complete daily missions
- Earn badges and grow your credit garden
- Compete on the township leaderboard

## 🎮 Gamification Features

- **Avatar System**: Level up from 🌱 to 👑
- **Credit Garden**: Watch it grow from 🌰 to 🌳🌺🦋
- **Missions**: Daily and weekly challenges
- **Badges**: Unlock achievements for good habits
- **Leaderboard**: Compete with other township shops

## 📊 Demo Data

The system comes pre-loaded with demo data showing:
- Level 22 avatar
- 100/100 credit score
- All badges unlocked
- Flourishing garden

## 🛠 Troubleshooting

- If port 5001 is busy, kill processes: `pkill -f python3`
- If npm fails, run: `cd src/frontend && npm install`
- Check that both servers are running before accessing frontend