import clientPromise from '../../../utils/mongodb'

export default async function handler(req, res) {
  try {
    const client = await clientPromise
    const db = client.db("workout-tracker") // Your database name
    const routinesCollection = db.collection("routines")
    const { method } = req

    switch (method) {
      case 'GET':
        const routines = await routinesCollection.find({}).toArray()
        res.status(200).json({ routines })
        break

      case 'POST':
        const newRoutine = req.body
        const result = await routinesCollection.insertOne(newRoutine)
        const savedRoutine = { ...newRoutine, _id: result.insertedId }
        res.status(201).json({ routine: savedRoutine })
        break

      case 'DELETE':
        const { id } = req.query
        await routinesCollection.deleteOne({ id: parseInt(id) })
        res.status(200).json({ success: true })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'Failed to process request' })
  }
} 