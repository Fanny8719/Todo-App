import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import AuthForm from './components/AuthForm'
import TodoPage from './components/TodoPage'
import NewPasswordForm from './components/NewPasswordForm'

// App decides which screen to show: sign-in, "set a new password", or the todo list.
export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    // Is someone already signed in? Supabase remembers the session in the browser.
    // This also picks up the session after coming back from Google sign-in.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // Listen for sign-in, sign-out, and password-reset links.
    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (loading) return <p className="center muted">Loading…</p>
  if (recovering && session) return <NewPasswordForm onDone={() => setRecovering(false)} />
  return session ? <TodoPage session={session} /> : <AuthForm />
}
