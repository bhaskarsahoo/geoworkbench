import type { BoreholeListItem, BoreholeWorkbench, LithologyInterval } from "./types";

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

