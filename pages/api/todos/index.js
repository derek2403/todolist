import clientPromise from '../../../utils/mongodb'

export default async function handler(req, res) {
  try {
    const client = await clientPromise
    const db = client.db("personal_dashboard")
    const collection = db.collection("todos")

    switch (req.method) {
      case 'GET':
        const todos = await collection.find({}).toArray()
        res.status(200).json({ todos })
        break

      case 'POST':
        const newTodo = req.body
        await collection.insertOne(newTodo)
        res.status(201).json(newTodo)
        break

      case 'PUT':
        const updatedTodos = req.body
        await collection.deleteMany({}) // Clear existing todos
        if (updatedTodos.length > 0) {
          await collection.insertMany(updatedTodos)
        }
        res.status(200).json({ todos: updatedTodos })
        break

      case 'DELETE':
        const { id } = req.query
        await collection.deleteOne({ id: parseInt(id) })
        res.status(200).json({ success: true })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).json({ error: `Method ${req.method} Not Allowed` })
    }
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'Failed to process request' })
  }
} 