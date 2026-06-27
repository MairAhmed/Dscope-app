export type ReportStatus = 'processing' | 'completed' | 'error'

export interface ProcedureReport {
  procedure_type: string | null
  procedure_date: string | null
  indication: string | null
  sedation_medications: string | null
  technique: string | null
  findings: string | null
  impression: string | null
  recommendations: string | null
  complications: string | null
  quality_indicators: string | null
  additional_notes: string | null
}

export interface Report {
  report_id: string
  patient_ref: string | null
  created_at: string
  updated_at: string
  audio_s3_key: string | null
  transcript: string | null
  procedure_report: ProcedureReport | null
  status: ReportStatus
  error_message: string | null
}
