import Calendar from '@/components/Calendar'
import TodoList from '@/components/TodoList'
import Navbar from '@/components/Navbar'
import styles from '@/styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <Calendar />
          <TodoList />
        </div>
      </main>
    </>
  )
}
