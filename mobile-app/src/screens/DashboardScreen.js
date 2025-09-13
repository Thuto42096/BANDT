import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Button, Title, Paragraph, Chip } from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useApp } from '../context/AppContext';

const screenWidth = Dimensions.get('window').width;

const DashboardScreen = () => {
  const { state, actions } = useApp();
  const { creditScore, salesHistory, isOnline, isSyncing } = state;
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Data is automatically loaded through context
      // This could trigger additional calculations if needed
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (isOnline) {
        await actions.syncNow();
      }
      await loadDashboardData();
    } catch (error) {
      Alert.alert('Refresh Failed', error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const getCreditRating = (score) => {
    if (score >= 80) return { rating: 'Excellent', color: '#4CAF50' };
    if (score >= 60) return { rating: 'Good', color: '#2196F3' };
    if (score >= 40) return { rating: 'Fair', color: '#FF9800' };
    return { rating: 'Poor', color: '#F44336' };
  };

  const getLoanEligibility = (score) => {
    if (score >= 80) return { amount: 5000, rate: '12%' };
    if (score >= 60) return { amount: 3000, rate: '15%' };
    if (score >= 40) return { amount: 1500, rate: '18%' };
    return { amount: 500, rate: '22%' };
  };

  const getPaymentMethodData = () => {
    const paymentMethods = {};
    
    salesHistory.forEach(sale => {
      const method = sale.payment_method;
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    return Object.entries(paymentMethods).map(([name, value], index) => ({
      name,
      value,
      color: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    }));
  };

  const handleApplyLoan = () => {
    Alert.alert(
      'Loan Application',
      'This feature will connect you with microfinance partners. Coming soon!',
      [{ text: 'OK' }]
    );
  };

  if (!creditScore) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  const { rating, color } = getCreditRating(creditScore.score);
  const loanInfo = getLoanEligibility(creditScore.score);
  const paymentMethodData = getPaymentMethodData();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Sync Status */}
      {!isOnline && (
        <Card style={[styles.card, styles.offlineCard]}>
          <Card.Content style={styles.offlineContent}>
            <Icon name="cloud-off" size={20} color="#FF9800" />
            <Text style={styles.offlineText}>Working Offline</Text>
          </Card.Content>
        </Card>
      )}

      {isSyncing && (
        <Card style={[styles.card, styles.syncCard]}>
          <Card.Content style={styles.syncContent}>
            <Icon name="sync" size={20} color="#2196F3" />
            <Text style={styles.syncText}>Syncing data...</Text>
          </Card.Content>
        </Card>
      )}

      {/* Credit Score Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Township Credit Score</Title>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreNumber, { color }]}>
              {creditScore.score}
            </Text>
            <Chip mode="outlined" style={[styles.ratingChip, { borderColor: color }]}>
              {rating}
            </Chip>
          </View>
          <View style={styles.scoreDetails}>
            <Text style={styles.detailText}>
              Total Sales: R{creditScore.total_sales?.toFixed(2) || 0}
            </Text>
            <Text style={styles.detailText}>
              Transactions: {creditScore.transaction_count || 0}
            </Text>
            <Text style={styles.detailText}>
              Avg Transaction: R{creditScore.avg_transaction?.toFixed(2) || 0}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Loan Eligibility Card */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Loan Eligibility</Title>
          <View style={styles.loanInfo}>
            <Text style={styles.loanAmount}>Up to R{loanInfo.amount}</Text>
            <Text style={styles.loanRate}>Interest Rate: {loanInfo.rate}</Text>
            <Button
              mode="contained"
              onPress={handleApplyLoan}
              style={styles.loanButton}
            >
              Apply for Loan
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Payment Methods Chart */}
      {paymentMethodData.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Payment Methods</Title>
            <View style={styles.chartContainer}>
              <PieChart
                data={paymentMethodData}
                width={screenWidth - 60}
                height={200}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Recent Sales */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Recent Sales</Title>
          <View style={styles.salesList}>
            {salesHistory.slice(0, 5).map((sale, index) => (
              <View key={sale.id || index} style={styles.saleItem}>
                <View style={styles.saleInfo}>
                  <Text style={styles.saleItemName}>
                    {sale.item_name} x{sale.quantity}
                  </Text>
                  <Text style={styles.saleTotal}>R{sale.total}</Text>
                </View>
                <Chip mode="outlined" style={styles.paymentChip}>
                  {sale.payment_method}
                </Chip>
              </View>
            ))}
            {salesHistory.length === 0 && (
              <Text style={styles.noSalesText}>No sales recorded yet</Text>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  offlineCard: {
    backgroundColor: '#FFF3E0',
  },
  offlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineText: {
    marginLeft: 8,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  syncCard: {
    backgroundColor: '#E3F2FD',
  },
  syncContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncText: {
    marginLeft: 8,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    marginRight: 16,
  },
  ratingChip: {
    alignSelf: 'flex-start',
  },
  scoreDetails: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  loanInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  loanAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  loanRate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  loanButton: {
    marginTop: 8,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  salesList: {
    marginTop: 16,
  },
  saleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  saleInfo: {
    flex: 1,
  },
  saleItemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  saleTotal: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  paymentChip: {
    marginLeft: 8,
  },
  noSalesText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 16,
  },
});

export default DashboardScreen;
