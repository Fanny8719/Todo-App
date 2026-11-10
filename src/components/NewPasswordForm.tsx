import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

// Shown after someone clicks the link in a password-reset email.
// Supabase has already signed them in with a temporary session, so we
// only need to save the new password.
export default function NewPasswordForm({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) setError(error.message)
    else onDone()
  }

  return (
    <main className="app auth">
      <h1>Choose a new password</h1>
      <form className="stack" onSubmit={handleSubmit}>
        <input type="password" placeholder="New password (6+ characters)" minLength={6}
          autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn block" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</button>
        {error && <div className="err" role="alert">{error}</div>}
      </form>
    </main>
  )
}
