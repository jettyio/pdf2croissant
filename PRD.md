# PDF → MLCommons Croissant Generator

## Overview

A lightweight Next.js application where a user uploads an academic paper (PDF) and an AI agent produces a valid [MLCommons Croissant](https://mlcommons.org/croissant/) JSON-LD metadata file describing the dataset introduced in the paper.

The agent follows a detailed runbook that guides it through reading the PDF, extracting dataset metadata, iteratively building the JSON-LD, validating it against the Croissant schema, and writing an executive summary of gaps and limitations.

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│  Next.js App (pdf2mlcroissant)                    │
│                                                    │
│  Home page: Upload PDF + optional HuggingFace URL │
│  Run page:  Status → JSON viewer → Summary        │
│                                                    │
│  /api/run      → POST launch (upload + chat)      │
│  /api/trajectory/[id] → GET poll status            │
│  /api/trajectories    → GET history                │
│  /api/file            → GET proxy downloads        │
└───────────────┬──────────────────────────────────┘
                │  HTTPS (Bearer token)
                ▼
┌──────────────────────────────────────────────────┐
│  Jetty API  (flows-api.jetty.io)                  │
│                                                    │
│  1. POST /v1/files     → upload PDF, get file_id  │
│  2. POST /v1/chat/completions (runbook mode)      │
│     - system message = RUNBOOK.md content         │
│     - jetty.files = [file_id]                     │
│     - jetty.runbook = true                        │
│                                                    │
│  Agent reads PDF, writes /app/results/            │
│    ├── croissant.json                             │
│    ├── summary.md                                 │
│    └── validation_report.json                     │
└──────────────────────────────────────────────────┘
```

### How It Works (OpenAI-Compatible API)

Instead of pre-registering a task and storing the runbook inside Jetty, we use the **OpenAI-compatible chat completions endpoint** with `jetty.runbook: true`. This means:

1. **Upload the PDF** — `POST /v1/files` with the PDF, get back a `file_id`
2. **Send a chat completion** — `POST /v1/chat/completions` with:
   - `messages[0].role = "system"` containing the full RUNBOOK.md content
   - `messages[1].role = "user"` containing the user's prompt (dataset name, HF URL, etc.)
   - `jetty.runbook = true` to trigger agent execution
   - `jetty.files = [file_id]` to make the PDF available in the sandbox
   - `jetty.collection`, `jetty.task`, `jetty.agent`, `jetty.snapshot`, etc.
3. **Poll the trajectory** — The response includes `jetty_metadata.workflow_id` and `jetty_metadata.poll_url` for tracking status
4. **Fetch results** — Download `croissant.json`, `summary.md`, and `validation_report.json` from the trajectory's output files

This approach keeps the runbook in the app's source code (RUNBOOK.md) and sends it fresh with every request — no Jetty-side task configuration needed beyond the collection existing.

---

## User Flow

1. **Upload** — User drops a PDF (or pastes a URL to an arXiv paper). Optionally provides a HuggingFace dataset URL as a hint.
2. **Launch** — App uploads the PDF via `/v1/files`, then sends a chat completion request with the runbook as the system prompt.
3. **Monitor** — User is redirected to `/run/{trajectory_id}`. Page polls trajectory status every 5 seconds.
4. **Results** — When complete, the page displays:
   - The generated Croissant JSON-LD (syntax-highlighted, collapsible)
   - Validation status (pass/fail per stage: JSON, Croissant schema, records)
   - Executive summary (markdown) covering what was extracted, what was inferred, and what gaps remain
   - Download button for the JSON file

---

## Jetty Integration

### Launch Flow (lib/jetty.ts)

```typescript
const FLOWS_API = "https://flows-api.jetty.io/api/v1";

// Step 1: Upload PDF via /v1/files API
async function uploadFile(pdf: File): Promise<string> {
  const form = new FormData();
  form.append("file", pdf);
  form.append("purpose", "sandbox");

  const res = await fetch(`${FLOWS_API}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json();
  return data.id; // opaque file ID
}

// Step 2: Send chat completion with runbook
async function launchRun(params: {
  fileId: string;
  runbook: string;
  datasetName?: string;
  huggingfaceUrl?: string;
}): Promise<{ trajectoryId: string; workflowId: string }> {
  const userPrompt = [
    `Generate a Croissant JSON-LD file for the dataset described in the uploaded PDF.`,
    params.datasetName && `Dataset name: ${params.datasetName}`,
    params.huggingfaceUrl && `HuggingFace URL: ${params.huggingfaceUrl}`,
  ].filter(Boolean).join("\n");

  const res = await fetch(`${FLOWS_API}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      messages: [
        { role: "system", content: params.runbook },
        { role: "user", content: userPrompt },
      ],
      stream: false,
      jetty: {
        runbook: true,
        collection: "jettyio",
        task: "pdf2mlcroissant",
        agent: "claude-code",
        snapshot: "python312-uv",
        timeout_sec: 1200,
        cpus: 4,
        memory: "8G",
        network_enabled: true,
        files: [params.fileId],
      },
    }),
  });

  const data = await res.json();
  return {
    trajectoryId: data.jetty_metadata.workflow_id.split("--").pop(),
    workflowId: data.jetty_metadata.workflow_id,
  };
}
```

### Polling & File Access

Polling and file downloads use the same endpoints as other Jetty apps:

```
GET /db/trajectories/{collection}/{task}?limit=50&page=1
GET /db/trajectory/{collection}/{task}/{trajectory_id}
GET /file/{full_path}
```

---

## Frontend Components

### Home Page (`/`)
- **UploadForm** — Drag-and-drop PDF upload area, optional text fields for HuggingFace URL and dataset name, "Generate" button
- **RunHistory** — Table of recent runs (trajectory list) with status badges, timestamps, and links to detail pages

### Run Detail Page (`/run/[id]`)
- **RunStatusBanner** — Status indicator (pending / running / completed / failed)
- **RunMetadata** — Created time, duration, input filename
- **CroissantViewer** — Syntax-highlighted JSON-LD viewer with copy-to-clipboard and download
- **ValidationResults** — Card per validation stage (JSON, Schema, Records) with pass/fail icons and error details
- **SummaryReport** — Rendered markdown of the executive summary
- **StepTimeline** — Shows pipeline step progress
- **AllFiles** — Browse all output files

### Shared
- **lib/jetty.ts** — Jetty API client (uploadFile, launchRun, listTrajectories, getTrajectory, downloadFile)
- **lib/types.ts** — TypeScript interfaces (Trajectory, TrajectoryStep, etc.)
- **hooks/useTrajectory.ts** — React Query hook with auto-polling
- **hooks/useTrajectories.ts** — React Query hook for history

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/run` | POST | Accept multipart form (PDF + params), upload PDF via `/v1/files`, send chat completion with runbook, return `{trajectory_id, workflow_id}` |
| `/api/trajectories` | GET | List recent trajectories from `pdf2mlcroissant` task |
| `/api/trajectory/[id]` | GET | Fetch single trajectory |
| `/api/file` | GET | Proxy file download from Jetty storage (`?path=...`) |

---

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **React 19**
- **Tailwind CSS 4**
- **@tanstack/react-query** for polling & cache
- **lucide-react** for icons
- **react-markdown + remark-gfm** for summary rendering

---

## Environment

```
JETTY_API_TOKEN=mlc_...
```

---

## Example Ground-Truth Data

The project root contains 5 reference dataset examples with their academic papers and known-good Croissant files:

| Dataset | Paper | Croissant |
|---------|-------|-----------|
| SQuAD 2.0 | arxiv:1806.03822 | v1.1 |
| GLUE | arxiv:1804.07461 | v1.0 |
| WikiText | arxiv:1609.07843 | v1.0 |
| CNN/DailyMail | arxiv:1506.03340 | v1.0 |
| GSM8K | arxiv:2110.14168 | v1.1 |

These can be used to evaluate the quality of the generated Croissant files by comparing agent output against the ground truth.

---

## Validation Strategy

The agent uses `mlcroissant` (Python) to validate its own output during generation. The validation has three stages:

1. **JSON validity** — Is the file parseable JSON?
2. **Croissant schema** — Does `mlcroissant.Dataset(jsonld=data)` succeed without `ValidationError`?
3. **Records generation** — Can at least one record set be iterated? (best-effort; may skip if no accessible data source)

The agent iterates up to 3 times to fix validation errors before finalizing.

---

## Scope & Non-Goals

**In scope:**
- Single-PDF upload → Croissant generation
- Validation against mlcroissant library
- Executive summary of extraction quality
- Simple web UI for upload, monitoring, and results

**Not in scope (v1):**
- Batch processing of multiple PDFs
- Direct HuggingFace dataset download/analysis
- Croissant editing UI
- User accounts or auth
