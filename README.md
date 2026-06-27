<div align="center">

# D-Scope Systems — AI Procedure Documentation

**Doctors talk. The report writes itself.**

An AI-powered voice-to-report assistant for GI endoscopy. A physician describes a
procedure out loud; the app transcribes the audio and generates a structured,
record-ready procedure report — no typing, no patient video, no patient data.

![Status](https://img.shields.io/badge/status-MVP-blue)
![Python](https://img.shields.io/badge/python-3.12-3776AB?logo=python&logoColor=white)
![React](https://img.shields.io/badge/react-18-61DAFB?logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-Lambda%20%7C%20DynamoDB%20%7C%20S3-FF9900?logo=amazonaws&logoColor=white)

</div>

---

## Why it exists

The procedure is the easy part — writing it up afterward is the grind. D-Scope
already captures the endoscopy; the doctor already knows what happened. This
tool removes the most tedious step: the doctor narrates the findings, and the AI
turns that narration into a clean, structured procedure note ready for the
patient record. It works alongside existing systems and never touches patient
video or PHI — just the physician's voice.

## Features

- 🎙️ **One-tap voice recording** — record the procedure narration right in the browser
- 🩺 **Medical-grade transcription** — Amazon Transcribe Medical, tuned for clinical vocabulary
- 🤖 **Structured report generation** — Claude Opus 4.8 extracts 11 standardized report fields
- ✏️ **Inline editing** — review and correct any field before finalizing
- 📋 **Report dashboard** — search and revisit past reports; live status while processing
- 🔒 **No PHI required** — only the doctor's voice is processed

## How it works

```
Doctor (browser)
      │  records voice
      ▼
React frontend  ──►  CloudFront + S3 (static hosting)
      │  POST /api/reports (audio)
      ▼
API Gateway  ──►  Lambda (FastAPI via Mangum)
      │
      ├──►  S3            store audio file
      ├──►  Transcribe Medical   audio → transcript
      ├──►  Claude Opus 4.8      transcript → structured report
      └──►  DynamoDB      persist the report
```

## Report fields generated

The model extracts these fields from the narration (any not mentioned are left blank — nothing is invented):

`procedure_type` · `procedure_date` · `indication` · `sedation_medications` ·
`technique` · `findings` · `impression` · `recommendations` · `complications` ·
`quality_indicators` · `additional_notes`

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS · TanStack Query |
| Backend | FastAPI (Python 3.12) · Mangum (AWS Lambda adapter) |
| Database | AWS DynamoDB |
| Audio storage | AWS S3 |
| Transcription | Amazon Transcribe Medical |
| Report generation | Claude Opus 4.8 (Anthropic API) |

## Getting started

### Prerequisites

- **Python 3.12** (3.13+ not yet supported by some pinned deps)
- **Node.js 18+**
- An **AWS account** with credentials configured (`aws configure`) — the identity
  needs DynamoDB, S3, and Transcribe permissions
- An **Anthropic API key**

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate              # Windows  (source venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
cp .env.example .env               # then add your ANTHROPIC_API_KEY
python ../scripts/create_aws_resources.py   # one-time: creates the DynamoDB table + S3 bucket
uvicorn app.main:app --reload      # → http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                        # → http://localhost:5173  (proxies /api → :8000)
```

Open http://localhost:5173 and you're running.

## API

Base path: `/api/reports`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/reports` | Upload audio → transcribe → generate report |
| `GET` | `/api/reports` | List all reports (newest first) |
| `GET` | `/api/reports/{id}` | Get one report |
| `PUT` | `/api/reports/{id}` | Update report fields / patient ref |
| `DELETE` | `/api/reports/{id}` | Delete a report (and its audio) |

Health check: `GET /health`

## Project structure

```
backend/
  app/
    main.py                  FastAPI app + CORS
    config.py                env-driven settings
    models.py                Pydantic models
    routers/reports.py       endpoints + the create pipeline
    services/
      transcribe.py          Amazon Transcribe Medical
      claude.py              Claude report generation
      s3.py / dynamo.py      AWS data access
  lambda_handler.py          Mangum entrypoint for Lambda
frontend/
  src/
    pages/                   Dashboard · NewRecording · ReportDetail
    components/              Layout · AudioRecorder · ReportCard · StatusBadge
    hooks/useAudioRecorder.ts  MediaRecorder wrapper
    api/client.ts            axios API client
scripts/
  create_aws_resources.py    one-time AWS setup
```

## Deployment (target architecture)

- **Frontend** → build (`npm run build`) and host the `dist/` output on **S3 + CloudFront**
- **Backend** → package `lambda_handler.py` and deploy behind **API Gateway** on **Lambda**
- **Data** → DynamoDB table + S3 bucket created by `scripts/create_aws_resources.py`

## Roadmap

- [ ] Authentication (physician accounts)
- [ ] Export reports to PDF / EHR formats
- [ ] Async transcription with background processing
- [ ] Per-specialty report templates beyond GI endoscopy

---

<div align="center">
<sub>Built for D-Scope Systems · Not a medical device · Generated reports require physician review</sub>
</div>
