import { promises as fs } from 'fs'
import path from 'path'

const todosFile = path.join(process.cwd(), 'data/todos.json')

async function getTodosFile() {
  try {
    await fs.access(todosFile)
  } catch {
    await fs.writeFile(todosFile, JSON.stringify({ todos: [] }))
  }
  const data = await fs.readFile(todosFile, 'utf8')
  return JSON.parse(data)
}

export default async function handler(req, res) {
  try {
    const { method } = req

    switch (method) {
      case 'GET':
        const data = await getTodosFile()
        res.status(200).json(data)
        break

      case 'POST':
        const { todos: existingTodos } = await getTodosFile()
        const newTodo = req.body
        const updatedTodos = [...existingTodos, newTodo]
        await fs.writeFile(todosFile, JSON.stringify({ todos: updatedTodos }))
        res.status(201).json(newTodo)
        break

      case 'PUT':
        const putData = await getTodosFile()
        const updatedTodosList = req.body
        await fs.writeFile(todosFile, JSON.stringify({ todos: updatedTodosList }))
        res.status(200).json({ todos: updatedTodosList })
        break

      case 'DELETE':
        const deleteData = await getTodosFile()
        const { id } = req.query
        const filteredTodos = deleteData.todos.filter(todo => todo.id !== parseInt(id))
        await fs.writeFile(todosFile, JSON.stringify({ todos: filteredTodos }))
        res.status(200).json({ success: true })
        break

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' })
  }
} 