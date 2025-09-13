import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

function Gamification({ creditScore, salesHistory }) {
  const [userLevel, setUserLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState([]);
  const [missions, setMissions] = useState([]);
  const [avatar, setAvatar] = useState({ level: 1, accessories: [] });

  useEffect(() => {
    calculateGameStats();
    generateMissions();
  }, [creditScore, salesHistory]);

  const calculateGameStats = () => {
    if (!creditScore || !salesHistory) return;

    // Calculate XP based on business performance
    const baseXP = creditScore.transaction_count * 10 + creditScore.total_sales / 5;
    const level = Math.floor(baseXP / 100) + 1;
    
    setXp(Math.floor(baseXP));
    setUserLevel(level);
    
    // Check for badges
    checkBadges();
  };

  const checkBadges = () => {
    const newBadges = [];
    
    if (creditScore.transaction_count >= 10) {
      newBadges.push({ id: 'first_sales', name: 'First Steps', icon: '🏪', description: '10 transactions completed' });
    }
    
    if (creditScore.transaction_count >= 50) {
      newBadges.push({ id: 'busy_shop', name: 'Busy Shop', icon: '🔥', description: '50 transactions completed' });
    }
    
    if (creditScore.score >= 60) {
      newBadges.push({ id: 'good_credit', name: 'Credit Builder', icon: '⭐', description: 'Good credit score achieved' });
    }
    
    if (creditScore.score >= 80) {
      newBadges.push({ id: 'excellent_credit', name: 'Credit Master', icon: '👑', description: 'Excellent credit score achieved' });
    }
    
    // Check for digital payment adoption
    const digitalPayments = salesHistory.filter(sale => sale.payment_method !== 'cash').length;
    const digitalAdoption = (digitalPayments / salesHistory.length) * 100;
    
    if (digitalAdoption >= 30) {
      newBadges.push({ id: 'digital_adopter', name: 'Digital Pioneer', icon: '📱', description: '30% digital payments' });
    }
    
    // Check for consistency (sales in last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentSales = salesHistory.filter(sale => new Date(sale.timestamp) > lastWeek);
    
    if (recentSales.length >= 7) {
      newBadges.push({ id: 'consistent', name: 'Streak Master', icon: '🔥', description: '7 days of consistent sales' });
    }
    
    setBadges(newBadges);
  };

  const generateMissions = () => {
    const activeMissions = [
      {
        id: 'daily_sales',
        title: 'Daily Hustle',
        description: 'Complete 5 transactions today',
        progress: Math.min(getTodaysSales(), 5),
        target: 5,
        reward: '50 XP',
        type: 'daily'
      },
      {
        id: 'digital_payment',
        title: 'Go Digital',
        description: 'Accept 3 mobile money payments',
        progress: getDigitalPaymentsToday(),
        target: 3,
        reward: '30 XP + Digital Badge',
        type: 'daily'
      },
      {
        id: 'weekly_volume',
        title: 'Weekly Target',
        description: 'Reach R500 in sales this week',
        progress: Math.min(getWeeklySales(), 500),
        target: 500,
        reward: '100 XP',
        type: 'weekly'
      }
    ];
    
    setMissions(activeMissions);
  };

  const getTodaysSales = () => {
    const today = new Date().toDateString();
    return salesHistory.filter(sale => new Date(sale.timestamp).toDateString() === today).length;
  };

  const getDigitalPaymentsToday = () => {
    const today = new Date().toDateString();
    return salesHistory.filter(sale => 
      new Date(sale.timestamp).toDateString() === today && 
      sale.payment_method !== 'cash'
    ).length;
  };

  const getWeeklySales = () => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return salesHistory
      .filter(sale => new Date(sale.timestamp) > lastWeek)
      .reduce((sum, sale) => sum + sale.total, 0);
  };

  const getAvatarEmoji = () => {
    if (userLevel >= 10) return '👑';
    if (userLevel >= 5) return '🏆';
    if (userLevel >= 3) return '⭐';
    return '🌱';
  };

  const getCreditGarden = () => {
    const score = creditScore?.score || 0;
    if (score >= 80) return '🌳🌺🦋'; // Flourishing garden
    if (score >= 60) return '🌿🌸🐝'; // Growing garden
    if (score >= 40) return '🌱🌼🐛'; // Young garden
    return '🌰💧🐛'; // Seed stage
  };

  return (
    <div className="gamification-container">
      <h2>🎮 Credit Building Game</h2>
      
      <div className="game-grid">
        {/* Avatar Section */}
        <div className="avatar-card">
          <h3>Your Credit Avatar</h3>
          <div className="avatar-display">
            <div className="avatar-emoji">{getAvatarEmoji()}</div>
            <div className="avatar-info">
              <p><strong>Level {userLevel}</strong></p>
              <p>{xp} XP</p>
              <div className="xp-bar">
                <div 
                  className="xp-progress" 
                  style={{ width: `${(xp % 100)}%` }}
                ></div>
              </div>
              <p className="next-level">Next level: {100 - (xp % 100)} XP</p>
            </div>
          </div>
        </div>

        {/* Credit Garden */}
        <div className="garden-card">
          <h3>Credit Garden</h3>
          <div className="garden-display">
            <div className="garden-emoji">{getCreditGarden()}</div>
            <p>Score: {creditScore?.score || 0}/100</p>
            <p className="garden-status">
              {creditScore?.score >= 80 ? 'Flourishing!' :
               creditScore?.score >= 60 ? 'Growing well!' :
               creditScore?.score >= 40 ? 'Taking root!' : 'Plant your seeds!'}
            </p>
          </div>
        </div>

        {/* Missions */}
        <div className="missions-card">
          <h3>Daily Missions</h3>
          <div className="missions-list">
            {missions.map(mission => (
              <div key={mission.id} className="mission-item">
                <div className="mission-header">
                  <span className="mission-title">{mission.title}</span>
                  <span className="mission-reward">{mission.reward}</span>
                </div>
                <p className="mission-description">{mission.description}</p>
                <div className="mission-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {mission.progress}/{mission.target}
                  </span>
                </div>
                {mission.progress >= mission.target && (
                  <div className="mission-complete">✅ Complete!</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="badges-card">
          <h3>Achievements</h3>
          <div className="badges-grid">
            {badges.map(badge => (
              <div key={badge.id} className="badge-item">
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-info">
                  <p className="badge-name">{badge.name}</p>
                  <p className="badge-description">{badge.description}</p>
                </div>
              </div>
            ))}
            {badges.length === 0 && (
              <p className="no-badges">Complete missions to earn badges! 🏆</p>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="leaderboard-card">
          <h3>Township Leaderboard</h3>
          <div className="leaderboard-list">
            {(() => {
              const userScore = creditScore?.score || 0;
              const competitors = [
                { name: "Thabo's Spaza", score: 78 },
                { name: "Nomsa's Store", score: 65 },
                { name: "Lucky's Shop", score: 52 },
                { name: "Sipho's Corner", score: 45 },
                { name: "Mama's Shop", score: 38 }
              ];
              
              const allShops = [
                { name: "Your Shop", score: userScore, isUser: true },
                ...competitors
              ].sort((a, b) => b.score - a.score);
              
              const getRankEmoji = (index) => {
                if (index === 0) return "🥇";
                if (index === 1) return "🥈";
                if (index === 2) return "🥉";
                return (index + 1).toString();
              };
              
              return allShops.slice(0, 6).map((shop, index) => (
                <div key={shop.name} className={`leaderboard-item ${shop.isUser ? 'current-user' : ''}`}>
                  <span className="rank">{getRankEmoji(index)}</span>
                  <span className="name">{shop.name}</span>
                  <span className="score">{shop.score}</span>
                </div>
              ));
            })()
}
          </div>
        </div>

        {/* Tips */}
        <div className="tips-card">
          <h3>💡 Level Up Tips</h3>
          <ul className="tips-list">
            <li>Process more transactions daily (+10 XP each)</li>
            <li>Accept mobile money payments (+15 XP bonus)</li>
            <li>Maintain consistent sales (+streak bonus)</li>
            <li>Keep good inventory records (+organization bonus)</li>
            <li>Build customer relationships (+loyalty bonus)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Gamification;