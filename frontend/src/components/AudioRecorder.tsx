import { Mic, RotateCcw, Square, Upload } from 'lucide-react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'

function fmtDuration(secs: number) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  return `${m}:${s}`
}

const BARS = [35, 60, 45, 80, 30, 70, 55, 90, 40, 65, 50, 85, 38, 72, 48]

interface Props {
  onAudioReady: (blob: Blob) => void
  isUploading: boolean
}

export function AudioRecorder({ onAudioReady, isUploading }: Props) {
  const { state, duration, audioBlob, start, stop, reset } = useAudioRecorder()

  return (
    <div className="flex flex-col items-center gap-8 py-10 px-6">
      {/* Timer */}
      <div
        className="text-6xl font-mono font-light tabular-nums tracking-tight"
        style={{ color: state === 'recording' ? '#d4a020' : '#475569' }}
      >
        {fmtDuration(duration)}
      </div>

      {/* Waveform */}
      <div className="flex items-center gap-1 h-12">
        {BARS.map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full transition-all"
            style={{
              background: state === 'recording' ? '#d4a020' : '#cbd5e1',
              height: state === 'recording' ? `${h}%` : '20%',
              animation: state === 'recording'
                ? `soundwave ${0.5 + (i % 4) * 0.15}s ease-in-out ${i * 0.04}s infinite alternate`
                : undefined,
            }}
          />
        ))}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        {state === 'idle' && (
          <button
            onClick={start}
            className="flex items-center gap-2 px-8 py-3.5 text-white rounded-full font-semibold transition-colors"
            style={{ background: '#1a4080' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#2060b0')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#1a4080')}
          >
            <Mic className="w-5 h-5" />
            Start Recording
          </button>
        )}

        {state === 'recording' && (
          <button
            onClick={stop}
            className="flex items-center gap-2 px-8 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors"
          >
            <Square className="w-4 h-4 fill-white" />
            Stop Recording
          </button>
        )}

        {state === 'stopped' && (
          <>
            <button
              onClick={reset}
              disabled={isUploading}
              className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full font-medium text-sm transition-colors disabled:opacity-40"
            >
              <RotateCcw className="w-4 h-4" />
              Re-record
            </button>
            <button
              onClick={() => audioBlob && onAudioReady(audioBlob)}
              disabled={!audioBlob || isUploading}
              className="flex items-center gap-2 px-8 py-3 text-white rounded-full font-semibold text-sm transition-colors disabled:opacity-40"
              style={{ background: '#d4a020' }}
              onMouseEnter={e => { if (!isUploading) (e.currentTarget as HTMLElement).style.background = '#b88810' }}
              onMouseLeave={e => { if (!isUploading) (e.currentTarget as HTMLElement).style.background = '#d4a020' }}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating Report…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          </>
        )}
      </div>

      {state === 'idle' && (
        <p className="text-sm text-slate-400 text-center max-w-sm leading-relaxed">
          Describe the procedure out loud — findings, technique, impressions, and
          recommendations. AI will generate a structured report.
        </p>
      )}

      {state === 'stopped' && (
        <p className="text-sm text-slate-500 text-center">
          {fmtDuration(duration)} recorded &mdash; click <strong>Generate Report</strong> to process
        </p>
      )}
    </div>
  )
}
