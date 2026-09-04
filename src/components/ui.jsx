export function Badge({ label, color, bg }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[13px] font-medium"
      style={{ color, backgroundColor: bg, border: `1px solid ${color}33` }}
    >
      <span className="w-1.5 h-1.5" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

export function Panel({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-[var(--paper-raised)] border border-[var(--line)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 px-4 py-2 text-[14px] font-semibold tracking-tight transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-[var(--ink)] text-[var(--paper-raised)] hover:bg-[var(--rust-ink)]',
    secondary:
      'bg-transparent text-[var(--ink)] border border-[var(--line-strong)] hover:border-[var(--ink)]',
    ghost: 'bg-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]',
    danger: 'bg-transparent text-[var(--danger)] border border-[var(--danger)]/40 hover:bg-[var(--danger)]/10',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
        {label}
      </span>
      {children}
      {hint && <span className="text-[12px] text-[var(--ink-soft)]">{hint}</span>}
    </label>
  )
}

const inputBase =
  'bg-[var(--paper)] border border-[var(--line-strong)] px-3 py-2 text-[14px] text-[var(--ink)] focus:border-[var(--rust)] outline-none w-full'

export function Input(props) {
  return <input className={inputBase} {...props} />
}

export function Select({ children, ...props }) {
  return (
    <select className={inputBase} {...props}>
      {children}
    </select>
  )
}

export function TextArea(props) {
  return <textarea className={`${inputBase} min-h-20`} {...props} />
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-10 px-4">
      <div className="fixed inset-0 bg-[var(--ink)]/40" onClick={onClose} />
      <Panel className="relative w-full max-w-lg p-6 shadow-none">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-[var(--ink-soft)] hover:text-[var(--ink)] text-[20px] leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        {children}
      </Panel>
    </div>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <Panel className="p-10 text-center flex flex-col items-center gap-3">
      <p className="text-[16px] font-bold">{title}</p>
      <p className="text-[14px] text-[var(--ink-soft)] max-w-sm">{description}</p>
      {action}
    </Panel>
  )
}
