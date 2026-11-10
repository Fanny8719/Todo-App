import { useRef, useState, type FormEvent } from 'react'

type Props = { onAdd: (title: string) => void | Promise<void> }

export default function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || busy) return
    setBusy(true)
    await onAdd(trimmed)
    setBusy(false)
    setTitle('')
    inputRef.current?.focus() // ready for the next one
  }

  return (
    <form className="add" onSubmit={handleSubmit}>
      <input ref={inputRef} type="text" placeholder="What needs doing?" maxLength={500}
        value={title} onChange={(e) => setTitle(e.target.value)} aria-label="New task" />
      <button className="btn" type="submit" disabled={!title.trim() || busy}>Add</button>
    </form>
  )
}
