'use client'
import { useState, useEffect } from 'react'
import styles from './WorkoutRoutine.module.css'

export default function WorkoutRoutine() {
  const [routines, setRoutines] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRoutine, setNewRoutine] = useState({
    name: '',
    exercises: [{ name: '', reps: '', duration: '' }]
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

  const addExercise = () => {
    setNewRoutine({
      ...newRoutine,
      exercises: [...newRoutine.exercises, { name: '', reps: '', duration: '' }]
    })
  }

  const removeExercise = (index) => {
    setNewRoutine({
      ...newRoutine,
      exercises: newRoutine.exercises.filter((_, i) => i !== index)
    })
  }

  const updateExercise = (index, field, value) => {
    const updatedExercises = newRoutine.exercises.map((exercise, i) => {
      if (i === index) {
        return { ...exercise, [field]: value }
      }
      return exercise
    })
    setNewRoutine({ ...newRoutine, exercises: updatedExercises })
  }

  const addRoutine = async (e) => {
    e.preventDefault()
    if (!newRoutine.name.trim()) return

    const routine = {
      id: Date.now(),
      ...newRoutine
    }

    try {
      const response = await fetch('/api/routines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routine)
      })
      
      if (response.ok) {
        setRoutines([...routines, routine])
        setNewRoutine({
          name: '',
          exercises: [{ name: '', reps: '', duration: '' }]
        })
        setShowAddModal(false)
      }
    } catch (error) {
      console.error('Failed to add routine:', error)
    }
  }

  const deleteRoutine = async (id) => {
    try {
      const response = await fetch(`/api/routines?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setRoutines(routines.filter(routine => routine.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete routine:', error)
    }
  }

  return (
    <div className={styles.routineList}>
      <div className={styles.routineHeader}>
        <h2>Workout Routines</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
        >
          +
        </button>
      </div>

      <div className={styles.routines}>
        {routines.map(routine => (
          <div key={routine.id} className={styles.routineItem}>
            <div className={styles.routineTitle}>
              <h3>{routine.name}</h3>
              <button 
                onClick={() => deleteRoutine(routine.id)}
                className={styles.deleteButton}
              >
                ×
              </button>
            </div>
            <div className={styles.exercises}>
              {routine.exercises.map((exercise, index) => (
                <div key={index} className={styles.exercise}>
                  <span className={styles.exerciseName}>{exercise.name}</span>
                  <span className={styles.exerciseDetails}>
                    {exercise.reps && `${exercise.reps} reps`}
                    {exercise.reps && exercise.duration && ' | '}
                    {exercise.duration && `${exercise.duration} min`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Create New Routine</h3>
            <form onSubmit={addRoutine}>
              <div className={styles.formGroup}>
                <label>Routine Name *</label>
                <input
                  type="text"
                  value={newRoutine.name}
                  onChange={(e) => setNewRoutine({...newRoutine, name: e.target.value})}
                  placeholder="Enter routine name"
                  required
                />
              </div>

              {newRoutine.exercises.map((exercise, index) => (
                <div key={index} className={styles.exerciseForm}>
                  <div className={styles.exerciseHeader}>
                    <h4>Exercise {index + 1}</h4>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className={styles.removeButton}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className={styles.exerciseInputs}>
                    <input
                      type="text"
                      value={exercise.name}
                      onChange={(e) => updateExercise(index, 'name', e.target.value)}
                      placeholder="Exercise name"
                      required
                    />
                    <input
                      type="text"
                      value={exercise.reps}
                      onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                      placeholder="Number of reps"
                    />
                    <input
                      type="text"
                      value={exercise.duration}
                      onChange={(e) => updateExercise(index, 'duration', e.target.value)}
                      placeholder="Duration (minutes)"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addExercise}
                className={styles.addExerciseButton}
              >
                + Add Exercise
              </button>

              <div className={styles.modalButtons}>
                <button type="submit" className={styles.submitButton}>
                  Create Routine
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewRoutine({
                      name: '',
                      exercises: [{ name: '', reps: '', duration: '' }]
                    })
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