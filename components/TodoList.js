'use client'
import { useState, useEffect } from 'react'
import styles from './TodoList.module.css'

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [deadline, setDeadline] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch('/api/todos')
        const data = await response.json()
        setTodos(data.todos || [])
      } catch (error) {
        console.error('Failed to fetch todos:', error)
      }
    }
    fetchTodos()
  }, [])

  useEffect(() => {
    const updateTodos = async () => {
      try {
        await fetch('/api/todos', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(todos)
        })
      } catch (error) {
        console.error('Failed to update todos:', error)
      }
    }
    if (todos.length > 0) {
      updateTodos()
    }
  }, [todos])

  const addTodo = async (e) => {
    e.preventDefault()
    if (!newTodo.trim()) return
    
    const today = new Date()
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
    const todoDeadline = deadline || localDate.toISOString().split('T')[0]
    
    const todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      deadline: todoDeadline,
      daysUntil: Math.ceil((new Date(todoDeadline) - localDate) / (1000 * 60 * 60 * 24))
    }
    
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todo)
      })
      
      if (response.ok) {
        const updatedTodos = [...todos, todo].sort((a, b) => a.daysUntil - b.daysUntil)
        setTodos(updatedTodos)
        setNewTodo('')
        setDeadline('')
        setShowAddModal(false)
      }
    } catch (error) {
      console.error('Failed to add todo:', error)
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`/api/todos?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setTodos(todos.filter(todo => todo.id !== id))
      } else {
        console.error('Failed to delete todo')
      }
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  const formatDeadline = (deadline, daysUntil) => {
    const today = new Date()
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
    const todayStr = localDate.toISOString().split('T')[0]
    
    if (deadline === todayStr) {
      return 'Due: Today'
    } else if (daysUntil < 0) {
      return `Overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) === 1 ? '' : 's'}`
    } else {
      return `Due: ${new Date(deadline).toLocaleDateString()} (${daysUntil} day${daysUntil === 1 ? '' : 's'})`
    }
  }

  const filteredTodos = todos
    .map(todo => {
      const today = new Date()
      const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
      return {
        ...todo,
        daysUntil: Math.ceil((new Date(todo.deadline) - localDate) / (1000 * 60 * 60 * 24))
      }
    })
    .sort((a, b) => {
      // Sort by days until deadline (overdue items first)
      if (a.daysUntil !== b.daysUntil) {
        return a.daysUntil - b.daysUntil
      }
      // If same deadline, sort completed items last
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return 0
    })
    .filter(todo => {
      if (filter === 'active') return !todo.completed
      if (filter === 'completed') return todo.completed
      return true
    })

  return (
    <div className={styles.todoList}>
      <div className={styles.todoHeader}>
        <h2>Todo List</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
          aria-label="Add todo"
        >
          +
        </button>
      </div>

      <div className={styles.filters}>
        <button 
          onClick={() => setFilter('all')}
          className={filter === 'all' ? styles.active : ''}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('active')}
          className={filter === 'active' ? styles.active : ''}
        >
          Active
        </button>
        <button 
          onClick={() => setFilter('completed')}
          className={filter === 'completed' ? styles.active : ''}
        >
          Completed
        </button>
      </div>

      <ul className={styles.todos}>
        {filteredTodos.map(todo => (
          <li 
            key={todo.id} 
            className={`${styles.todoItem} ${todo.daysUntil < 0 && !todo.completed ? styles.overdue : ''}`}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <div className={styles.todoContent}>
              <span className={todo.completed ? styles.completed : ''}>
                {todo.text}
              </span>
              <span className={`${styles.deadline} ${todo.daysUntil < 0 && !todo.completed ? styles.overdueText : ''}`}>
                {formatDeadline(todo.deadline, todo.daysUntil)}
              </span>
            </div>
            <button 
              onClick={() => deleteTodo(todo.id)}
              className={styles.deleteButton}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Add New Todo</h3>
            </div>
            
            <form onSubmit={addTodo}>
              <div className={styles.formGroup}>
                <label>Task *</label>
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Enter task..."
                  className={styles.input}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={styles.input}
                />
                <small className={styles.helperText}>
                  If no deadline is set, task will be due today
                </small>
              </div>

              <div className={styles.modalButtons}>
                <button type="submit" className={styles.submitButton}>
                  Add Task
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddModal(false)
                    setNewTodo('')
                    setDeadline('')
                  }}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 