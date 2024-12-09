import { promises as fs } from 'fs'
import path from 'path'

const financeFile = path.join(process.cwd(), 'data/finance.json')

async function getFinanceFile() {
  try {
    await fs.access(financeFile)
  } catch {
    await fs.writeFile(financeFile, JSON.stringify({ transactions: [] }))
  }
  const data = await fs.readFile(financeFile, 'utf8')
  return JSON.parse(data)
}

export default async function handler(req, res) {
  try {
    const { method } = req

    switch (method) {
      case 'GET':
        const data = await getFinanceFile()
        res.status(200).json(data)
        break

      case 'POST':
        const { transactions: existingTransactions } = await getFinanceFile()
        const newTransaction = req.body
        const updatedTransactions = [...existingTransactions, newTransaction]
        await fs.writeFile(financeFile, JSON.stringify({ transactions: updatedTransactions }))
        res.status(201).json(newTransaction)
        break

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' })
  }
} 