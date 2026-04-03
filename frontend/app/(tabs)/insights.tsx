import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { mockTransactions, formatCurrency } from '../../lib/mockData';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const [period, setPeriod] = useState<'week' | 'month' | '3months'>('month');

  const transactions = mockTransactions;
  
  // Calculate totals
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Get category breakdown
  const getCategoryData = () => {
    const categories: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    return Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  };

  const categoryData = getCategoryData();
  const maxCategoryAmount = Math.max(...categoryData.map(([_, amount]) => amount));

  // Insights
  const insights = [
    {
      icon: 'trophy' as const,
      title: `Top Category: ${categoryData[0]?.[0] || 'N/A'}`,
      detail: `${formatCurrency(categoryData[0]?.[1] || 0)} spent`,
      impact: 'high' as const,
    },
    {
      icon: 'calendar' as const,
      title: 'Most expensive day',
      detail: 'Weekend spending is higher',
      impact: 'medium' as const,
    },
    {
      icon: 'time' as const,
      title: 'Peak spending time',
      detail: 'Most transactions in the evening',
      impact: 'medium' as const,
    },
    {
      icon: 'trending-up' as const,
      title: 'Spending trend',
      detail: `${transactions.length} transactions this period`,
      impact: 'low' as const,
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return Colors.expense;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.textTertiary;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['week', 'month', '3months'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodButton,
              period === p && styles.periodButtonActive,
            ]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[
                styles.periodText,
                period === p && styles.periodTextActive,
              ]}
            >
              {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : '3 Months'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Spending Overview */}
      <View style={styles.overviewCard}>
        <Text style={styles.overviewAmount}>{formatCurrency(totalExpenses)}</Text>
        <Text style={styles.overviewLabel}>Total Spent</Text>
        <View style={styles.comparisonRow}>
          <Ionicons name="arrow-up" size={16} color={Colors.expense} />
          <Text style={styles.comparisonText}>15% vs last {period}</Text>
        </View>
        <Text style={styles.transactionCount}>in {transactions.length} transactions</Text>
      </View>

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        <View style={styles.categoryList}>
          {categoryData.map(([category, amount]) => {
            const percentage = (amount / totalExpenses) * 100;
            const barWidth = (amount / maxCategoryAmount) * 100;
            
            return (
              <View key={category} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category}</Text>
                  <Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text>
                </View>
                <View style={styles.categoryBarContainer}>
                  <View
                    style={[
                      styles.categoryBar,
                      {
                        width: `${barWidth}%`,
                        backgroundColor: Colors.categories[category as keyof typeof Colors.categories] || Colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.categoryPercentage}>{percentage.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Spending Trend Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Spending Trend</Text>
        <BarChart
          data={{
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [
              {
                data: [3.2, 4.1, 2.8, 3.5],
              },
            ],
          }}
          width={screenWidth - 64}
          height={200}
          yAxisLabel="₹"
          yAxisSuffix="k"
          chartConfig={{
            backgroundColor: Colors.backgroundSecondary,
            backgroundGradientFrom: Colors.backgroundSecondary,
            backgroundGradientTo: Colors.backgroundSecondary,
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
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

      {/* Key Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What the data says</Text>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightCard}>
            <View
              style={[
                styles.insightIcon,
                { backgroundColor: getImpactColor(insight.impact) + '20' },
              ]}
            >
              <Ionicons
                name={insight.icon}
                size={20}
                color={getImpactColor(insight.impact)}
              />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDetail}>{insight.detail}</Text>
            </View>
            <View style={[styles.impactBadge, { backgroundColor: getImpactColor(insight.impact) + '20' }]}>
              <Text style={[styles.impactText, { color: getImpactColor(insight.impact) }]}>
                {insight.impact.toUpperCase()}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Future Impact */}
      <View style={styles.futureImpactCard}>
        <View style={styles.futureHeader}>
          <Text style={styles.futureTitle}>Future Impact 🔮</Text>
        </View>
        <Text style={styles.futureSubtitle}>
          What if you reduced {categoryData[0]?.[0] || 'spending'} by 20%?
        </Text>
        <View style={styles.futureCalculation}>
          <Text style={styles.futureAmount}>
            Save {formatCurrency((categoryData[0]?.[1] || 0) * 0.2)}/month
          </Text>
          <Text style={styles.futureYearly}>
            → {formatCurrency((categoryData[0]?.[1] || 0) * 0.2 * 12)}/year
          </Text>
        </View>
        <Text style={styles.futureEquivalent}>That's a trip to Goa! ✈️</Text>
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
  periodSelector: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodText: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  periodTextActive: {
    color: Colors.textPrimary,
  },
  overviewCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
  },
  overviewAmount: {
    ...Typography.displayMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  overviewLabel: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  comparisonText: {
    ...Typography.bodySmall,
    color: Colors.expense,
  },
  transactionCount: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  categoryList: {
    paddingHorizontal: Spacing.lg,
  },
  categoryItem: {
    marginBottom: Spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  categoryName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  categoryAmount: {
    ...Typography.labelMedium,
    color: Colors.textPrimary,
  },
  categoryBarContainer: {
    height: 8,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 4,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryPercentage: {
    ...Typography.bodySmall,
    color: Colors.textTertiary,
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
  chartTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  chart: {
    marginVertical: Spacing.sm,
    borderRadius: 16,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  insightDetail: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  impactBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 6,
  },
  impactText: {
    ...Typography.labelSmall,
    fontSize: 9,
  },
  futureImpactCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  futureHeader: {
    marginBottom: Spacing.sm,
  },
  futureTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
  },
  futureSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  futureCalculation: {
    marginBottom: Spacing.md,
  },
  futureAmount: {
    ...Typography.heading2,
    color: Colors.primary,
    marginBottom: 4,
  },
  futureYearly: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
  },
  futureEquivalent: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});
