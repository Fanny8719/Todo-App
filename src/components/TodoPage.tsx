import { useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Task } from '../types'
import TaskForm from './TaskForm'
import TaskList from './TaskList'
import UserMenu from './UserMenu'

export type Filter = 'all' | 'active' | 'done'
type Undo = { task: Task; index: number }

// The signed-in screen. Every action talks to Supabase, then updates the screen.
export default function TodoPage({ session }: { session: Session }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [undo, setUndo] = useState<Undo | null>(null)
  const undoTimer = useRef<number>()

  // READ. No user filter needed. Row-level security only returns this user's rows.
  useEffect(() => {
    supabase
      .from('todo_tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setTasks(data)
        setLoading(false)
      })
  }, [])

  // CREATE. The database fills in id, user_id and created_at.
  async function addTask(title: string) {
    const { data, error } = await supabase.from('todo_tasks').insert({ title }).select().single()
    if (error) return setError(error.message)
    setTasks((prev) => [data, ...prev])
    if (filter === 'done') setFilter('all') // so the new task is visible
  }

  // UPDATE completed. "Optimistic": change the screen first so it feels instant,
  // then put it back if the database says no.
  async function toggleTask(id: string) {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const flip = (completed: boolean) =>
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)))
    flip(!task.completed)
    const { error } = await supabase.from('todo_tasks').update({ completed: !task.completed }).eq('id', id)
    if (error) {
      flip(task.completed)
      setError(error.message)
    }
  }

  // UPDATE title
  async function renameTask(id: string, title: string) {
    const { error } = await supabase.from('todo_tasks').update({ title }).eq('id', id)
    if (error) return setError(error.message)
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)))
  }

  // DELETE, with a few seconds to undo
  async function deleteTask(id: string) {
    const index = tasks.findIndex((t) => t.id === id)
    if (index === -1) return
    const task = tasks[index]
    setTasks((prev) => prev.filter((t) => t.id !== id))

    const { error } = await supabase.from('todo_tasks').delete().eq('id', id)
    if (error) {
      setTasks((prev) => [...prev.slice(0, index), task, ...prev.slice(index)])
      return setError(error.message)
    }
    window.clearTimeout(undoTimer.current)
    setUndo({ task, index })
    undoTimer.current = window.setTimeout(() => setUndo(null), 5000)
  }

  // UNDO puts the exact same row back, same id and timestamps.
  async function undoDelete() {
    if (!undo) return
    window.clearTimeout(undoTimer.current)
    const { task, index } = undo
    setUndo(null)
    const { error } = await supabase.from('todo_tasks').insert(task)
    if (error) return setError(error.message)
    setTasks((prev) => [...prev.slice(0, index), task, ...prev.slice(index)])
  }

  const doneCount = tasks.filter((t) => t.completed).length
  const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0
  const shown = tasks.filter((t) => (filter === 'all' ? true : filter === 'done' ? t.completed : !t.completed))

  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>My Tasks</h1>
          <p className="muted sub">
            {loading ? 'Loading…' : tasks.length ? `${doneCount} of ${tasks.length} done` : 'Nothing here yet'}
          </p>
        </div>
        <UserMenu session={session} />
      </header>

      <div className="progress"><span style={{ width: `${pct}%` }} /></div>

      {error && (
        <div className="err" role="alert" onClick={() => setError('')}>
          {error} <span className="muted small">(tap to dismiss)</span>
        </div>
      )}

      <TaskForm onAdd={addTask} />

      {tasks.length > 0 && (
        <div className="filters">
          {(['all', 'active', 'done'] as Filter[]).map((f) => (
            <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      )}

      {!loading && (
        <TaskList
          tasks={shown}
          emptyText={tasks.length ? (filter === 'done' ? 'Nothing finished yet' : 'All caught up 🎉') : 'Add your first task above 📝'}
          onToggle={toggleTask}
          onRename={renameTask}
          onDelete={deleteTask}
        />
      )}

      {undo && (
        <div className="toast" role="status">
          Task deleted <button onClick={undoDelete}>Undo</button>
        </div>
      )}
    </main>
  )
}
