// Small inline SVG icons. They use currentColor so CSS can colour them.
const base = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const CheckIcon = () => (
  <svg {...base} strokeWidth={3}><path d="M5 12l5 5L20 7" /></svg>
)
export const EditIcon = () => (
  <svg {...base} strokeWidth={1.8}><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>
)
export const TrashIcon = () => (
  <svg {...base} strokeWidth={1.8}><path d="M4 7h16" /><path d="M9 7V4h6v3" /><path d="M6 7l1 13h10l1-13" /></svg>
)
export const LogoIcon = () => (
  <svg {...base} strokeWidth={2.2}><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8.5 12l2.5 2.5 4.5-5" /></svg>
)
