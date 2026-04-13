const express = require('express')
const { Pool } = require('pg')
const cors = require('cors')

const app = express()
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
})

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

async function init() {
  await pool.query(`CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )`)
}
init()

app.get('/tasks', async (req, res) => {
  const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC')
  res.json(result.rows)
})

app.post('/tasks', async (req, res) => {
  const { title } = req.body
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' })
  }
  const result = await pool.query(
    'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
    [title.trim()]
  )
  res.json(result.rows[0])
})

app.put('/tasks/:id', async (req, res) => {
  const task = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id])
  if (!task.rows[0]) return res.status(404).json({ error: 'Task not found' })
  const current = task.rows[0].completed
  await pool.query('UPDATE tasks SET completed = $1 WHERE id = $2', [current ? 0 : 1, req.params.id])
  res.json({ success: true })
})

app.delete('/tasks/:id', async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id])
  res.json({ success: true })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))