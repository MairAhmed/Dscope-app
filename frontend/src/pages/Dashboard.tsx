import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FileText, Plus, Search } from 'lucide-react'
import { listReports } from '../api/client'
import { ReportCard } from '../components/ReportCard'

export function Dashboard() {
  const [q, setQ] = useState('')

  const { data: reports = [], isLoading, isError } = useQuery({
    queryKey: ['reports'],
    queryFn: listReports,
    refetchInterval: (query) =>
      query.state.data?.some((r) => r.status === 'processing') ? 3000 : false,
  })

  const filtered = reports.filter((r) => {
    if (!q) return true
    const lq = q.toLowerCase()
    return (
      r.patient_ref?.toLowerCase().includes(lq) ||
      r.procedure_report?.procedure_type?.toLowerCase().includes(lq) ||
      r.procedure_report?.indication?.toLowerCase().includes(lq)
    )
  })

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {reports.length} {reports.length === 1 ? 'report' : 'reports'}
          </p>
        </div>
        <Link
          to="/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-white rounded-lg text-sm font-semibold transition-colors"
          style={{ background: '#d4a020' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#b88810')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#d4a020')}
        >
          <Plus className="w-4 h-4" />
          New Recording
        </Link>
      </div>

      {/* Search */}
      {reports.length > 3 && (
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by patient, procedure type, or indication…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* States */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[84px] bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-red-500 text-sm">
          Could not load reports — check your API connection.
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">No reports yet</h3>
          <p className="text-slate-400 text-sm mb-6">
            Record your first procedure description to get started
          </p>
          <Link
            to="/new"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-white rounded-lg text-sm font-semibold transition-colors"
            style={{ background: '#d4a020' }}
          >
            <Plus className="w-4 h-4" /> New Recording
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-12 text-slate-400 text-sm">No reports match "{q}"</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ReportCard key={r.report_id} report={r} />
          ))}
        </div>
      )}
    </div>
  )
}
