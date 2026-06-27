import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AudioRecorder } from '../components/AudioRecorder'
import { uploadRecording } from '../api/client'

export function NewRecording() {
  const navigate = useNavigate()
  const [patientRef, setPatientRef] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAudioReady = async (blob: Blob) => {
    setUploading(true)
    setError(null)
    try {
      const report = await uploadRecording(blob, patientRef || undefined)
      navigate(`/reports/${report.report_id}`)
    } catch {
      setError('Failed to process recording. Please check your connection and try again.')
      setUploading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">New Recording</h1>
        <p className="text-slate-500 text-sm mt-1">
          Describe the procedure out loud — AI generates a structured report automatically.
        </p>
      </div>

      {/* Patient ref */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Patient Reference
          <span className="ml-1.5 text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={patientRef}
          onChange={(e) => setPatientRef(e.target.value)}
          placeholder="e.g. MRN-12345 or patient initials"
          disabled={uploading}
          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white"
        />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
        <AudioRecorder onAudioReady={handleAudioReady} isUploading={uploading} />
      </div>

      {/* Tips */}
      <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(26,64,128,0.05)', border: '1px solid rgba(26,64,128,0.12)' }}>
        <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: '#1a4080' }}>
          What to include
        </p>
        <ul className="text-xs space-y-1" style={{ color: '#2060b0' }}>
          <li>• Procedure type and clinical indication</li>
          <li>• Sedation / medications administered</li>
          <li>• Technique — scope intro, landmarks reached, accessories used</li>
          <li>• Findings — mucosa, polyps (size / location), diverticula, lesions</li>
          <li>• Impression and diagnosis</li>
          <li>• Recommendations and follow-up plan</li>
          <li>• Quality indicators — prep quality, withdrawal time, cecal intubation</li>
        </ul>
      </div>
    </div>
  )
}
