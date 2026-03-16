import type { Trajectory, TrajectoryListResponse, RunResponse } from "./types";
import { RUNBOOK_CONTENT } from "./runbook-content.generated";

const FLOWS_API = "https://flows-api.jetty.io/api/v1";
const COLLECTION = "pdf2croissant";
const TASK = "pdf2mlcroissant";

function getToken(): string {
  const token = process.env.JETTY_API_TOKEN;
  if (!token) throw new Error("JETTY_API_TOKEN is not set");
  return token;
}

function headers(): HeadersInit {
  return { Authorization: `Bearer ${getToken()}` };
}

/** Returns the embedded RUNBOOK.md content. */
export function loadRunbook(): string {
  return RUNBOOK_CONTENT;
}

/** Upload a PDF via the /v1/files API. Returns the file ID. */
export async function uploadFile(
  pdf: ArrayBuffer,
  filename: string
): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([pdf], { type: "application/pdf" }), filename);
  form.append("purpose", "sandbox");

  const res = await fetch(`${FLOWS_API}/files`, {
    method: "POST",
    headers: headers(),
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to upload file: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.id;
}

/**
 * Launch a run via the /run/ JSON endpoint.
 * The PDF is uploaded separately via /files and referenced by ID.
 */
export async function launchRun(params: {
  fileId: string;
  pdfFilename: string;
  datasetName?: string;
  huggingfaceUrl?: string;
}): Promise<RunResponse> {
  const runbook = loadRunbook();

  const vars: Record<string, string> = {
    pdf_filename: params.pdfFilename,
  };
  if (params.datasetName) vars.dataset_name = params.datasetName;
  if (params.huggingfaceUrl) vars.huggingface_url = params.huggingfaceUrl;

  const res = await fetch(`${FLOWS_API}/run/${COLLECTION}/${TASK}`, {
    method: "POST",
    headers: {
      ...headers(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bakery_host: "https://dock.jetty.io",
      init_params: {
        instruction: runbook,
        vars,
        agent: "claude-code",
        model: "claude-sonnet-4-6",
        snapshot: "python312-uv",
        timeout_sec: 1200,
        network_enabled: true,
        file_paths: [params.fileId],
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to launch run: ${res.status} ${text}`);
  }

  const raw = await res.json();
  const workflowId: string = raw.workflow_id ?? "";
  const parts = workflowId.split("--");
  const trajectoryId = parts[parts.length - 1] || workflowId;

  return { trajectory_id: trajectoryId, workflow_id: workflowId };
}

export async function listTrajectories(
  limit = 50
): Promise<TrajectoryListResponse> {
  const res = await fetch(
    `${FLOWS_API}/db/trajectories/${COLLECTION}/${TASK}?limit=${limit}&page=1`,
    { headers: headers(), next: { revalidate: 0 } }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to list trajectories: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getTrajectory(
  trajectoryId: string
): Promise<Trajectory> {
  const res = await fetch(
    `${FLOWS_API}/db/trajectory/${COLLECTION}/${TASK}/${trajectoryId}`,
    { headers: headers(), next: { revalidate: 0 } }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get trajectory: ${res.status} ${text}`);
  }
  return res.json();
}

export async function downloadFile(path: string): Promise<Response> {
  const res = await fetch(`${FLOWS_API}/file/${path}`, {
    headers: headers(),
  });
  if (!res.ok) {
    throw new Error(`Failed to download file: ${res.status}`);
  }
  return res;
}
