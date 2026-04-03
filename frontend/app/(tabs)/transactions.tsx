import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { useTransactionStore, Transaction } from '../../stores/transactionStore';
import { mockTransactions, formatCurrency, formatDate, getCategoryIcon } from '../../lib/mockData';
import FinlyButton from '../../components/FinlyButton';

const CATEGORIES = [
  { name: 'Food', icon: 'restaurant', color: Colors.expense },
  { name: 'Transport', icon: 'car', color: Colors.primary },
  { name: 'Shopping', icon: 'cart', color: Colors.warning },
  { name: 'Bills', icon: 'receipt', color: Colors.income },
  { name: 'Entertainment', icon: 'musical-notes', color: '#FF85C2' },
  { name: 'Health', icon: 'fitness', color: '#4ECDC4' },
  { name: 'Education', icon: 'book', color: '#95E1D3' },
  { name: 'Other', icon: 'ellipsis-horizontal', color: '#888888' },
];

const MOODS = [
  { emoji: '😄', value: 'great', label: 'Great' },
  { emoji: '😊', value: 'good', label: 'Good' },
  { emoji: '😐', value: 'neutral', label: 'Neutral' },
  { emoji: '😟', value: 'sad', label: 'Sad' },
  { emoji: '😠', value: 'stressed', label: 'Stressed' },
];

export default function TransactionsScreen() {
  const { transactions, fetchTransactions, addTransaction, deleteTransaction } = useTransactionStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Food');
  const [notes, setNotes] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | undefined>();

  // Use mock data if no transactions
  const allTransactions = transactions.length > 0 ? transactions : mockTransactions;

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions
  const filteredTransactions = allTransactions.filter((t) => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch =
      searchQuery === '' ||
      t.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  const handleAddTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await addTransaction({
        amount: parseFloat(amount),
        type,
        category,
        notes,
        date: new Date().toISOString().split('T')[0],
        mood: selectedMood as any,
      });
      
      // Reset form
      setAmount('');
      setNotes('');
      setCategory('Food');
      setSelectedMood(undefined);
      setShowAddModal(false);
      Alert.alert('Success', 'Transaction added!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(id);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const renderTransactionItem = (transaction: Transaction) => (
    <TouchableOpacity
      key={transaction.id}
      style={styles.transactionItem}
      onLongPress={() => handleDelete(transaction.id)}
    >
      <View
        style={[
          styles.transactionIcon,
          {
            backgroundColor:
              transaction.type === 'income' ? Colors.income + '20' : Colors.expense + '20',
          },
        ]}
      >
        <Ionicons
          name={getCategoryIcon(transaction.category) as any}
          size={24}
          color={transaction.type === 'income' ? Colors.income : Colors.expense}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{transaction.notes || transaction.category}</Text>
        <View style={styles.transactionMeta}>
          <Text style={styles.transactionCategory}>{transaction.category}</Text>
          {transaction.mood && (
            <Text style={styles.moodChip}>
              {MOODS.find((m) => m.value === transaction.mood)?.emoji}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            { color: transaction.type === 'income' ? Colors.income : Colors.expense },
          ]}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.transactionType}>
          {transaction.type === 'income' ? 'Income' : 'Expense'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
          {['all', 'income', 'expense'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                filterType === filter && styles.filterChipActive,
              ]}
              onPress={() => setFilterType(filter as any)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterType === filter && styles.filterChipTextActive,
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {filteredTransactions.length} transactions • Total: {formatCurrency(
            filteredTransactions.reduce((sum, t) => 
              sum + (t.type === 'income' ? t.amount : -t.amount), 0
            )
          )}
        </Text>
      </View>

      {/* Transaction List */}
      <FlatList
        data={sortedDates}
        keyExtractor={(date) => date}
        renderItem={({ item: date }) => (
          <View>
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </View>
            {groupedTransactions[date].map(renderTransactionItem)}
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
      >
        <LinearGradient colors={['#6C63FF', '#9C63FF']} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color="#FFF" />
          <Text style={styles.fabText}>Add</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.modalTitle}>New Transaction</Text>

            {/* Type Switcher */}
            <View style={styles.typeSwitcher}>
              <TouchableOpacity
                style={[styles.typeButton, type === 'expense' && styles.typeButtonActiveExpense]}
                onPress={() => setType('expense')}
              >
                <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                  Expense
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeButton, type === 'income' && styles.typeButtonActiveIncome]}
                onPress={() => setType('income')}
              >
                <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                  Income
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Amount Input */}
              <View style={styles.amountSection}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>

              {/* Category Grid */}
              <Text style={styles.sectionLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      styles.categoryItem,
                      category === cat.name && {
                        borderColor: cat.color,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => setCategory(cat.name)}
                  >
                    <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Notes */}
              <Text style={styles.sectionLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add a note..."
                placeholderTextColor={Colors.textTertiary}
                value={notes}
                onChangeText={setNotes}
              />

              {/* Mood Selector */}
              <Text style={styles.sectionLabel}>How are you feeling? (Optional)</Text>
              <View style={styles.moodRow}>
                {MOODS.map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodItem,
                      selectedMood === mood.value && styles.moodItemActive,
                    ]}
                    onPress={() => setSelectedMood(mood.value)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Save Button */}
              <FinlyButton
                title="Save Transaction"
                onPress={handleAddTransaction}
                variant={type === 'expense' ? 'danger' : 'primary'}
                style={styles.saveButton}
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
  searchSection: {
    padding: Spacing.lg,
    paddingBottom: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: Spacing.sm,
    color: Colors.textPrimary,
    ...Typography.bodyMedium,
  },
  filterChips: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.textPrimary,
  },
  summary: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  summaryText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: 100,
  },
  dateHeader: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
  },
  dateText: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  transactionIcon: {
    width: 48,
    height: 48,
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
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  transactionCategory: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  moodChip: {
    fontSize: 14,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    ...Typography.labelLarge,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionType: {
    ...Typography.labelSmall,
    color: Colors.textTertiary,
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
    maxHeight: '90%',
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
  typeSwitcher: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  typeButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
  },
  typeButtonActiveExpense: {
    backgroundColor: Colors.expense + '20',
    borderColor: Colors.expense,
  },
  typeButtonActiveIncome: {
    backgroundColor: Colors.income + '20',
    borderColor: Colors.income,
  },
  typeButtonText: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
  },
  typeButtonTextActive: {
    color: Colors.textPrimary,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  currencySymbol: {
    ...Typography.displayLarge,
    color: Colors.textPrimary,
    marginRight: Spacing.sm,
  },
  amountInput: {
    ...Typography.displayLarge,
    color: Colors.textPrimary,
    minWidth: 150,
  },
  sectionLabel: {
    ...Typography.labelLarge,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryItem: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  categoryName: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  notesInput: {
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 12,
    padding: Spacing.md,
    color: Colors.textPrimary,
    ...Typography.bodyMedium,
    marginBottom: Spacing.md,
  },
  moodRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  moodItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderSubtle,
  },
  moodItemActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '20',
  },
  moodEmoji: {
    fontSize: 24,
  },
  saveButton: {
    marginTop: Spacing.lg,
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