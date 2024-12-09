import clientPromise from '../../../utils/mongodb'

export default async function handler(req, res) {
  try {
    const client = await clientPromise
    const db = client.db("personal_dashboard")
    const collection = db.collection("workouts")

    switch (req.method) {
      case 'GET':
        const workouts = await collection.find({}).toArray()
        res.status(200).json({ workouts })
        break

      case 'POST':
        const newWorkout = req.body
        await collection.insertOne(newWorkout)
        res.status(201).json(newWorkout)
        break

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'Failed to process request' })
  }
} 