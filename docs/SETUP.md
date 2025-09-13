# Setup Instructions - Township POS + Credit Score System

## Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

## Quick Start (Recommended)

### Option 1: One-Command Setup
```bash
./run.sh
```
This automatically starts both backend and frontend servers.

### Option 2: Manual Setup

## Backend Setup

1. Navigate to the backend directory:
```bash
cd src/backend
```

2. Start the server (no virtual environment needed):
```bash
python3 server_5001.py
```

The backend will run on `http://localhost:5001`

**Note**: The system uses a lightweight HTTP server that doesn't require Flask installation.

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

## Database & Demo Data

### Automatic Database Creation
The system uses SQLite database which will be automatically created when you first run the backend server.

### Load Demo Data (Recommended)
To see the full gamification features in action:
```bash
cd scripts
python3 gamification_demo.py
```

This creates:
- Sample inventory items
- 14 days of sales history
- Level 22 avatar with all badges
- 100/100 credit score
- Flourishing credit garden

## System Features

### 1. **POS Tab** - Category-Based Interface
- **Browse by Categories**: Food & Drinks, Airtime & Data, Cigarettes, Household, Other
- **Visual Item Selection**: Click category → select item cards
- **Smart Inventory**: Stock levels, out-of-stock indicators
- **Change Calculator**: Automatic change calculation for cash payments
- **Daily Missions Sidebar**: Real-time progress tracking

### 2. **Inventory Tab** - Stock Management
- Add new products with categories
- Monitor stock levels with low-stock alerts
- Real-time inventory updates

### 3. **Dashboard Tab** - Analytics & Credit
- Township Credit Score (0-100)
- Loan eligibility based on score
- Sales analytics with charts
- Payment method breakdown

### 4. **🎮 Game Tab** - Gamification Features
- **Credit Avatar**: Level up from 🌱 to 👑
- **Credit Garden**: Grows from 🌰 to 🌳🌺🦋
- **Daily Missions**: Complete for XP rewards
- **Badge System**: Unlock achievements
- **Township Leaderboard**: Compete with other shops

## Testing the System

### Basic Workflow
1. **Start servers**: Use `./run.sh` or manual setup
2. **Access system**: Open `http://localhost:3000`
3. **Add inventory**: Go to Inventory tab, add items
4. **Process sales**: Use category-based POS interface
5. **View progress**: Check Dashboard and Game tabs

### Advanced Testing
1. **Load demo data**: Run `python3 scripts/gamification_demo.py`
2. **Test categories**: Try different item categories in POS
3. **Complete missions**: Process sales to complete daily objectives
4. **Check gamification**: View avatar level, badges, garden growth
5. **Test payments**: Try cash with change calculation

## Troubleshooting

### Common Issues
- **Port conflicts**: Kill existing processes with `pkill -f python3`
- **Frontend won't start**: Run `npm install` in `src/frontend`
- **Backend errors**: Use `python3 server_5001.py` instead of `python`
- **Database issues**: Delete `pos_system.db` and restart

### System Requirements
- **Backend**: Python 3.8+ (no additional packages required)
- **Frontend**: Node.js 16+, React 18
- **Database**: SQLite (included with Python)
- **Browser**: Modern browser with JavaScript enabled

## Architecture Overview

### Backend (Python)
- Lightweight HTTP server on port 5001
- SQLite database for transactions and scoring
- RESTful API endpoints
- Automatic credit score calculation

### Frontend (React)
- Category-based POS interface
- Real-time gamification features
- Responsive design for tablets/mobile
- Charts and analytics with Recharts

### Gamification Engine
- XP system based on transactions
- Mission system with daily objectives
- Badge achievements for milestones
- Credit garden visualization
- Township leaderboard competition

## Future Enhancements
- **Payment Integration**: Snapscan, Paystack, MTN Pay APIs
- **Mobile App**: React Native version
- **Multi-language**: Local language support
- **Offline Mode**: Sync when connection available
- **Advanced Analytics**: ML-based insights