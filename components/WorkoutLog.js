'use client'
import { useState, useEffect } from 'react'
import styles from './WorkoutLog.module.css'

export default function WorkoutLog({ onWorkoutLogged }) {
  const [routines, setRoutines] = useState([])
  const [showLogModal, setShowLogModal] = useState(false)
  const [newLog, setNewLog] = useState({
    date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0],
    routineId: '',
    duration: '',
    calories: ''
  })

  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        const response = await fetch('/api/routines')
        const data = await response.json()
        setRoutines(data.routines || [])
      } catch (error) {
        console.error('Failed to fetch routines:', error)
      }
    }
    fetchRoutines()
  }, [])

  const logWorkout = async (e) => {
    e.preventDefault()
    if (!newLog.routineId) return

    const selectedRoutine = routines.find(r => r.id.toString() === newLog.routineId)
    if (!selectedRoutine) return

    const workout = {
      id: Date.now(),
      ...newLog,
      routine: selectedRoutine
    }

    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workout)
      })
      
      if (response.ok) {
        onWorkoutLogged && onWorkoutLogged(workout)
        setNewLog({
          date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000))
            .toISOString()
            .split('T')[0],
          routineId: '',
          duration: '',
          calories: ''
        })
        setShowLogModal(false)
      }
    } catch (error) {
      console.error('Failed to log workout:', error)
    }
  }

  return (
    <div className={styles.workoutLog}>
      <button 
        onClick={() => setShowLogModal(true)}
        className={styles.logButton}
      >
        Log Workout
      </button>

      {showLogModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Log Workout</h3>
            <form onSubmit={logWorkout}>
              <div className={styles.formGroup}>
                <label>Date *</label>
                <input
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog({...newLog, date: e.target.value})}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Routine *</label>
                <select
                  value={newLog.routineId}
                  onChange={(e) => setNewLog({...newLog, routineId: e.target.value})}
                  required
                  size="4"
                >
                  <option value="" disabled>Select a routine</option>
                  {routines.map(routine => (
                    <option key={routine.id} value={routine.id.toString()}>
                      {routine.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    value={newLog.duration}
                    onChange={(e) => setNewLog({...newLog, duration: e.target.value})}
                    placeholder="Duration"
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Calories Burned</label>
                  <input
                    type="number"
                    value={newLog.calories}
                    onChange={(e) => setNewLog({...newLog, calories: e.target.value})}
                    placeholder="Calories"
                    min="0"
                  />
                </div>
              </div>

              <div className={styles.modalButtons}>
                <button type="submit" className={styles.submitButton}>
                  Log Workout
                </button>
                <button 
                  type="button"
                  onClick={() => setShowLogModal(false)}
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