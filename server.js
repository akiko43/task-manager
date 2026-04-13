const express = require('express')
const Database = require('better-sqlite3')
const cors = require('cors')

const app = express()
const db = new Database('tasks.db')

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

// Create the tasks table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`)

// GET all tasks
app.get('/tasks', (req, res) => {
  const tasks = db.prepare('SELECT * FROM tasks').all()
  res.json(tasks)
})

// POST a new task
app.post('/tasks', (req, res) => {
  const { title } = req.body
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' })
  }
  const result = db.prepare('INSERT INTO tasks (title) VALUES (?)').run(title.trim())
  res.json({ id: result.lastInsertRowid, title, completed: 0 })
})

// PUT toggle complete
app.put('/tasks/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id)
  if (!task) return res.status(404).json({ error: 'Task not found' })
  db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(task.completed ? 0 : 1, task.id)
  res.json({ success: true })
})

// DELETE a task
app.delete('/tasks/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

app.listen(3000, () => console.log('Server running on http://localhost:3000'))