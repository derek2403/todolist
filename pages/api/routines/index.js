import { promises as fs } from 'fs'
import path from 'path'

const routinesFile = path.join(process.cwd(), 'data/routines.json')

async function getRoutinesFile() {
  try {
    await fs.access(routinesFile)
  } catch {
    await fs.writeFile(routinesFile, JSON.stringify({ routines: [] }))
  }
  const data = await fs.readFile(routinesFile, 'utf8')
  return JSON.parse(data)
}

export default async function handler(req, res) {
  try {
    const { method } = req

    switch (method) {
      case 'GET':
        const data = await getRoutinesFile()
        res.status(200).json(data)
        break

      case 'POST':
        const { routines: existingRoutines } = await getRoutinesFile()
        const newRoutine = req.body
        const updatedRoutines = [...existingRoutines, newRoutine]
        await fs.writeFile(routinesFile, JSON.stringify({ routines: updatedRoutines }))
        res.status(201).json(newRoutine)
        break

      case 'DELETE':
        const { routines } = await getRoutinesFile()
        const { id } = req.query
        const filteredRoutines = routines.filter(routine => routine.id !== parseInt(id))
        await fs.writeFile(routinesFile, JSON.stringify({ routines: filteredRoutines }))
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