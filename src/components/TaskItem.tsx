import { useState, type KeyboardEvent } from 'react'
import type { Task } from '../types'
import { CheckIcon, EditIcon, TrashIcon } from './Icons'

type Props = {
  task: Task
  onToggle: (id: string) => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
}

// One row. Click the text or the pencil to edit. Enter saves, Escape cancels.
export default function TaskItem({ task, onToggle, onRename, onDelete }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)

  function startEditing() {
    setDraft(task.title)
    setIsEditing(true)
  }

  function save() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== task.title) onRename(task.id, trimmed)
    setIsEditing(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') setIsEditing(false)
  }

  return (
    <li className={`item${task.completed ? ' done' : ''}`}>
      <button className="check" onClick={() => onToggle(task.id)}
        aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}>
        {task.completed && <CheckIcon />}
      </button>

      {isEditing ? (
        <input className="edit-input" value={draft} maxLength={500} autoFocus
          onFocus={(e) => e.target.select()} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown} onBlur={save} aria-label="Edit task" />
      ) : (
        <span className="title" onClick={startEditing}>{task.title}</span>
      )}

      {!isEditing && (
        <button className="icon" onClick={startEditing} aria-label="Edit"><EditIcon /></button>
      )}
      <button className="icon del" onClick={() => onDelete(task.id)} aria-label="Delete"><TrashIcon /></button>
    </li>
  )
}
