import type { ComponentPropsWithoutRef, ReactNode } from 'react'

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center gap-6 rounded-2xl border border-border-subtle bg-surface p-6">
      {children}
    </div>
  )
}

type InputProps = ComponentPropsWithoutRef<'input'> & {
  label: string
  suffix?: string
}

export function Input({ label, suffix, ...props }: InputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium">
      {label}

      <div className="flex items-center rounded-xl border border-border-subtle bg-surface focus-within:border-accent has-disabled:opacity-50">
        <input
          className="w-full rounded-xl bg-transparent px-4 py-3 text-base outline-none"
          {...props}
        />

        {suffix && (
          <span className="shrink-0 pr-4 text-base text-text-secondary">
            {suffix}
          </span>
        )}
      </div>
    </label>
  )
}

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  loading?: boolean
}

export function Button({ loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className="rounded-xl bg-accent px-4 py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}

export function Helper({
  type = 'info',
  children,
}: {
  type?: 'info' | 'error'
  children: ReactNode
}) {
  return (
    <div
      className={`w-full rounded-2xl border px-4 py-3 text-center text-sm ${
        type === 'error'
          ? 'border-error/20 bg-error/10 text-error'
          : 'border-border-subtle bg-page'
      }`}
    >
      {children}
    </div>
  )
}

export function Link(props: ComponentPropsWithoutRef<'a'>) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-accent hover:underline"
      {...props}
    />
  )
}
