import Navbar from '@/components/Navbar'
import styles from '@/styles/Home.module.css'

export default function Finance() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <h1>Finance Manager</h1>
        <div className={styles.container}>
          <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>Coming soon...</p>
        </div>
      </main>
    </>
  )
} 