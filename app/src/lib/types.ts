export interface Trajectory {
  trajectory_id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  created: string;
  updated: string;
  error: string | null;
  init_params: {
    vars?: {
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  steps: Record<string, TrajectoryStep>;
  labels?: { key: string; value: string }[];
}

export interface TrajectoryStep {
  status?: string;
  activity?: string;
  created?: string;
  ended?: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
}

export interface TrajectoryListResponse {
  trajectories: Trajectory[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface RunResponse {
  trajectory_id: string;
  workflow_id: string;
}

export interface ValidationStage {
  name: string;
  passed: boolean;
  message: string;
  details?: string | null;
}

export interface ValidationReport {
  stages: ValidationStage[];
  overall_passed: boolean;
  iterations: number;
}
