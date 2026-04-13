const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const cors = require('cors')

const app = express()
const db = new sqlite3.Database('tasks.db')

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

db.run(`CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  completed INTEGER DEFAULT 0
)`)

app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.post('/tasks', (req, res) => {
  const { title } = req.body
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' })
  }
  db.run('INSERT INTO tasks (title) VALUES (?)', [title.trim()], function(err) {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ id: this.lastID, title, completed: 0 })
  })
})

app.put('/tasks/:id', (req, res) => {
  db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, task) => {
    if (!task) return res.status(404).json({ error: 'Task not found' })
    db.run('UPDATE tasks SET completed = ? WHERE id = ?', [task.completed ? 0 : 1, task.id], (err) => {
      if (err) return res.status(500).json({ error: err.message })
      res.json({ success: true })
    })
  })
})

app.delete('/tasks/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json({ success: true })
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))