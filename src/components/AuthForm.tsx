import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { LogoIcon } from './Icons'

type Mode = 'signin' | 'signup' | 'reset'

const COPY: Record<Mode, { title: string; sub: string; button: string }> = {
  signin: { title: 'Welcome back', sub: 'Sign in to see your tasks', button: 'Sign in' },
  signup: { title: 'Create your account', sub: 'It takes about ten seconds', button: 'Create account' },
  reset: { title: 'Reset password', sub: "We'll email you a reset link", button: 'Send reset link' },
}

export default function AuthForm() {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function switchMode(next: Mode) {
    setMode(next)
    setError('')
    setNotice('')
  }

  // Google and Facebook sign-in work the same way. The browser goes to the
  // provider, the person approves, and Supabase sends them back to this app.
  // When it comes back, App's getSession() picks up the new session.
  async function signInWith(provider: 'google' | 'facebook') {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    })
    if (error) setError(error.message)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setNotice('')

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      // On success App's listener swaps to the todo screen. Nothing else to do.
    } else if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) setError(error.message)
      else if (!data.session) setNotice('Check your email for a confirmation link, then sign in.')
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      })
      if (error) setError(error.message)
      else setNotice(`If ${email} has an account, a reset link is on its way.`)
    }

    setBusy(false)
  }

  const copy = COPY[mode]

  return (
    <main className="app auth">
      <div className="brand"><LogoIcon /></div>
      <h1>{copy.title}</h1>
      <p className="muted sub">{copy.sub}</p>

      <div className="stack">
        {mode !== 'reset' && (
          <>
            <button type="button" className="btn ghost block google" onClick={() => signInWith('google')}>
              <span className="g-dot">G</span> Continue with Google
            </button>
            <button type="button" className="btn ghost block google" onClick={() => signInWith('facebook')}>
              <span className="g-dot">f</span> Continue with Facebook
            </button>
            <div className="divider">or use email</div>
          </>
        )}

        <form className="stack tight" onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" autoComplete="email" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          {mode !== 'reset' && (
            <input type="password" placeholder="Password (6+ characters)" minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          )}
          {mode === 'signin' && (
            <div className="row-end">
              <button type="button" className="link" onClick={() => switchMode('reset')}>Forgot password?</button>
            </div>
          )}
          <button className="btn block" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : copy.button}
          </button>
        </form>

        {error && <div className="err" role="alert">{error}</div>}
        {notice && <div className="note">{notice}</div>}
      </div>

      <p className="switch">
        {mode === 'signin' ? (
          <>New here? <button className="link" onClick={() => switchMode('signup')}>Create an account</button></>
        ) : (
          <>Already have an account? <button className="link" onClick={() => switchMode('signin')}>Sign in</button></>
        )}
      </p>

      <p className="legal muted">
        <a href="/privacy">Privacy policy</a> · <a href="/data-deletion">Delete your data</a>
      </p>
    </main>
  )
}
