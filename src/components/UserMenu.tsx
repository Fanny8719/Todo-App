import { useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Round avatar button that opens a small account menu.
export default function UserMenu({ session }: { session: Session }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const user = session.user
  const email = user.email ?? ''
  const avatar = user.user_metadata?.avatar_url as string | undefined // Google provides a photo
  const provider = user.app_metadata?.provider === 'google' ? 'Google' : 'email'

  // Close the menu when clicking anywhere outside it
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div className="menu" ref={ref}>
      <button className="avatar-btn" onClick={() => setOpen(!open)} aria-label="Account" aria-expanded={open}>
        {avatar ? <img src={avatar} alt="" referrerPolicy="no-referrer" /> : email[0]?.toUpperCase()}
      </button>
      {open && (
        <div className="menu-pop">
          <div className="who">{email}</div>
          <div className="via muted">Signed in with {provider}</div>
          <button className="btn ghost block" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      )}
    </div>
  )
}
