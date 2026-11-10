// The shape of one task. It matches the columns of the todo_tasks table.
export type Task = {
  id: string
  user_id: string
  title: string
  completed: boolean
  created_at: string
}
