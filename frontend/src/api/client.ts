import axios from 'axios'
import type { ProcedureReport, Report } from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 180_000, // 3 min — Whisper + GPT-4 can take a while
})

export async function uploadRecording(blob: Blob, patientRef?: string): Promise<Report> {
  const form = new FormData()
  form.append('audio', blob, 'recording.webm')
  if (patientRef) form.append('patient_ref', patientRef)
  const { data } = await api.post<Report>('/reports', form)
  return data
}

export async function listReports(): Promise<Report[]> {
  const { data } = await api.get<Report[]>('/reports')
  return data
}

export async function getReport(id: string): Promise<Report> {
  const { data } = await api.get<Report>(`/reports/${id}`)
  return data
}

export async function updateReport(
  id: string,
  updates: { patient_ref?: string; procedure_report?: ProcedureReport }
): Promise<Report> {
  const { data } = await api.put<Report>(`/reports/${id}`, updates)
  return data
}

export async function deleteReport(id: string): Promise<void> {
  await api.delete(`/reports/${id}`)
}
