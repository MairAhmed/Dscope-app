import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, ChevronDown, ChevronUp, Edit2, Trash2, X } from 'lucide-react'
import { deleteReport, getReport, updateReport } from '../api/client'
import { StatusBadge } from '../components/StatusBadge'
import type { ProcedureReport } from '../types'

type Field = keyof ProcedureReport

const SECTIONS: { key: Field; label: string }[] = [
  { key: 'procedure_type',      label: 'Procedure Type' },
  { key: 'procedure_date',      label: 'Procedure Date' },
  { key: 'indication',          label: 'Indication' },
  { key: 'sedation_medications', label: 'Sedation / Medications' },
  { key: 'technique',           label: 'Technique' },
  { key: 'findings',            label: 'Findings' },
  { key: 'impression',          label: 'Impression' },
  { key: 'recommendations',     label: 'Recommendations' },
  { key: 'complications',       label: 'Complications' },
  { key: 'quality_indicators',  label: 'Quality Indicators' },
  { key: 'additional_notes',    label: 'Additional Notes' },
]

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function ReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [editing, setEditing] = useState<Field | null>(null)
  const [editVal, setEditVal] = useState('')
  const [showTx, setShowTx] = useState(false)

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['report', id],
    queryFn: () => getReport(id!),
    enabled: !!id,
    refetchInterval: (q) => (q.state.data?.status === 'processing' ? 3000 : false),
  })

  const saveMut = useMutation({
    mutationFn: (pr: ProcedureReport) => updateReport(id!, { procedure_report: pr }),
    onSuccess: (updated) => {
      qc.setQueryData(['report', id], updated)
      qc.invalidateQueries({ queryKey: ['reports'] })
      setEditing(null)
    },
  })

  const delMut = useMutation({
    mutationFn: () => deleteReport(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] })
      navigate('/')
    },
  })

  const startEdit = (field: Field) => {
    setEditing(field)
    setEditVal(report?.procedure_report?.[field] ?? '')
  }

  const saveEdit = () => {
    if (!report?.procedure_report || !editing) return
    saveMut.mutate({ ...report.procedure_report, [editing]: editVal || null })
  }

  const handleDelete = () => {
    if (window.confirm('Delete this report? This action cannot be undone.')) {
      delMut.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 max-w-3xl space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError || !report) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-2">Report not found.</p>
        <Link to="/" className="text-blue-600 text-sm hover:underline">← Back to dashboard</Link>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Reports
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">
              {report.procedure_report?.procedure_type ?? 'Procedure Report'}
            </h1>
            <StatusBadge status={report.status} />
          </div>
          {report.patient_ref && (
            <p className="text-slate-500 text-sm mt-1">Patient: {report.patient_ref}</p>
          )}
          <p className="text-slate-400 text-xs mt-1">{fmtDate(report.created_at)}</p>
        </div>

        <button
          onClick={handleDelete}
          disabled={delMut.isPending}
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
          title="Delete report"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Processing banner */}
      {report.status === 'processing' && (
        <div className="mb-5 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-sm">
          <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Transcribing audio and generating report — this usually takes 15–30 seconds…
        </div>
      )}

      {/* Error banner */}
      {report.status === 'error' && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
          {report.error_message ?? 'An error occurred while processing this report.'}
        </div>
      )}

      {/* Report fields */}
      {report.procedure_report && (
        <div className="space-y-2.5">
          {SECTIONS.map(({ key, label }) => {
            const value = report.procedure_report![key]
            const isEditing = editing === key

            return (
              <div key={key} className="bg-white border border-slate-200 rounded-xl px-5 py-4">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {label}
                  </h3>
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(key)}
                      className="p-1 text-slate-300 hover:text-blue-500 rounded transition-colors"
                      title={`Edit ${label}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div>
                    <textarea
                      value={editVal}
                      onChange={(e) => setEditVal(e.target.value)}
                      rows={Math.max(3, editVal.split('\n').length)}
                      autoFocus
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={saveEdit}
                        disabled={saveMut.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        style={{ background: '#d4a020' }}
                      >
                        <Check className="w-3 h-3" /> Save
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : value ? (
                  <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">{value}</p>
                ) : (
                  <p className="text-slate-300 text-sm italic">Not mentioned</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Transcript toggle */}
      {report.transcript && (
        <div className="mt-5">
          <button
            onClick={() => setShowTx(!showTx)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showTx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showTx ? 'Hide' : 'Show'} raw transcript
          </button>
          {showTx && (
            <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="text-sm text-slate-600 leading-relaxed">{report.transcript}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
