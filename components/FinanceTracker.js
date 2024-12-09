'use client'
import { useState, useEffect } from 'react'
import styles from './FinanceTracker.module.css'

export default function FinanceTracker() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [monthlyGoals, setMonthlyGoals] = useState({
    budget: 0,
    savingTarget: 0,
    categories: {
      food: 0,
      transport: 0,
      entertainment: 0,
      shopping: 0,
      bills: 0,
      others: 0
    }
  })

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date()
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
    return localDate.toISOString().substring(0, 7) // YYYY-MM
  })

  const [showCategoryModal, setShowCategoryModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch transactions
        const transResponse = await fetch('/api/finance')
        const transData = await transResponse.json()
        setTransactions(transData.transactions || [])

        // Fetch monthly goals
        const goalsResponse = await fetch(`/api/finance/goals/${selectedMonth}`)
        const goalsData = await goalsResponse.json()
        setMonthlyGoals(goalsData || {
          budget: 0,
          savingTarget: 0,
          categories: {
            food: 0,
            transport: 0,
            entertainment: 0,
            shopping: 0,
            bills: 0,
            others: 0
          }
        })
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [selectedMonth])

  const addTransaction = async (e) => {
    e.preventDefault()
    if (!newTransaction.description.trim() || !newTransaction.amount) return

    const transaction = {
      id: Date.now(),
      ...newTransaction,
      amount: parseFloat(newTransaction.amount)
    }

    try {
      const response = await fetch('/api/finance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction)
      })
      
      if (response.ok) {
        setTransactions([...transactions, transaction])
        setNewTransaction({
          type: 'expense',
          description: '',
          amount: '',
          category: '',
          date: new Date().toISOString().split('T')[0]
        })
        setShowAddModal(false)
      }
    } catch (error) {
      console.error('Failed to add transaction:', error)
    }
  }

  const updateMonthlyGoals = async (newGoals) => {
    try {
      const response = await fetch(`/api/finance/goals/${selectedMonth}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGoals)
      })
      
      if (response.ok) {
        setMonthlyGoals(newGoals)
        setShowGoalModal(false)
      }
    } catch (error) {
      console.error('Failed to update goals:', error)
    }
  }

  const calculateStats = () => {
    const today = new Date()
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
    const currentMonth = localDate.toISOString().substring(0, 7)
    const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonth))
    
    const stats = {
      totalExpense: 0,
      totalSaving: 0,
      categoryExpenses: {
        food: 0,
        transport: 0,
        entertainment: 0,
        shopping: 0,
        bills: 0,
        others: 0
      }
    }

    monthlyTransactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount)
      if (transaction.type === 'expense') {
        stats.totalExpense += amount
        if (transaction.category) {
          stats.categoryExpenses[transaction.category] += amount
        }
      } else {
        stats.totalSaving += amount
      }
    })

    return stats
  }

  const stats = calculateStats()
  const monthlyBalance = stats.totalSaving - stats.totalExpense
  const budgetProgress = (stats.totalExpense / monthlyGoals.budget) * 100
  const savingProgress = (stats.totalSaving / monthlyGoals.savingTarget) * 100

  const getTopCategories = () => {
    const categories = Object.entries(stats.categoryExpenses)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3) // Show top 3 categories
    return categories
  }

  const handleCategoryClick = () => {
    setShowCategoryModal(true)
  }

  return (
    <div className={styles.financeTracker}>
      <div className={styles.header}>
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className={styles.monthSelect}
        >
          {Array.from({ length: 12 }, (_, i) => {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            const monthStr = date.toISOString().substring(0, 7)
            return (
              <option key={monthStr} value={monthStr}>
                {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </option>
            )
          })}
        </select>
        <button 
          onClick={() => setShowGoalModal(true)}
          className={styles.goalButton}
        >
          Set Goals
        </button>
      </div>

      <div className={styles.dashboard}>
        <div className={styles.mainStats}>
          <div className={styles.balanceCard}>
            <h3>Monthly Balance</h3>
            <p className={`${styles.amount} ${monthlyBalance >= 0 ? styles.positive : styles.negative}`}>
              ${Math.abs(monthlyBalance).toFixed(2)}
            </p>
            <span className={styles.indicator}>{monthlyBalance >= 0 ? 'Saved' : 'Overspent'}</span>
          </div>

          <div className={styles.progressCards}>
            <div className={styles.progressCard}>
              <div className={styles.progressHeader}>
                <h3>Budget</h3>
                <p>${monthlyGoals.budget}</p>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progress}
                  style={{ 
                    width: `${Math.min(budgetProgress, 100)}%`,
                    backgroundColor: budgetProgress > 100 ? '#ef4444' : '#2563eb'
                  }}
                />
              </div>
              <p className={styles.progressText}>
                ${stats.totalExpense.toFixed(2)} spent
                {budgetProgress > 100 && ' (Over budget!)'}
              </p>
            </div>

            <div className={styles.progressCard}>
              <div className={styles.progressHeader}>
                <h3>Saving Goal</h3>
                <p>${monthlyGoals.savingTarget}</p>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progress}
                  style={{ 
                    width: `${Math.min(savingProgress, 100)}%`,
                    backgroundColor: '#10b981'
                  }}
                />
              </div>
              <p className={styles.progressText}>
                ${stats.totalSaving.toFixed(2)} saved
                {savingProgress >= 100 && ' (Goal reached!)'}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.categoryBreakdown} onClick={handleCategoryClick}>
          <div className={styles.categoryHeader}>
            <h3>Top Spending</h3>
            <span className={styles.viewAllText}>
              Tap to view all →
            </span>
          </div>
          {getTopCategories().map(([category, amount]) => (
            <div key={category} className={styles.categoryItem}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryName}>{category}</span>
                <span className={styles.categoryAmount}>${amount.toFixed(2)}</span>
              </div>
              <div className={styles.categoryProgress}>
                <div 
                  className={styles.progress}
                  style={{ 
                    width: `${Math.min((amount / monthlyGoals.categories[category]) * 100, 100)}%`,
                    backgroundColor: amount > monthlyGoals.categories[category] ? '#ef4444' : '#2563eb'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={() => setShowAddModal(true)}
        className={styles.addButton}
      >
        Add Transaction
      </button>

      {/* Quick Add Modal */}
      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Quick Add</h3>
            <form onSubmit={addTransaction}>
              <div className={styles.typeToggle}>
                <button
                  type="button"
                  className={`${styles.typeButton} ${newTransaction.type === 'expense' ? styles.active : ''}`}
                  onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                >
                  Expense
                </button>
                <button
                  type="button"
                  className={`${styles.typeButton} ${newTransaction.type === 'saving' ? styles.active : ''}`}
                  onClick={() => setNewTransaction({...newTransaction, type: 'saving'})}
                >
                  Saving
                </button>
              </div>

              {newTransaction.type === 'expense' && (
                <div className={styles.formGroup}>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.keys(monthlyGoals.categories).map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  placeholder="What was it for?"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  placeholder="How much?"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className={styles.modalButtons}>
                <button type="submit" className={styles.submitButton}>
                  Add {newTransaction.type === 'expense' ? 'Expense' : 'Saving'}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals Modal */}
      {showGoalModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Set Monthly Goals</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              updateMonthlyGoals(monthlyGoals)
            }}>
              <div className={styles.formGroup}>
                <label>Monthly Budget</label>
                <input
                  type="number"
                  value={monthlyGoals.budget}
                  onChange={(e) => setMonthlyGoals({
                    ...monthlyGoals,
                    budget: parseFloat(e.target.value) || 0
                  })}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Saving Target</label>
                <input
                  type="number"
                  value={monthlyGoals.savingTarget}
                  onChange={(e) => setMonthlyGoals({
                    ...monthlyGoals,
                    savingTarget: parseFloat(e.target.value) || 0
                  })}
                  min="0"
                  step="0.01"
                />
              </div>

              <h4>Category Budgets</h4>
              {Object.entries(monthlyGoals.categories).map(([category, amount]) => (
                <div key={category} className={styles.formGroup}>
                  <label>{category.charAt(0).toUpperCase() + category.slice(1)}</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setMonthlyGoals({
                      ...monthlyGoals,
                      categories: {
                        ...monthlyGoals.categories,
                        [category]: parseFloat(e.target.value) || 0
                      }
                    })}
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}

              <div className={styles.modalButtons}>
                <button type="submit" className={styles.submitButton}>
                  Save Goals
                </button>
                <button 
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add the Category Modal */}
      {showCategoryModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Category Breakdown</h3>
              <button 
                onClick={() => setShowCategoryModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            <div className={styles.categoryList}>
              {Object.entries(stats.categoryExpenses)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category} className={styles.categoryItem}>
                    <div className={styles.categoryHeader}>
                      <span className={styles.categoryName}>{category}</span>
                      <span className={styles.categoryAmount}>${amount.toFixed(2)}</span>
                    </div>
                    <div className={styles.categoryProgress}>
                      <div 
                        className={styles.progress}
                        style={{ 
                          width: `${Math.min((amount / monthlyGoals.categories[category]) * 100, 100)}%`,
                          backgroundColor: amount > monthlyGoals.categories[category] ? '#ef4444' : '#2563eb'
                        }}
                      />
                    </div>
                    <div className={styles.categoryDetails}>
                      <span>Budget: ${monthlyGoals.categories[category]}</span>
                      <span className={amount > monthlyGoals.categories[category] ? styles.overBudget : ''}>
                        {amount > monthlyGoals.categories[category] 
                          ? `Over by $${(amount - monthlyGoals.categories[category]).toFixed(2)}`
                          : `Under by $${(monthlyGoals.categories[category] - amount).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 