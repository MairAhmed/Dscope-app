import { Link } from 'react-router-dom'
import { ChevronRight, FileText } from 'lucide-react'
import type { Report } from '../types'
import { StatusBadge } from './StatusBadge'

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function ReportCard({ report }: { report: Report }) {
  const title = report.procedure_report?.procedure_type ?? 'Endoscopy Procedure'
  const sub   = report.procedure_report?.indication

  return (
    <Link
      to={`/reports/${report.report_id}`}
      className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 hover:shadow-sm transition-all"
      style={{}}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#d4a020')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '')}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(26,64,128,0.08)' }}>
        <FileText className="w-5 h-5" style={{ color: '#1a4080' }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-900 text-sm">{title}</span>
          <StatusBadge status={report.status} />
        </div>
        {report.patient_ref && (
          <p className="text-xs text-slate-500 mt-0.5">Patient: {report.patient_ref}</p>
        )}
        {sub && <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>}
        <p className="text-xs text-slate-400 mt-0.5">{fmt(report.created_at)}</p>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
    </Link>
  )
}
