import clientPromise from '../../../utils/mongodb'

export default async function handler(req, res) {
  try {
    const client = await clientPromise
    const db = client.db("personal_dashboard")
    const collection = db.collection("transactions")

    switch (req.method) {
      case 'GET':
        const transactions = await collection.find({}).toArray()
        res.status(200).json({ transactions })
        break

      case 'POST':
        const newTransaction = req.body
        await collection.insertOne(newTransaction)
        res.status(201).json(newTransaction)
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