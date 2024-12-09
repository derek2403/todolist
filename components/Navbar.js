'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Navbar.module.css'

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        <Link 
          href="/" 
          className={pathname === "/" ? styles.active : ""}
        >
          Calendar & Todo
        </Link>
        <Link 
          href="/workout" 
          className={pathname === "/workout" ? styles.active : ""}
        >
          Workout
        </Link>
        <Link 
          href="/finance" 
          className={pathname === "/finance" ? styles.active : ""}
        >
          Finance
        </Link>
      </div>
    </nav>
  )
} 