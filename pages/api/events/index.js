import { promises as fs } from 'fs'
import path from 'path'

const eventsFile = path.join(process.cwd(), 'data/events.json')

async function getEventsFile() {
  try {
    await fs.access(eventsFile)
  } catch {
    await fs.writeFile(eventsFile, JSON.stringify({ events: [] }))
  }
  const data = await fs.readFile(eventsFile, 'utf8')
  return JSON.parse(data)
}

export default async function handler(req, res) {
  try {
    const { method } = req

    switch (method) {
      case 'GET':
        const data = await getEventsFile()
        res.status(200).json(data)
        break

      case 'POST':
        const { events: existingEvents } = await getEventsFile()
        const newEvent = req.body
        const updatedEvents = [...existingEvents, newEvent]
        await fs.writeFile(eventsFile, JSON.stringify({ events: updatedEvents }))
        res.status(201).json(newEvent)
        break

      case 'DELETE':
        const { events } = await getEventsFile()
        const { id } = req.query
        const filteredEvents = events.filter(event => event.id !== parseInt(id))
        await fs.writeFile(eventsFile, JSON.stringify({ events: filteredEvents }))
        res.status(200).json({ success: true })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' })
  }
} 