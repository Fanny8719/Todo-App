import type { Task } from '../types'
import TaskItem from './TaskItem'

type Props = {
  tasks: Task[]
  emptyText: string
  onToggle: (id: string) => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
}

export default function TaskList({ tasks, emptyText, ...actions }: Props) {
  if (tasks.length === 0) return <div className="empty">{emptyText}</div>
  return (
    <ul className="list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} {...actions} />
      ))}
    </ul>
  )
}
