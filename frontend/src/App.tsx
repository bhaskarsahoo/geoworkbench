import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import {
  approveBoreholeForExport,
  createSourceFile,
  createExportJob,
  acceptAiSuggestion,
  getExportReadiness,
  generateAiSuggestions,
  getWorkbench,
  getBoreholeAiSummary,
  getAiProviderStatus,
  importSourceFileAsBorehole,
  listBoreholes,
  listExportJobs,
  listImportProfiles,
  processSourceFile,
  runValidation,
  uploadSourceFile,
  resetDisplayLayout,
  updateDisplayLayout,
  updateAiSuggestionStatus,
  updateInterval,
} from "./api/client";
import type { DisplayLayout, LithologyInterval } from "./api/types";
import { AiWorkflowPanel } from "./workbench/ai/AiWorkflowPanel";
import { ExportPanel } from "./workbench/exports/ExportPanel";
import { DisplaySettingsPanel } from "./workbench/display/DisplaySettingsPanel";
import { LogWidget } from "./workbench/widgets/LogWidget";
import { useWorkbenchStore } from "./workbench/display/workbenchStore";

export function App() {
  const queryClient = useQueryClient();
  const [boreholeId, setBoreholeId] = useState<number | null>(null);
  const { selectedInterval, setSelectedInterval, selectedImage, setSelectedImage, mode, setMode } =
    useWorkbenchStore();
  const { selectedRemarkGroup, setSelectedRemarkGroup } = useWorkbenchStore();

  const boreholes = useQuery({ queryKey: ["boreholes"], queryFn: listBoreholes });
  const importProfiles = useQuery({ queryKey: ["importProfiles"], queryFn: listImportProfiles });
  const activeId = boreholeId ?? boreholes.data?.[0]?.id;
  const workbench = useQuery({
    queryKey: ["workbench", activeId],
    queryFn: () => getWorkbench(activeId as number),
    enabled: Boolean(activeId),
  });
  const aiSummary = useQuery({
    queryKey: ["aiSummary", activeId],
    queryFn: () => getBoreholeAiSummary(activeId as number),
    enabled: Boolean(activeId),
  });
  const aiProvider = useQuery({ queryKey: ["aiProvider"], queryFn: getAiProviderStatus });
  const exportReadiness = useQuery({
    queryKey: ["exportReadiness", activeId],
    queryFn: () => getExportReadiness(activeId as number),
    enabled: Boolean(activeId),
  });
  const exportJobs = useQuery({
    queryKey: ["exportJobs", activeId],
    queryFn: () => listExportJobs(activeId as number),
    enabled: Boolean(activeId),
  });

  const saveInterval = useMutation({
    mutationFn: (patch: Partial<LithologyInterval>) =>
      updateInterval(selectedInterval?.id ?? "", patch),
    onSuccess: (updated) => {
      setSelectedInterval(updated);
      queryClient.invalidateQueries({ queryKey: ["workbench", activeId] });
    },
  });
  const validateCurrent = useMutation({
    mutationFn: () => runValidation(activeId as number),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workbench", activeId] }),
  });
  const generateSuggestions = useMutation({
    mutationFn: () => generateAiSuggestions(activeId as number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workbench", activeId] });
      queryClient.invalidateQueries({ queryKey: ["aiSummary", activeId] });
    },
  });
  const acceptSuggestion = useMutation({
    mutationFn: (suggestionId: number) => acceptAiSuggestion(suggestionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workbench", activeId] });
      queryClient.invalidateQueries({ queryKey: ["aiSummary", activeId] });
    },
  });
  const rejectSuggestion = useMutation({
    mutationFn: (suggestionId: number) => updateAiSuggestionStatus(suggestionId, "rejected"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workbench", activeId] }),
  });
  const createExport = useMutation({
    mutationFn: (exportType: string) => createExportJob(activeId as number, exportType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exportReadiness", activeId] });
      queryClient.invalidateQueries({ queryKey: ["exportJobs", activeId] });
    },
  });
  const approveExport = useMutation({
    mutationFn: () => approveBoreholeForExport(activeId as number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boreholes"] });
      queryClient.invalidateQueries({ queryKey: ["workbench", activeId] });
      queryClient.invalidateQueries({ queryKey: ["exportReadiness", activeId] });
    },
  });
  const saveDisplayLayout = useMutation({
    mutationFn: (layout: DisplayLayout) =>
      updateDisplayLayout(layout.id, {
        name: layout.name,
        mode: layout.mode,
        settings: layout.settings,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workbench", activeId] }),
  });
  const resetCurrentLayout = useMutation({
    mutationFn: () => resetDisplayLayout(activeId as number),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workbench", activeId] }),
  });
  const registerSourceFile = useMutation({
    mutationFn: (payload: { file_type: string; original_name: string }) =>
      createSourceFile({
        borehole_id: activeId ?? null,
        file_type: payload.file_type,
        original_name: payload.original_name,
        storage_path: `registered://${payload.original_name}`,
        file_metadata: { registration_mode: "simulated" },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workbench", activeId] }),
  });
  const uploadFile = useMutation({
    mutationFn: (payload: { file_type: string; file: File }) =>
      uploadSourceFile({
        borehole_id: activeId ?? null,
        file_type: payload.file_type,
        file: payload.file,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workbench", activeId] }),
  });
  const processFile = useMutation({
    mutationFn: (sourceFileId: number) => processSourceFile(sourceFileId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workbench", activeId] }),
  });
  const importBoreholeFile = useMutation({
    mutationFn: (sourceFileId: number) => importSourceFileAsBorehole(sourceFileId),
    onSuccess: (result) => {
      setBoreholeId(result.borehole_id);
      queryClient.invalidateQueries({ queryKey: ["boreholes"] });
      queryClient.invalidateQueries({ queryKey: ["workbench"] });
    },
  });

  const intervalsByCode = useMemo(() => {
    const counts = new Map<string, number>();
    for (const interval of workbench.data?.lithology_intervals ?? []) {
      const code = interval.lithology_code ?? "UNKNOWN";
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [workbench.data]);

  const selectedCoreImage = useMemo(() => {
    if (!selectedInterval || !workbench.data) return null;
    return (
      workbench.data.core_images.find((image) => image.box_number === selectedInterval.image_box) ??
      workbench.data.core_images.find(
        (image) =>
          image.from_depth !== null &&
          image.to_depth !== null &&
          image.from_depth <= selectedInterval.from_depth &&
          image.to_depth >= selectedInterval.from_depth,
      ) ??
      null
    );
  }, [selectedInterval, workbench.data]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <strong>GeoWorkbench</strong>
          <span>Borehole correction system</span>
        </div>
        <div className="toolbar">
          <select
            value={activeId ?? ""}
            onChange={(event) => setBoreholeId(Number(event.target.value))}
          >
            {boreholes.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.project_code} / {item.site_code} / {item.code} · {item.workflow_status}
              </option>
            ))}
          </select>
          <button
            className={mode === "runtime" ? "active" : ""}
            onClick={() => setMode("runtime")}
            type="button"
          >
            Runtime
          </button>
          <button
            className={mode === "edit" ? "active" : ""}
            onClick={() => setMode("edit")}
            type="button"
          >
            Edit display
          </button>
        </div>
      </header>

      <section className="workspace">
        <aside className="side-panel">
          <h2>Project</h2>
          <div className="status-card">
            <strong>{workbench.data?.code ?? "-"}</strong>
            <span>{workbench.data?.workflow_status.replaceAll("_", " ") ?? "-"}</span>
          </div>
          <div className="metric-grid">
            <div className="metric">
              <b>{workbench.data?.total_depth ?? "-"} m</b>
              <span>Total depth</span>
            </div>
            <div className="metric">
              <b>{workbench.data?.lithology_intervals.length ?? "-"}</b>
              <span>Intervals</span>
            </div>
            <div className="metric">
              <b>{workbench.data?.curves.length ?? "-"}</b>
              <span>Curves</span>
            </div>
            <div className="metric">
              <b>{workbench.data?.core_images.length ?? "-"}</b>
              <span>Coreboxes</span>
            </div>
          </div>

          <h2>Track Settings</h2>
          {mode === "edit" ? (
            <DisplaySettingsPanel
              layout={workbench.data?.layout ?? null}
              availableCurves={workbench.data?.curves ?? []}
              saving={saveDisplayLayout.isPending}
              resetting={resetCurrentLayout.isPending}
              onSave={(layout) => saveDisplayLayout.mutate(layout)}
              onReset={() => resetCurrentLayout.mutate()}
            />
          ) : (
            <div className="settings-note">
              Runtime mode is for correction, AI review, image inspection, and export readiness.
            </div>
          )}

          <h2>Lithology Counts</h2>
          <ul className="compact-list">
            {intervalsByCode.map(([code, count]) => (
              <li key={code}>
                <span>{code}</span>
                <b>{count}</b>
              </li>
            ))}
          </ul>

          <h2>Validation</h2>
          <button
            type="button"
            className="full-width-action"
            disabled={!activeId || validateCurrent.isPending}
            onClick={() => validateCurrent.mutate()}
          >
            {validateCurrent.isPending ? "Running validation..." : "Run validation"}
          </button>
          <div className="validation-summary">
            <span>
              {workbench.data?.validation_issues.filter((issue) => issue.severity === "error").length ??
                0}{" "}
              errors
            </span>
            <span>
              {workbench.data?.validation_issues.filter((issue) => issue.severity === "warning").length ??
                0}{" "}
              warnings
            </span>
            <span>
              {workbench.data?.validation_issues.filter((issue) => issue.severity === "info").length ??
                0}{" "}
              info
            </span>
          </div>
          <div className="validation-list">
            {workbench.data?.validation_issues.slice(0, 8).map((issue) => (
              <button
                key={issue.id}
                type="button"
                className={`validation-item ${issue.severity}`}
                onClick={() => {
                  if (issue.from_depth !== null) {
                    useWorkbenchStore.getState().setSelectedDepth(issue.from_depth);
                  }
                }}
              >
                <strong>{issue.severity}</strong>
                <span>{issue.message}</span>
              </button>
            ))}
          </div>

          <h2>AI Workflow</h2>
          <AiWorkflowPanel
            summary={aiSummary.data}
            provider={aiProvider.data}
            suggestions={workbench.data?.ai_suggestions ?? []}
            generating={generateSuggestions.isPending}
            acting={acceptSuggestion.isPending || rejectSuggestion.isPending}
            onGenerate={() => generateSuggestions.mutate()}
            onAccept={(suggestionId) => acceptSuggestion.mutate(suggestionId)}
            onReject={(suggestionId) => rejectSuggestion.mutate(suggestionId)}
          />

          <h2>Export</h2>
          <ExportPanel
            readiness={exportReadiness.data}
            jobs={exportJobs.data}
            creating={createExport.isPending}
            approving={approveExport.isPending}
            onCreate={(exportType) => createExport.mutate(exportType)}
            onApprove={() => approveExport.mutate()}
          />

          <h2>Data Arrival</h2>
          <form
            className="source-file-form"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const fileType = String(form.get("file_type") || "excel");
              const file = form.get("file");
              if (file instanceof File && file.name) {
                uploadFile.mutate({ file_type: fileType, file });
                event.currentTarget.reset();
                return;
              }
              const fileName = String(form.get("original_name") || "").trim();
              if (fileName) {
                registerSourceFile.mutate({ file_type: fileType, original_name: fileName });
              }
              event.currentTarget.reset();
            }}
          >
            <select name="file_type" defaultValue="excel">
              <option value="excel">Excel</option>
              <option value="las">LAS</option>
              <option value="images">Images</option>
              <option value="mobile_form">Mobile form</option>
            </select>
            <input name="file" type="file" />
            <input name="original_name" placeholder="or register filename" />
            <button type="submit" disabled={registerSourceFile.isPending || uploadFile.isPending}>
              {uploadFile.isPending ? "Uploading..." : "Add"}
            </button>
          </form>
          <div className="arrival-list">
            {workbench.data?.source_files.map((item) => (
              <div key={`source-file:${item.id}`} className="arrival-item">
                <strong>{item.file_type} file</strong>
                <span>{item.status}</span>
                <small>{item.original_name}</small>
                <button
                  type="button"
                  disabled={processFile.isPending || item.status === "parsed"}
                  onClick={() => processFile.mutate(item.id)}
                >
                  {item.status === "parsed" ? "Parsed" : "Process"}
                </button>
                {item.file_type === "excel" && (
                  <button
                    type="button"
                    disabled={importBoreholeFile.isPending}
                    onClick={() => importBoreholeFile.mutate(item.id)}
                  >
                    Import borehole
                  </button>
                )}
              </div>
            ))}
            {workbench.data?.source_imports.map((item) => (
              <div key={`import:${item.id}`} className="arrival-item">
                <strong>{item.import_type}</strong>
                <span>{item.status}</span>
                <small>{item.source_name}</small>
              </div>
            ))}
            {workbench.data?.field_submissions.map((item) => (
              <div key={`submission:${item.id}`} className="arrival-item">
                <strong>{item.submission_type}</strong>
                <span>{item.status}</span>
                <small>{item.submitted_by ?? "field user"}</small>
              </div>
            ))}
          </div>

          <h2>Import Profiles</h2>
          <div className="arrival-list">
            {importProfiles.data?.map((profile) => (
              <div key={profile.id} className="arrival-item">
                <strong>{profile.name}</strong>
                <span>{profile.profile_type}</span>
                <small>{profile.description}</small>
              </div>
            ))}
          </div>
        </aside>

        <section className="log-region">
          {workbench.isLoading && <div className="empty">Loading borehole workbench...</div>}
          {workbench.error && <div className="empty">Could not load workbench.</div>}
          {workbench.data && <LogWidget data={workbench.data} />}
        </section>

        <aside className="details-panel">
          <h2>Depth Metadata</h2>
          {!selectedInterval && <div className="empty">Select an interval or curve point.</div>}
          {selectedInterval && (
            <>
              <div className="interval-card">
                <strong>
                  {selectedInterval.from_depth} m - {selectedInterval.to_depth} m
                </strong>
                <span>
                  {selectedInterval.lithology_code} · {selectedInterval.lithology_label}
                </span>
                <small>Source row {selectedInterval.source_row ?? "-"}</small>
              </div>

              <div className="field-grid">
                <div className="field">
                  <span>Thickness</span>
                  <b>{(selectedInterval.to_depth - selectedInterval.from_depth).toFixed(2)} m</b>
                </div>
                <div className="field">
                  <span>Logged color</span>
                  <b>{selectedInterval.logged_color || "-"}</b>
                </div>
                <div className="field">
                  <span>Seam</span>
                  <b>{selectedInterval.seam_name || "-"}</b>
                </div>
                <div className="field">
                  <span>Recovery</span>
                  <b>
                    {selectedInterval.recovery ?? "-"} m{" "}
                    {selectedInterval.recovery_percent
                      ? `(${selectedInterval.recovery_percent}%)`
                      : ""}
                  </b>
                </div>
                <div className="field">
                  <span>RQD</span>
                  <b>
                    {selectedInterval.rqd !== null
                      ? `${Math.round(selectedInterval.rqd * 100)}%`
                      : "-"}
                  </b>
                </div>
                <div className="field">
                  <span>Core box</span>
                  <b>{selectedCoreImage ? `Box ${selectedCoreImage.box_number}` : "-"}</b>
                </div>
                <div className="field full">
                  <span>Features</span>
                  <b>{selectedInterval.structural_features || "-"}</b>
                </div>
                <div className="field full">
                  <span>Remarks</span>
                  <b>{selectedInterval.remark || "-"}</b>
                </div>
                <div className="field full">
                  <span>Source</span>
                  <b>
                    {workbench.data?.source_workbook || "-"} · sheet{" "}
                    {workbench.data?.source_sheet || "-"} · row{" "}
                    {selectedInterval.source_row ?? "-"}
                  </b>
                </div>
              </div>

              {selectedCoreImage && (
                <button
                  type="button"
                  className="core-preview"
                  onClick={() => setSelectedImage(selectedCoreImage)}
                >
                  <img
                    src={selectedCoreImage.url}
                    alt={`Corebox ${selectedCoreImage.box_number}`}
                  />
                  <span>
                    Corebox {selectedCoreImage.box_number} · {selectedCoreImage.from_depth} m -{" "}
                    {selectedCoreImage.to_depth} m
                  </span>
                </button>
              )}

              <form
                className="edit-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  saveInterval.mutate({
                    lithology_code: String(form.get("lithology_code")),
                    lithology_label: String(form.get("lithology_label")),
                    seam_name: String(form.get("seam_name") || ""),
                    remark: String(form.get("remark") || ""),
                  });
                }}
              >
                <label>
                  Lithology code
                  <input name="lithology_code" defaultValue={selectedInterval.lithology_code ?? ""} />
                </label>
                <label>
                  Lithology label
                  <input name="lithology_label" defaultValue={selectedInterval.lithology_label} />
                </label>
                <label>
                  Seam
                  <input name="seam_name" defaultValue={selectedInterval.seam_name ?? ""} />
                </label>
                <label>
                  Remarks
                  <textarea name="remark" defaultValue={selectedInterval.remark ?? ""} />
                </label>
                <button type="submit" disabled={saveInterval.isPending}>
                  {saveInterval.isPending ? "Saving..." : "Save correction"}
                </button>
              </form>
            </>
          )}
        </aside>
      </section>

      {selectedImage && (
        <div className="image-modal" role="dialog" aria-modal="true">
          <div className="image-modal-header">
            <strong>
              Corebox {selectedImage.box_number}: {selectedImage.from_depth} m -{" "}
              {selectedImage.to_depth} m
            </strong>
            <button type="button" onClick={() => setSelectedImage(null)}>
              Close
            </button>
          </div>
          <img src={selectedImage.url} alt={`Corebox ${selectedImage.box_number}`} />
        </div>
      )}
      {selectedRemarkGroup && (
        <div className="remark-modal" role="dialog" aria-modal="true">
          <div className="image-modal-header">
            <strong>{selectedRemarkGroup.label ?? "Remarks"}</strong>
            <button type="button" onClick={() => setSelectedRemarkGroup(null)}>
              Close
            </button>
          </div>
          <div className="remark-list">
            {selectedRemarkGroup.remarks.map((remark, index) => (
              <div key={`${remark.depth}:${remark.sourceRow}:${index}`} className="remark-item">
                <strong>
                  {remark.depth.toFixed(1)}m · source row {remark.sourceRow ?? "-"}
                </strong>
                <span>{remark.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
