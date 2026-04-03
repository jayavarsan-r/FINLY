import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { useAuthStore } from '../../stores/authStore';
import { useTransactionStore } from '../../stores/transactionStore';
import { useGoalStore } from '../../stores/goalStore';
import FinlyButton from '../../components/FinlyButton';
import { mockTransactions, mockGoals, formatCurrency, formatDate, getCategoryIcon } from '../../lib/mockData';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { goals, fetchGoals } = useGoalStore();
  const [refreshing, setRefreshing] = useState(false);
  
  // Use mock data for now
  const allTransactions = transactions.length > 0 ? transactions : mockTransactions;
  const allGoals = goals.length > 0 ? goals : mockGoals;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([fetchTransactions(), fetchGoals()]);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate totals
  const totalIncome = allTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = allTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  // Calculate habit score (simplified)
  const habitScore = Math.min(100, Math.floor((allTransactions.length * 2) + (parseFloat(savingsRate.toString()) / 2)));

  // Get weekly data for chart
  const getWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekData = days.map(() => ({ income: 0, expense: 0 }));

    allTransactions.forEach((t) => {
      const tDate = new Date(t.date);
      const diffDays = Math.floor((today.getTime() - tDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        const dayIndex = (7 - diffDays - 1) % 7;
        if (t.type === 'income') {
          weekData[dayIndex].income += t.amount;
        } else {
          weekData[dayIndex].expense += t.amount;
        }
      }
    });

    return {
      labels: days,
      datasets: [
        {
          data: weekData.map(d => d.expense / 1000), // Convert to thousands
          color: () => Colors.expense,
        },
      ],
    };
  };

  // Get category breakdown
  const getCategoryData = () => {
    const categories: { [key: string]: number } = {};
    allTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    const colors = [Colors.expense, Colors.primary, Colors.warning, Colors.income, '#FF85C2', '#888888'];
    return Object.entries(categories)
      .map(([name, amount], index) => ({
        name,
        amount,
        color: colors[index % colors.length],
        legendFontColor: Colors.textSecondary,
        legendFontSize: 12,
      }))
      .slice(0, 6);
  };

  const getScoreMessage = () => {
    if (habitScore >= 86) return "Excellent! Finance guru \ud83c\udfc6";
    if (habitScore >= 66) return "Good! You're on track \ud83c\udfaf";
    if (habitScore >= 41) return "Getting better \ud83d\udcaa";
    return "Needs attention \ud83d\ude2c";
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}! \ud83d\udc4b</Text>
          <Text style={styles.subtitle}>{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
        </View>
        <TouchableOpacity style={styles.avatar}>
          <LinearGradient colors={['#6C63FF', '#9C63FF']} style={styles.avatarGradient}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Balance Card */}
      <LinearGradient
        colors={['#6C63FF', '#4F46E5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.balanceCard}
      >
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        <View style={styles.balanceRow}>
          <View style={styles.balanceItem}>
            <Ionicons name="arrow-up-circle" size={16} color={Colors.income} />
            <Text style={styles.balanceItemText}>{formatCurrency(totalIncome)}</Text>
          </View>
          <View style={styles.balanceItem}>
            <Ionicons name="arrow-down-circle" size={16} color={Colors.expense} />
            <Text style={styles.balanceItemText}>{formatCurrency(totalExpenses)}</Text>
          </View>
        </View>
        <View style={styles.balanceDivider} />
        <Text style={styles.balancePeriod}>This Month</Text>
      </LinearGradient>

      {/* Habit Score Card */}
      <View style={styles.habitCard}>
        <View style={styles.habitScoreRing}>
          <Text style={styles.habitScoreNumber}>{habitScore}</Text>
          <Text style={styles.habitScoreTotal}>/100</Text>
        </View>
        <View style={styles.habitInfo}>
          <Text style={styles.habitTitle}>Habit Score</Text>
          <Text style={styles.habitMessage}>{getScoreMessage()}</Text>
          <Text style={styles.habitStreak}>{allTransactions.length} transactions \ud83d\udd25</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="receipt-outline" size={24} color={Colors.primary} />
          <Text style={styles.statNumber}>{allTransactions.length}</Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="wallet-outline" size={24} color={Colors.income} />
          <Text style={[styles.statNumber, { color: Colors.income }]}>{savingsRate}%</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flag-outline" size={24} color={Colors.goal} />
          <Text style={[styles.statNumber, { color: Colors.goal }]}>{allGoals.length}</Text>
          <Text style={styles.statLabel}>Goals</Text>
        </View>
      </View>

      {/* Weekly Chart */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Weekly Spending</Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>This Week</Text>
          </View>
        </View>
        <BarChart
          data={getWeeklyData()}
          width={screenWidth - 64}
          height={180}
          yAxisLabel="\u20b9"
          yAxisSuffix="k"
          chartConfig={{
            backgroundColor: Colors.backgroundSecondary,
            backgroundGradientFrom: Colors.backgroundSecondary,
            backgroundGradientTo: Colors.backgroundSecondary,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
            labelColor: () => Colors.textSecondary,
            style: {
              borderRadius: 16,
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: Colors.borderSubtle,
            },
          }}
          style={styles.chart}
        />
      </View>

      {/* Category Breakdown */}
      {getCategoryData().length > 0 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Where's it going?</Text>
          <PieChart
            data={getCategoryData()}
            width={screenWidth - 64}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      {/* Behavioral Nudge */}
      <View style={styles.nudgeCard}>
        <Ionicons name="bulb" size={24} color={Colors.primary} />
        <View style={styles.nudgeContent}>
          <Text style={styles.nudgeTitle}>Smart Insight</Text>
          <Text style={styles.nudgeText}>
            You've tracked {allTransactions.length} transactions! Keep it up to unlock more insights.
          </Text>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
            <Text style={styles.seeAll}>See all \u2192</Text>
          </TouchableOpacity>
        </View>
        {allTransactions.slice(0, 5).map((transaction) => (
          <View key={transaction.id} style={styles.transactionTile}>
            <View style={[styles.transactionIcon, { backgroundColor: transaction.type === 'income' ? Colors.income + '20' : Colors.expense + '20' }]}>
              <Ionicons
                name={getCategoryIcon(transaction.category) as any}
                size={20}
                color={transaction.type === 'income' ? Colors.income : Colors.expense}
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>{transaction.notes || transaction.category}</Text>
              <Text style={styles.transactionDate}>{transaction.category} • {formatDate(transaction.date)}</Text>
            </View>
            <Text style={[styles.transactionAmount, { color: transaction.type === 'income' ? Colors.income : Colors.expense }]}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </Text>
          </View>
        ))}
      </View>

      {/* Active Goals Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Goals</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/goals')}>
            <Text style={styles.seeAll}>See all \u2192</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {allGoals.map((goal) => {
            const progress = (goal.saved_amount / goal.target_amount) * 100;
            return (
              <View key={goal.id} style={styles.goalCard}>
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <Text style={styles.goalName}>{goal.name}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.goalProgress}>
                  {formatCurrency(goal.saved_amount)} of {formatCurrency(goal.target_amount)}
                </Text>
                <View style={styles.goalBadge}>
                  <Text style={styles.goalBadgeText}>{progress.toFixed(0)}%</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  greeting: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...Typography.heading2,
    color: Colors.textPrimary,
  },
  balanceCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 24,
  },
  balanceLabel: {
    ...Typography.labelMedium,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    ...Typography.displayLarge,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  balanceItemText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  balanceDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: Spacing.sm,
  },
  balancePeriod: {
    ...Typography.labelSmall,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  habitCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  habitScoreRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  habitScoreNumber: {
    ...Typography.heading1,
    color: Colors.textPrimary,
  },
  habitScoreTotal: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  habitInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  habitTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  habitMessage: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  habitStreak: {
    ...Typography.labelMedium,
    color: Colors.warning,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
  },
  statNumber: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  statLabel: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  chartTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
  },
  chip: {
    backgroundColor: Colors.backgroundTertiary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipText: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
  },
  chart: {
    marginVertical: Spacing.sm,
    borderRadius: 16,
  },
  nudgeCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  nudgeContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  nudgeTitle: {
    ...Typography.labelLarge,
    color: Colors.primary,
    marginBottom: 4,
  },
  nudgeText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
  },
  seeAll: {
    ...Typography.labelMedium,
    color: Colors.primary,
  },
  transactionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  transactionDate: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  transactionAmount: {
    ...Typography.labelLarge,
    fontWeight: '600',
  },
  goalCard: {
    width: 160,
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginLeft: Spacing.lg,
  },
  goalEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  goalName: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 3,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  goalProgress: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  goalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  goalBadgeText: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
});
