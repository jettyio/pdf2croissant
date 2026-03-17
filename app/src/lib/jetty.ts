import type { Trajectory, TrajectoryListResponse, RunResponse } from "./types";
import { RUNBOOK_CONTENT } from "./runbook-content.generated";

const MISE_HOST = "https://flows-api.jetty.io";
const COLLECTION = "pdf2croissant";
const TASK = "pdf2mlcroissant";

function getToken(): string {
  const token = process.env.JETTY_API_TOKEN;
  if (!token) throw new Error("JETTY_API_TOKEN is not set");
  return token;
}

function authHeader(): Record<string, string> {
  return { Authorization: `Bearer ${getToken()}` };
}

/** Returns the embedded RUNBOOK.md content. */
export function loadRunbook(): string {
  return RUNBOOK_CONTENT;
}

/** Upload files via /api/v1/sandbox/upload. Returns storage file_paths. */
export async function uploadFile(
  pdf: ArrayBuffer,
  filename: string
): Promise<string[]> {
  const form = new FormData();
  form.append("files", new Blob([pdf], { type: "application/pdf" }), filename);

  const res = await fetch(`${MISE_HOST}/api/v1/sandbox/upload`, {
    method: "POST",
    headers: authHeader(),
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to upload file: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.file_paths;
}

/**
 * Launch a run via /v1/chat/completions with jetty.runbook=true.
 * Follows the spot sandbox panel pattern.
 */
export async function launchRun(params: {
  filePaths: string[];
  pdfFilename: string;
  datasetName?: string;
  huggingfaceUrl?: string;
}): Promise<RunResponse> {
  const runbook = loadRunbook();

  const userParts = [
    `Generate a Croissant JSON-LD file for the dataset described in the uploaded PDF.`,
    `PDF filename: ${params.pdfFilename}`,
    params.datasetName && `Dataset name: ${params.datasetName}`,
    params.huggingfaceUrl && `HuggingFace URL: ${params.huggingfaceUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const body = {
    model: "claude-opus-4-6",
    messages: [
      { role: "system", content: runbook },
      { role: "user", content: userParts },
    ],
    stream: false,
    jetty: {
      runbook: true,
      collection: COLLECTION,
      task: TASK,
      snapshot: "python312-uv",
      timeout_hint: 5,
      ...(params.filePaths.length > 0
        ? { file_paths: params.filePaths }
        : {}),
    },
  };

  const res = await fetch(`${MISE_HOST}/v1/chat/completions`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });

  // The upstream may return 500 even when the task started successfully.
  // Parse the body and check for valid trajectory data before treating as error.
  const responseText = await res.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    data = null;
  }

  const hasTrajectory = !!(
    data?.jetty_metadata?.trajectory_id ||
    data?.jetty_metadata?.workflow_id
  );

  if (!res.ok && !hasTrajectory) {
    const errMsg =
      typeof data?.error === "object"
        ? data.error.message
        : data?.error || data?.detail || `HTTP ${res.status}`;
    throw new Error(`Failed to launch run: ${errMsg}`);
  }

  const workflowId: string =
    data?.jetty_metadata?.workflow_id ?? data?.id ?? "";
  const trajectoryId: string =
    data?.jetty_metadata?.trajectory_id ??
    workflowId.split("--").pop() ??
    workflowId;

  return { trajectory_id: trajectoryId, workflow_id: workflowId };
}

export async function listTrajectories(
  limit = 50
): Promise<TrajectoryListResponse> {
  const res = await fetch(
    `${MISE_HOST}/api/v1/db/trajectories/${COLLECTION}/${TASK}?limit=${limit}&page=1`,
    { headers: authHeader(), next: { revalidate: 0 } }
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
    `${MISE_HOST}/api/v1/db/trajectory/${COLLECTION}/${TASK}/${trajectoryId}`,
    { headers: authHeader(), next: { revalidate: 0 } }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get trajectory: ${res.status} ${text}`);
  }
  return res.json();
}

export async function downloadFile(path: string): Promise<Response> {
  const res = await fetch(`${MISE_HOST}/api/v1/file/${path}`, {
    headers: authHeader(),
  });
  if (!res.ok) {
    throw new Error(`Failed to download file: ${res.status}`);
  }
  return res;
}
