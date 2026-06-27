import { useCallback, useRef, useState } from 'react'

export type RecordingState = 'idle' | 'recording' | 'stopped'

export function useAudioRecorder() {
  const [state, setState] = useState<RecordingState>('idle')
  const [duration, setSecs] = useState(0)
  const [audioBlob, setBlob] = useState<Blob | null>(null)

  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<BlobPart[]>([])
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null)
  const t0 = useRef(0)

  const start = useCallback(async () => {
    chunks.current = []
    setBlob(null)
    setSecs(0)

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    const mr = new MediaRecorder(stream, { mimeType })
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data) }
    mr.onstop = () => {
      setBlob(new Blob(chunks.current, { type: 'audio/webm' }))
      stream.getTracks().forEach((t) => t.stop())
    }

    mr.start(100)
    recorder.current = mr
    t0.current = Date.now()
    setState('recording')

    ticker.current = setInterval(() => {
      setSecs(Math.floor((Date.now() - t0.current) / 1000))
    }, 500)
  }, [])

  const stop = useCallback(() => {
    recorder.current?.stop()
    if (ticker.current) clearInterval(ticker.current)
    setState('stopped')
  }, [])

  const reset = useCallback(() => {
    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.onstop = null  // prevent async onstop from overwriting the cleared blob
      recorder.current.stop()
    }
    if (ticker.current) clearInterval(ticker.current)
    chunks.current = []
    setBlob(null)
    setSecs(0)
    setState('idle')
  }, [])

  return { state, duration, audioBlob, start, stop, reset }
}
