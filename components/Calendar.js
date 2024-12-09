'use client'
import { useState, useEffect } from 'react'
import styles from './Calendar.module.css'

export default function Calendar() {
  const [date, setDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [showDaySummary, setShowDaySummary] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    startTime: '',
    endTime: '',
    venue: '',
    description: ''
  })
  const [showSelector, setShowSelector] = useState(false)

  useEffect(() => {
    const savedEvents = localStorage.getItem('events')
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    }
  }, [])

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  const handleDayClick = (day) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setShowDaySummary(true)
  }

  const addEvent = (e) => {
    e.preventDefault()
    if (!newEvent.title.trim() || !newEvent.startTime || !newEvent.venue) return

    const newEventObj = {
      id: Date.now(),
      date: selectedDate,
      ...newEvent
    }

    const updatedEvents = [...events, newEventObj]
    setEvents(updatedEvents)
    localStorage.setItem('events', JSON.stringify(updatedEvents))
    
    setNewEvent({
      title: '',
      startTime: '',
      endTime: '',
      venue: '',
      description: ''
    })
    setShowEventModal(false)
  }

  const deleteEvent = (eventId) => {
    const updatedEvents = events.filter(event => event.id !== eventId)
    setEvents(updatedEvents)
    localStorage.setItem('events', JSON.stringify(updatedEvents))
  }

  const getEventsForDay = (day) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events
      .filter(event => event.date === dateStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const isCurrentDay = (day) => {
    const today = new Date()
    return date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear() &&
      day === today.getDate()
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const years = Array.from(
    { length: 10 }, 
    (_, i) => new Date().getFullYear() + i
  )

  const handleMonthChange = (e) => {
    const newDate = new Date(date)
    newDate.setMonth(parseInt(e.target.value))
    setDate(newDate)
  }

  const handleYearChange = (e) => {
    const newDate = new Date(date)
    newDate.setFullYear(parseInt(e.target.value))
    setDate(newDate)
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button 
          onClick={() => setDate(new Date(date.setMonth(date.getMonth() - 1)))}
          className={styles.arrowButton}
        >
          ←
        </button>
        
        <div className={styles.monthYearContainer}>
          <h2 onClick={() => setShowSelector(!showSelector)} className={styles.monthYearDisplay}>
            {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          
          {showSelector && (
            <div className={styles.dateSelectors}>
              <select 
                value={date.getMonth()} 
                onChange={(e) => {
                  handleMonthChange(e)
                  setShowSelector(false)
                }}
                className={styles.select}
                autoFocus
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
              <select 
                value={date.getFullYear()} 
                onChange={(e) => {
                  handleYearChange(e)
                  setShowSelector(false)
                }}
                className={styles.select}
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button 
          onClick={() => setDate(new Date(date.setMonth(date.getMonth() + 1)))}
          className={styles.arrowButton}
        >
          →
        </button>
      </div>

      <div className={styles.days}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={styles.dayName}>{day}</div>
        ))}
        {Array.from({ length: getFirstDayOfMonth(date) }).map((_, index) => (
          <div key={`empty-${index}`} className={styles.emptyDay}></div>
        ))}
        {Array.from({ length: getDaysInMonth(date) }).map((_, index) => {
          const day = index + 1
          const dayEvents = getEventsForDay(day)
          return (
            <div 
              key={day} 
              className={`${styles.day} ${isCurrentDay(day) ? styles.currentDay : ''}`}
              onClick={() => handleDayClick(day)}
            >
              {day}
              {dayEvents.length > 0 && (
                <span className={styles.eventCount}>{dayEvents.length}</span>
              )}
            </div>
          )
        })}
      </div>

      {showDaySummary && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Events for {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</h3>
              <button 
                onClick={() => {
                  setShowDaySummary(false)
                  setShowEventModal(true)
                }}
                aria-label="Add event"
              >
                +
              </button>
            </div>
            
            <div className={styles.eventsList}>
              {events
                .filter(event => event.date === selectedDate)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map(event => (
                  <div key={event.id} className={styles.eventItem}>
                    <div className={styles.eventHeader}>
                      <h4>{event.title}</h4>
                      <button 
                        onClick={() => deleteEvent(event.id)}
                        className={styles.deleteButton}
                        aria-label="Delete event"
                      >
                        ×
                      </button>
                    </div>
                    <div className={styles.eventDetails}>
                      <p>
                        <strong>Time:</strong> {event.startTime}
                        {event.endTime && ` - ${event.endTime}`}
                      </p>
                      <p><strong>Venue:</strong> {event.venue}</p>
                      {event.description && (
                        <p><strong>Description:</strong> {event.description}</p>
                      )}
                    </div>
                  </div>
                ))
              }
              {events.filter(event => event.date === selectedDate).length === 0 && (
                <p className={styles.noEvents}>No events scheduled for this day</p>
              )}
            </div>
            
            <button 
              className={styles.closeButton}
              onClick={() => setShowDaySummary(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showEventModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Add Event for {selectedDate}</h3>
            <form onSubmit={addEvent}>
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Event title"
                  className={styles.input}
                  required
                />
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Start Time *</label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>End Time</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Venue *</label>
                <input
                  type="text"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({...newEvent, venue: e.target.value})}
                  placeholder="Event venue"
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Event description"
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              <div className={styles.modalButtons}>
                <button type="submit" className={styles.addButton}>Add Event</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEventModal(false)
                    setShowDaySummary(true)
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