import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  ProgressBar,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useApp } from '../context/AppContext';

const screenWidth = Dimensions.get('window').width;

const GamificationScreen = () => {
  const { state } = useApp();
  const { creditScore, salesHistory } = state;
  
  const [userLevel, setUserLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState([]);
  const [missions, setMissions] = useState([]);
  const [progressAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    calculateGameStats();
    generateMissions();
    animateProgress();
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
      newBadges.push({
        id: 'first_sales',
        name: 'First Steps',
        icon: '🏪',
        description: '10 transactions completed'
      });
    }
    
    if (creditScore.transaction_count >= 50) {
      newBadges.push({
        id: 'busy_shop',
        name: 'Busy Shop',
        icon: '🔥',
        description: '50 transactions completed'
      });
    }
    
    if (creditScore.score >= 60) {
      newBadges.push({
        id: 'good_credit',
        name: 'Credit Builder',
        icon: '⭐',
        description: 'Good credit score achieved'
      });
    }
    
    if (creditScore.score >= 80) {
      newBadges.push({
        id: 'excellent_credit',
        name: 'Credit Master',
        icon: '👑',
        description: 'Excellent credit score achieved'
      });
    }
    
    // Check for digital payment adoption
    const digitalPayments = salesHistory.filter(sale => sale.payment_method !== 'cash').length;
    const digitalAdoption = salesHistory.length > 0 ? (digitalPayments / salesHistory.length) * 100 : 0;
    
    if (digitalAdoption >= 30) {
      newBadges.push({
        id: 'digital_adopter',
        name: 'Digital Pioneer',
        icon: '📱',
        description: '30% digital payments'
      });
    }
    
    // Check for consistency (sales in last 7 days)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const recentSales = salesHistory.filter(sale => new Date(sale.timestamp) > lastWeek);
    
    if (recentSales.length >= 7) {
      newBadges.push({
        id: 'consistent',
        name: 'Streak Master',
        icon: '🔥',
        description: '7 days of consistent sales'
      });
    }
    
    setBadges(newBadges);
  };

  const generateMissions = () => {
    const activeMissions = [
      {
        id: 'daily_sales',
        title: '🎯 Daily Hustle',
        description: 'Complete 5 transactions today',
        progress: Math.min(getTodaysSales(), 5),
        target: 5,
        reward: '50 XP',
        type: 'daily'
      },
      {
        id: 'digital_payment',
        title: '📱 Go Digital',
        description: 'Accept 3 mobile money payments',
        progress: getDigitalPaymentsToday(),
        target: 3,
        reward: '30 XP + Digital Badge',
        type: 'daily'
      },
      {
        id: 'weekly_volume',
        title: '💰 Weekly Target',
        description: 'Reach R500 in sales this week',
        progress: Math.min(getWeeklySales(), 500),
        target: 500,
        reward: '100 XP',
        type: 'weekly'
      }
    ];
    
    setMissions(activeMissions);
  };

  const animateProgress = () => {
    Animated.timing(progressAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const getTodaysSales = () => {
    const today = new Date().toDateString();
    return salesHistory.filter(sale => 
      new Date(sale.timestamp).toDateString() === today
    ).length;
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

  const getGardenStatus = () => {
    const score = creditScore?.score || 0;
    if (score >= 80) return 'Flourishing!';
    if (score >= 60) return 'Growing well!';
    if (score >= 40) return 'Taking root!';
    return 'Plant your seeds!';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Avatar Section */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Your Credit Avatar</Title>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>{getAvatarEmoji()}</Text>
            <View style={styles.avatarInfo}>
              <Text style={styles.levelText}>Level {userLevel}</Text>
              <Text style={styles.xpText}>{xp} XP</Text>
              <View style={styles.xpBarContainer}>
                <ProgressBar
                  progress={(xp % 100) / 100}
                  color="#2196F3"
                  style={styles.xpBar}
                />
              </View>
              <Text style={styles.nextLevelText}>
                Next level: {100 - (xp % 100)} XP
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Credit Garden */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Credit Garden</Title>
          <View style={styles.gardenContainer}>
            <Text style={styles.gardenEmoji}>{getCreditGarden()}</Text>
            <View style={styles.gardenInfo}>
              <Text style={styles.scoreText}>
                Score: {creditScore?.score || 0}/100
              </Text>
              <Text style={styles.gardenStatus}>{getGardenStatus()}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Daily Missions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Daily Missions</Title>
          {missions.map(mission => (
            <View key={mission.id} style={styles.missionItem}>
              <View style={styles.missionHeader}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Chip mode="outlined" style={styles.rewardChip}>
                  {mission.reward}
                </Chip>
              </View>
              <Text style={styles.missionDescription}>
                {mission.description}
              </Text>
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={mission.progress / mission.target}
                  color="#4CAF50"
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {mission.target === 500 
                    ? `R${mission.progress}/R${mission.target}`
                    : `${mission.progress}/${mission.target}`
                  }
                </Text>
              </View>
              {mission.progress >= mission.target && (
                <View style={styles.completeBadge}>
                  <Icon name="check-circle" size={16} color="#4CAF50" />
                  <Text style={styles.completeText}>Complete!</Text>
                </View>
              )}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Achievements */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Achievements</Title>
          <View style={styles.badgesContainer}>
            {badges.map(badge => (
              <View key={badge.id} style={styles.badgeItem}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeName}>{badge.name}</Text>
                  <Text style={styles.badgeDescription}>
                    {badge.description}
                  </Text>
                </View>
              </View>
            ))}
            {badges.length === 0 && (
              <Text style={styles.noBadgesText}>
                Complete missions to earn badges! 🏆
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Leaderboard */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Township Leaderboard</Title>
          <View style={styles.leaderboardContainer}>
            <View style={[styles.leaderboardItem, styles.currentUser]}>
              <Text style={styles.rank}>🥇</Text>
              <Text style={styles.playerName}>Your Shop</Text>
              <Text style={styles.playerScore}>{creditScore?.score || 0}</Text>
            </View>
            <View style={styles.leaderboardItem}>
              <Text style={styles.rank}>🥈</Text>
              <Text style={styles.playerName}>Thabo's Spaza</Text>
              <Text style={styles.playerScore}>78</Text>
            </View>
            <View style={styles.leaderboardItem}>
              <Text style={styles.rank}>🥉</Text>
              <Text style={styles.playerName}>Nomsa's Store</Text>
              <Text style={styles.playerScore}>65</Text>
            </View>
            <View style={styles.leaderboardItem}>
              <Text style={styles.rank}>4</Text>
              <Text style={styles.playerName}>Lucky's Shop</Text>
              <Text style={styles.playerScore}>52</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Tips */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>💡 Level Up Tips</Title>
          <View style={styles.tipsContainer}>
            <Text style={styles.tipItem}>• Process more transactions daily (+10 XP each)</Text>
            <Text style={styles.tipItem}>• Accept mobile money payments (+15 XP bonus)</Text>
            <Text style={styles.tipItem}>• Maintain consistent sales (+streak bonus)</Text>
            <Text style={styles.tipItem}>• Keep good inventory records (+organization bonus)</Text>
            <Text style={styles.tipItem}>• Build customer relationships (+loyalty bonus)</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  avatarEmoji: {
    fontSize: 64,
    marginRight: 16,
  },
  avatarInfo: {
    flex: 1,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  xpText: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  xpBarContainer: {
    marginVertical: 8,
  },
  xpBar: {
    height: 8,
    borderRadius: 4,
  },
  nextLevelText: {
    fontSize: 12,
    color: '#666',
  },
  gardenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  gardenEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  gardenInfo: {
    flex: 1,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gardenStatus: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
    fontStyle: 'italic',
  },
  missionItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  rewardChip: {
    marginLeft: 8,
  },
  missionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 60,
    textAlign: 'right',
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  badgesContainer: {
    marginTop: 16,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  badgeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badgeDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noBadgesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 16,
  },
  leaderboardContainer: {
    marginTop: 16,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  currentUser: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  rank: {
    fontSize: 18,
    width: 30,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  playerScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  tipsContainer: {
    marginTop: 16,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default GamificationScreen;
