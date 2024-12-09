import { promises as fs } from 'fs'
import path from 'path'

const workoutsFile = path.join(process.cwd(), 'data/workouts.json')

async function getWorkoutsFile() {
  try {
    await fs.access(workoutsFile)
  } catch {
    await fs.writeFile(workoutsFile, JSON.stringify({ workouts: [] }))
  }
  const data = await fs.readFile(workoutsFile, 'utf8')
  return JSON.parse(data)
}

export default async function handler(req, res) {
  try {
    const { method } = req

    switch (method) {
      case 'GET':
        const data = await getWorkoutsFile()
        res.status(200).json(data)
        break

      case 'POST':
        const { workouts: existingWorkouts } = await getWorkoutsFile()
        const newWorkout = req.body
        const updatedWorkouts = [...existingWorkouts, newWorkout]
        await fs.writeFile(workoutsFile, JSON.stringify({ workouts: updatedWorkouts }))
        res.status(201).json(newWorkout)
        break

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' })
  }
} 