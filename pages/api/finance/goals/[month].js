import { promises as fs } from 'fs'
import path from 'path'

const goalsFile = path.join(process.cwd(), 'data/finance-goals.json')

async function getGoalsFile() {
  try {
    await fs.access(goalsFile)
  } catch {
    await fs.writeFile(goalsFile, JSON.stringify({}))
  }
  const data = await fs.readFile(goalsFile, 'utf8')
  return JSON.parse(data)
}

export default async function handler(req, res) {
  const { month } = req.query

  try {
    const { method } = req

    switch (method) {
      case 'GET':
        const data = await getGoalsFile()
        res.status(200).json(data[month] || {
          budget: 0,
          savingTarget: 0,
          categories: {
            food: 0,
            transport: 0,
            entertainment: 0,
            shopping: 0,
            bills: 0,
            others: 0
          }
        })
        break

      case 'PUT':
        const goals = await getGoalsFile()
        goals[month] = req.body
        await fs.writeFile(goalsFile, JSON.stringify(goals))
        res.status(200).json(goals[month])
        break

      default:
        res.setHeader('Allow', ['GET', 'PUT'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' })
  }
} 