// ─────────────────────────────────────────────────────────────────────────────
// AGENT TYPES
// Shared interfaces used across all Phase 2 services (Input Normalizer,
// Orchestrator, Queue Manager, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export type InputChannel = 'whatsapp' | 'dashboard';

export type ProjectType = 'Website' | 'SaaS' | 'Mobile App';

export type ProjectStatus =
  | 'Draft'
  | 'Requirements'
  | 'Planning'
  | 'Execution'
  | 'QA'
  | 'Review'
  | 'Completed'
  | 'Cancelled';

export type AgentType =
  | 'InputNormalizer'
  | 'Orchestrator'
  | 'PM'
  | 'UIUX'
  | 'Architecture'
  | 'Developer'
  | 'Content'
  | 'QA'
  | 'Deployment'
  | 'Documentation';

export type TaskStatus = 'Pending' | 'Running' | 'Success' | 'Failed' | 'Retrying';

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZED REQUEST
// The single standard format every input channel must produce.
// This is the output of the Input Normalizer Agent.
// ─────────────────────────────────────────────────────────────────────────────
export interface NormalizedRequest {
  // Metadata
  channel: InputChannel;
  receivedAt: string; // ISO timestamp

  // Client / Contact Info
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  companyName?: string;

  // Project Details
  projectName: string;
  projectType: ProjectType;
  requirements: string;       // Free-form description of what the client wants
  featuresRequested: string[]; // Parsed list of features (e.g. ['login', 'dashboard', 'payments'])

  // Supporting Documents
  referenceUrls?: string[];   // Any reference websites shared
  documentUrls?: string[];    // Any uploaded documents (WhatsApp media / Dashboard uploads)

  // Raw original payload (for audit / logging)
  rawPayload: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUEUE TASK
// Represents a unit of work managed by the Orchestrator's Queue Manager.
// ─────────────────────────────────────────────────────────────────────────────
export interface QueueTask {
  id: string;
  projectId: string;
  agentType: AgentType;
  action: string;
  payload: Record<string, unknown>;
  status: TaskStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  nextRunAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORCHESTRATOR EVENT
// Events dispatched by the Orchestrator to communicate status changes.
// ─────────────────────────────────────────────────────────────────────────────
export type OrchestratorEvent =
  | { type: 'TASK_QUEUED'; task: QueueTask }
  | { type: 'TASK_STARTED'; task: QueueTask }
  | { type: 'TASK_SUCCESS'; task: QueueTask; result: unknown }
  | { type: 'TASK_FAILED'; task: QueueTask; error: string }
  | { type: 'TASK_RETRYING'; task: QueueTask }
  | { type: 'TASK_MAX_RETRIES_EXCEEDED'; task: QueueTask }
  | { type: 'NOTIFY_FOUNDER'; projectId: string; message: string };
