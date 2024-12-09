import Navbar from '../components/Navbar'
import FinanceTracker from '../components/FinanceTracker'
import styles from '../styles/Finance.module.css'

export default function Finance() {
  return (
    <>
      <Navbar />
      <main className={styles.container}>
        <FinanceTracker />
      </main>
    </>
  )
} 