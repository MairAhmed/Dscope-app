import type { ReportStatus } from '../types'

const CFG: Record<ReportStatus, { label: string; cls: string; spin?: boolean }> = {
  processing: { label: 'Processing', cls: 'bg-amber-100 text-amber-700', spin: true },
  completed:  { label: 'Completed',  cls: 'bg-emerald-100 text-emerald-700' },
  error:      { label: 'Error',      cls: 'bg-red-100 text-red-600' },
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  const { label, cls, spin } = CFG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {spin && (
        <svg className="animate-spin h-2.5 w-2.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {label}
    </span>
  )
}
