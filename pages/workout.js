import Navbar from '@/components/Navbar'
import styles from '@/styles/Home.module.css'

export default function Workout() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <h1>Workout Tracker</h1>
        <div className={styles.container}>
          <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>Coming soon...</p>
        </div>
      </main>
    </>
  )
} 