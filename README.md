# Dscope Systems — AI Procedure Documentation

AI-powered voice-to-report assistant for GI endoscopy. A physician describes a
procedure out loud; the app transcribes it and generates a structured procedure
report ready for the patient record. No patient video or data required — just the
doctor's voice.

## How it works

```
Doctor (browser) → records voice
        ↓
React frontend (S3 + CloudFront)
        ↓
API Gateway → Lambda (FastAPI via Mangum)
        ↓
   ┌────────────┬──────────────────────┐
   ↓            ↓                       ↓
DynamoDB      S3 (audio)        Amazon Transcribe Medical
(reports)                              ↓
                              Claude Opus 4.8 (report generation)
```

## Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query
- **Backend:** FastAPI (Python) + Mangum (AWS Lambda adapter)
- **Database:** AWS DynamoDB
- **Storage:** AWS S3 (audio files)
- **Transcription:** Amazon Transcribe Medical
- **Report generation:** Claude Opus 4.8 (Anthropic API)

## Local development

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows;  source venv/bin/activate on macOS/Linux
pip install -r requirements.txt
cp .env.example .env           # then fill in ANTHROPIC_API_KEY
python ../scripts/create_aws_resources.py   # one-time: creates DynamoDB table + S3 bucket
uvicorn app.main:app --reload  # http://localhost:8000
```

AWS credentials are read from your environment / `~/.aws/credentials` (run `aws configure`).
The IAM identity needs DynamoDB, S3, and Transcribe permissions.

### Frontend

```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173 (proxies /api → :8000)
```

## Project structure

```
backend/
  app/
    main.py                    FastAPI app + CORS
    config.py                  settings (env-driven)
    models.py                  Pydantic models
    routers/reports.py         CRUD + the create pipeline
    services/
      transcribe.py            Amazon Transcribe Medical
      claude.py                Claude report generation
      s3.py / dynamo.py        AWS data access
  lambda_handler.py            Mangum entrypoint for Lambda
frontend/
  src/
    pages/                     Dashboard, NewRecording, ReportDetail
    components/                Layout, AudioRecorder, ReportCard, StatusBadge
    hooks/useAudioRecorder.ts  MediaRecorder wrapper
    api/client.ts              axios API client
scripts/
  create_aws_resources.py      one-time AWS setup
```
