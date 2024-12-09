import Navbar from '../components/Navbar'
import WorkoutRoutine from '../components/WorkoutRoutine'
import WorkoutLog from '../components/WorkoutLog'
import styles from '../styles/Workout.module.css'

export default function WorkoutPage() {
  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.content}>
          <WorkoutRoutine />
          <WorkoutLog />
        </div>
      </main>
    </>
  )
} 