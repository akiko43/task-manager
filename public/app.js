const input = document.getElementById('task-input')
const addBtn = document.getElementById('add-btn')
const taskList = document.getElementById('task-list')
const errorMsg = document.getElementById('error-msg')
const counter = document.getElementById('counter')
const emptyMsg = document.getElementById('empty-msg')

async function loadTasks() {
  const res = await fetch('/tasks')
  const tasks = await res.json()
  taskList.innerHTML = ''
  tasks.forEach(task => renderTask(task))
  updateCounter(tasks)
  emptyMsg.style.display = tasks.length === 0 ? 'block' : 'none'
}

function updateCounter(tasks) {
  const done = tasks.filter(t => t.completed).length
  counter.textContent = `${done} of ${tasks.length} task${tasks.length !== 1 ? 's' : ''} complete`
}

function renderTask(task) {
  const li = document.createElement('li')
  if (task.completed) li.classList.add('done')
  li.innerHTML = `
    <input type="checkbox" ${task.completed ? 'checked' : ''} />
    <span>${task.title}</span>
    <button class="delete-btn" title="Delete task">✕</button>
  `
  li.querySelector('input').addEventListener('change', async () => {
    await fetch('/tasks/' + task.id, { method: 'PUT' })
    loadTasks()
  })
  li.querySelector('.delete-btn').addEventListener('click', async () => {
    await fetch('/tasks/' + task.id, { method: 'DELETE' })
    loadTasks()
  })
  taskList.appendChild(li)
}

addBtn.addEventListener('click', async () => {
  const title = input.value.trim()
  if (!title) {
    errorMsg.textContent = 'Please enter a task before adding.'
    return
  }
  errorMsg.textContent = ''
  await fetch('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  })
  input.value = ''
  loadTasks()
})

// Allow pressing Enter to add a task
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addBtn.click()
})

loadTasks()