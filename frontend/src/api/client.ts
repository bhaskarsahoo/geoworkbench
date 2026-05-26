import type {
  BoreholeListItem,
  BoreholeAiSummary,
  BoreholeWorkbench,
  BoreholeStatus,
  DisplayLayout,
  ExportJob,
  ExportReadiness,
  ImportProfile,
  LithologyInterval,
  SourceFile,
  ValidationIssue,
  AiSuggestion,
} from "./types";

const API_BASE = "/api";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export function listBoreholes(): Promise<BoreholeListItem[]> {
  return request<BoreholeListItem[]>("/boreholes");
}

export function getWorkbench(boreholeId: number): Promise<BoreholeWorkbench> {
  return request<BoreholeWorkbench>(`/boreholes/${boreholeId}/workbench`);
}

export function updateInterval(
  intervalId: string,
  patch: Partial<LithologyInterval>,
): Promise<LithologyInterval> {
  return request<LithologyInterval>(`/boreholes/intervals/${intervalId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function listImportProfiles(): Promise<ImportProfile[]> {
  return request<ImportProfile[]>("/imports/profiles");
}

export function runValidation(boreholeId: number): Promise<ValidationIssue[]> {
  return request<ValidationIssue[]>(`/validation/boreholes/${boreholeId}/run`, {
    method: "POST",
  });
}

export function generateAiSuggestions(boreholeId: number): Promise<AiSuggestion[]> {
  return request<AiSuggestion[]>(`/ai/boreholes/${boreholeId}/suggestions/generate`, {
    method: "POST",
  });
}

export function acceptAiSuggestion(suggestionId: number): Promise<AiSuggestion> {
  return request<AiSuggestion>(`/ai/suggestions/${suggestionId}/accept`, { method: "POST" });
}

export function updateAiSuggestionStatus(
  suggestionId: number,
  status: "open" | "accepted" | "rejected",
): Promise<AiSuggestion> {
  return request<AiSuggestion>(`/ai/suggestions/${suggestionId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getBoreholeAiSummary(boreholeId: number): Promise<BoreholeAiSummary> {
  return request<BoreholeAiSummary>(`/ai/boreholes/${boreholeId}/summary`);
}

export function getAiProviderStatus(): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>("/ai/provider-status");
}

export function createSourceFile(payload: {
  borehole_id: number | null;
  file_type: string;
  original_name: string;
  storage_path: string;
  file_metadata?: Record<string, unknown> | null;
}): Promise<SourceFile> {
  return request<SourceFile>("/imports/source-files", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadSourceFile(payload: {
  borehole_id: number | null;
  file_type: string;
  file: File;
}): Promise<SourceFile> {
  const form = new FormData();
  form.append("file", payload.file);
  form.append("file_type", payload.file_type);
  if (payload.borehole_id !== null) {
    form.append("borehole_id", String(payload.borehole_id));
  }
  const response = await fetch(`${API_BASE}/imports/upload`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<SourceFile>;
}

export function processSourceFile(sourceFileId: number): Promise<{
  source_file: SourceFile;
  source_import_id: number;
  summary: Record<string, unknown>;
}> {
  return request(`/imports/source-files/${sourceFileId}/process`, { method: "POST" });
}

export function updateDisplayLayout(
  layoutId: number,
  patch: Partial<DisplayLayout>,
): Promise<DisplayLayout> {
  return request<DisplayLayout>(`/boreholes/display-layouts/${layoutId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function resetDisplayLayout(boreholeId: number): Promise<DisplayLayout> {
  return request<DisplayLayout>(`/boreholes/${boreholeId}/display-layout/reset`, {
    method: "POST",
  });
}

export function approveBoreholeForExport(boreholeId: number): Promise<BoreholeStatus> {
  return request<BoreholeStatus>(`/boreholes/${boreholeId}/approve-export`, {
    method: "POST",
  });
}

export function importSourceFileAsBorehole(sourceFileId: number): Promise<{
  source_file: SourceFile;
  borehole_id: number;
  borehole_code: string;
  summary: Record<string, unknown>;
}> {
  return request(`/imports/source-files/${sourceFileId}/import-borehole`, { method: "POST" });
}

export function mergeSourceFileIntoBorehole(sourceFileId: number): Promise<{
  source_file: SourceFile;
  borehole_id: number;
  status: string;
  summary: Record<string, unknown>;
}> {
  return request(`/imports/source-files/${sourceFileId}/merge`, { method: "POST" });
}

export function getExportReadiness(boreholeId: number): Promise<ExportReadiness> {
  return request<ExportReadiness>(`/exports/boreholes/${boreholeId}/readiness`);
}

export function listExportJobs(boreholeId: number): Promise<ExportJob[]> {
  return request<ExportJob[]>(`/exports/boreholes/${boreholeId}/jobs`);
}

export function createExportJob(boreholeId: number, exportType: string): Promise<ExportJob> {
  return request<ExportJob>(`/exports/boreholes/${boreholeId}/jobs`, {
    method: "POST",
    body: JSON.stringify({ export_type: exportType }),
  });
}

export function exportDownloadUrl(exportJobId: number): string {
  return `${API_BASE}/exports/jobs/${exportJobId}/download`;
}
