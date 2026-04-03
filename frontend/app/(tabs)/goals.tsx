import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { useGoalStore, Goal } from '../../stores/goalStore';
import { mockGoals, formatCurrency } from '../../lib/mockData';
import FinlyButton from '../../components/FinlyButton';

const GOAL_EMOJIS = ['🏠', '🚗', '✈️', '💻', '📱', '💍', '🎓', '💪', '🏖️', '🎯', '💰', '🎁'];

const BADGES = [
  { id: 1, name: 'First Step', emoji: '🌱', description: 'Added first transaction', unlocked: true },
  { id: 2, name: 'Week Warrior', emoji: '📅', description: '7-day tracking streak', unlocked: true },
  { id: 3, name: 'Goal Setter', emoji: '🎯', description: 'Created first goal', unlocked: true },
  { id: 4, name: 'Saver', emoji: '💰', description: 'Saved for 30 days', unlocked: false },
  { id: 5, name: 'Budget Boss', emoji: '🧠', description: 'Stayed under budget', unlocked: false },
  { id: 6, name: 'Centurion', emoji: '🏆', description: '100 transactions tracked', unlocked: false },
  { id: 7, name: 'Streak Master', emoji: '⚡', description: '21 day streak', unlocked: false },
  { id: 8, name: 'Transform', emoji: '🦋', description: 'Reduced spending by 20%', unlocked: false },
];

export default function GoalsScreen() {
  const { goals, fetchGoals, addGoal } = useGoalStore();
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [emoji, setEmoji] = useState('🎯');
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');

  const allGoals = goals.length > 0 ? goals : mockGoals;
  const totalSaved = allGoals.reduce((sum, g) => sum + g.saved_amount, 0);

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async () => {
    if (!name || !targetAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await addGoal({
        emoji,
        name,
        target_amount: parseFloat(targetAmount),
        saved_amount: savedAmount ? parseFloat(savedAmount) : 0,
      });
      
      // Reset form
      setEmoji('🎯');
      setName('');
      setTargetAmount('');
      setSavedAmount('');
      setShowAddModal(false);
      Alert.alert('Success', 'Goal created!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const getProgressMessage = (progress: number) => {
    if (progress >= 100) return "Goal achieved! 🎉 Celebrate!";
    if (progress >= 76) return "Almost done! Final push! 🏁";
    if (progress >= 51) return "So close! Don't stop now! ⚡";
    if (progress >= 26) return "Halfway there! Keep going! 🔥";
    return "Just getting started! 💪";
  };

  const getProgressColor = (progress: number): string[] => {
    if (progress < 25) return ['#FF6B6B', '#FF8E53'];
    if (progress < 50) return ['#FFB347', '#FF9900'];
    if (progress < 75) return ['#6C63FF', '#9C63FF'];
    return ['#00D4AA', '#00A8FF'];
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Total Saved Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Saved</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalSaved)}</Text>
          <Text style={styles.summarySubtext}>Across {allGoals.length} active goals</Text>
        </View>

        {/* Goals List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          
          {allGoals.map((goal) => {
            const progress = (goal.saved_amount / goal.target_amount) * 100;
            const remaining = goal.target_amount - goal.saved_amount;
            
            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={styles.goalTitleRow}>
                    <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                    <Text style={styles.goalName}>{goal.name}</Text>
                  </View>
                  {!goal.is_completed && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Active</Text>
                    </View>
                  )}
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <LinearGradient
                    colors={getProgressColor(progress)}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBar, { width: `${Math.min(progress, 100)}%` }]}
                  />
                </View>

                {/* Stats */}
                <View style={styles.goalStats}>
                  <Text style={[styles.goalStat, { color: Colors.income }]}>
                    {formatCurrency(goal.saved_amount)} saved
                  </Text>
                  <Text style={styles.goalStat}>
                    {formatCurrency(remaining)} to go
                  </Text>
                </View>

                <Text style={styles.goalTarget}>Target: {formatCurrency(goal.target_amount)}</Text>
                
                {goal.deadline && (
                  <Text style={styles.goalDeadline}>
                    🗓️ By {new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                )}

                <Text style={styles.goalMessage}>{getProgressMessage(progress)}</Text>

                {/* Progress Badge */}
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>{progress.toFixed(0)}%</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements 🏆</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {BADGES.map((badge) => (
              <View
                key={badge.id}
                style={[
                  styles.badgeCard,
                  !badge.unlocked && styles.badgeCardLocked,
                ]}
              >
                <Text style={[styles.badgeEmoji, !badge.unlocked && styles.badgeEmojiLocked]}>
                  {badge.emoji}
                </Text>
                <Text style={[styles.badgeName, !badge.unlocked && styles.badgeNameLocked]}>
                  {badge.name}
                </Text>
                <Text style={[styles.badgeDescription, !badge.unlocked && styles.badgeDescriptionLocked]}>
                  {badge.description}
                </Text>
                {badge.unlocked ? (
                  <View style={styles.unlockedBadge}>
                    <Text style={styles.unlockedText}>Unlocked</Text>
                  </View>
                ) : (
                  <View style={styles.lockedBadge}>
                    <Ionicons name="lock-closed" size={12} color={Colors.textTertiary} />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Add Goal FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
        <LinearGradient colors={['#6C63FF', '#9C63FF']} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color="#FFF" />
          <Text style={styles.fabText}>Goal</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.modalTitle}>New Goal</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Emoji Picker */}
              <Text style={styles.label}>Choose an emoji</Text>
              <View style={styles.emojiGrid}>
                {GOAL_EMOJIS.map((e) => (
                  <TouchableOpacity
                    key={e}
                    style={[
                      styles.emojiButton,
                      emoji === e && styles.emojiButtonActive,
                    ]}
                    onPress={() => setEmoji(e)}
                  >
                    <Text style={styles.emojiText}>{e}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Goal Name */}
              <Text style={styles.label}>Goal Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Emergency Fund"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={setName}
              />

              {/* Target Amount */}
              <Text style={styles.label}>Target Amount</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountField}
                  placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                />
              </View>

              {/* Already Saved (Optional) */}
              <Text style={styles.label}>Already Saved (Optional)</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountField}
                  placeholder="0"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                  value={savedAmount}
                  onChangeText={setSavedAmount}
                />
              </View>

              {/* Create Button */}
              <FinlyButton
                title="Create Goal"
                onPress={handleAddGoal}
                style={styles.createButton}
              />

              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  summaryCard: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
  },
  summaryLabel: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  summaryAmount: {
    ...Typography.displayLarge,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  summarySubtext: {
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
  goalCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  goalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalEmoji: {
    fontSize: 32,
    marginRight: Spacing.sm,
  },
  goalName: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    flex: 1,
  },
  badge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    ...Typography.labelSmall,
    color: Colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 4,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  goalStat: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  goalTarget: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
  goalDeadline: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  goalMessage: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontStyle: 'italic',
  },
  progressBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    ...Typography.labelMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  badgeCard: {
    width: 120,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginLeft: Spacing.lg,
    alignItems: 'center',
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeEmoji: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  badgeEmojiLocked: {
    opacity: 0.3,
  },
  badgeName: {
    ...Typography.labelMedium,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: Colors.textTertiary,
  },
  badgeDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  badgeDescriptionLocked: {
    color: Colors.textTertiary,
  },
  unlockedBadge: {
    backgroundColor: Colors.income + '20',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unlockedText: {
    ...Typography.labelSmall,
    color: Colors.income,
    fontSize: 9,
  },
  lockedBadge: {
    padding: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 28,
    gap: Spacing.xs,
  },
  fabText: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderSubtle,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  emojiButton: {
    width: 56,
    height: 56,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderSubtle,
  },
  emojiButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  emojiText: {
    fontSize: 28,
  },
  input: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    padding: Spacing.md,
    color: Colors.textPrimary,
    ...Typography.bodyLarge,
    marginBottom: Spacing.sm,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  currencySymbol: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
  },
  amountField: {
    flex: 1,
    color: Colors.textPrimary,
    ...Typography.heading2,
  },
  createButton: {
    marginTop: Spacing.xl,
  },
  cancelButton: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
});
