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
  mergeSourceFileIntoBorehole,
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
import type { BoreholeListItem, DisplayLayout, LithologyInterval } from "./api/types";
import { CorrelationWorkspace } from "./workbench/correlation/CorrelationWorkspace";
import { DisplayEditorDialog } from "./workbench/display/DisplayEditorDialog";
import { DisplayRuntime } from "./workbench/display/DisplayRuntime";
import { useWorkbenchStore } from "./workbench/display/workbenchStore";
import { ExportCenter } from "./workbench/exports/ExportCenter";
import { ImportCenter } from "./workbench/imports/ImportCenter";

export function App() {
  const queryClient = useQueryClient();
  const [boreholeId, setBoreholeId] = useState<number | null>(null);
  const [view, setView] = useState<"landing" | "workbench" | "correlation" | "import" | "export">("landing");
  const [displayChoice, setDisplayChoice] = useState("saved");
  const [displayEditorOpen, setDisplayEditorOpen] = useState(false);
  const [mainMenuOpen, setMainMenuOpen] = useState(false);
  const { selectedInterval, setSelectedInterval, selectedImage, setSelectedImage } =
    useWorkbenchStore();
  const { selectedRemarkGroup, setSelectedRemarkGroup } = useWorkbenchStore();

  const boreholes = useQuery({ queryKey: ["boreholes"], queryFn: listBoreholes });
  const importProfiles = useQuery({ queryKey: ["importProfiles"], queryFn: listImportProfiles });
  const activeId = boreholeId ?? boreholes.data?.[0]?.id;
  const selectedBorehole = boreholes.data?.find((item) => item.id === activeId) ?? boreholes.data?.[0];
  const correlationIds = useMemo(() => (boreholes.data ?? []).slice(0, 5).map((item) => item.id), [boreholes.data]);
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
    mutationFn: (payload: {
      file_type: string;
      original_name: string;
      storage_path?: string;
      file_metadata?: Record<string, unknown>;
    }) =>
      createSourceFile({
        borehole_id: activeId ?? null,
        file_type: payload.file_type,
        original_name: payload.original_name,
        storage_path: payload.storage_path ?? `registered://${payload.original_name}`,
        file_metadata: payload.file_metadata ?? { registration_mode: "simulated" },
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
  const mergeSourceFile = useMutation({
    mutationFn: (sourceFileId: number) => mergeSourceFileIntoBorehole(sourceFileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workbench", activeId] });
      queryClient.invalidateQueries({ queryKey: ["boreholes"] });
    },
  });

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
  const runtimeWorkbenchData = useMemo(() => {
    if (!workbench.data || displayChoice !== "default") return workbench.data;
    return {
      ...workbench.data,
      layout: {
        id: workbench.data.layout?.id ?? 0,
        name: "Default Correction Display",
        mode: "runtime",
        settings: {},
      },
    };
  }, [displayChoice, workbench.data]);

  const openWorkbench = (id = activeId) => {
    if (id) {
      setBoreholeId(id);
      setView("workbench");
      setMainMenuOpen(false);
    }
  };

  const navigateTo = (nextView: typeof view) => {
    setView(nextView);
    setMainMenuOpen(false);
  };

  return (
    <main className={`app-shell ${view === "landing" ? "landing-shell" : ""}`}>
      <header className="topbar">
        <button type="button" className="brand-lockup" onClick={() => setView("landing")}>
          <img src="/branding/simpro-logo.png" alt="Simpro" />
          <span>
            <strong>GeoWorkbench</strong>
            <small>Borehole correction system</small>
          </span>
        </button>
        <div className="toolbar">
          <div className="main-menu-wrap">
            <button
              type="button"
              className={mainMenuOpen ? "active" : ""}
              onClick={() => setMainMenuOpen((open) => !open)}
            >
              Menu
            </button>
            {mainMenuOpen && (
              <div className="main-menu" role="menu">
                <button type="button" className={view === "landing" ? "active" : ""} onClick={() => navigateTo("landing")}>
                  Dashboard
                </button>
                <button type="button" className={view === "workbench" ? "active" : ""} disabled={!activeId} onClick={() => openWorkbench()}>
                  Workbench
                </button>
                <button
                  type="button"
                  className={view === "correlation" ? "active" : ""}
                  onClick={() => navigateTo("correlation")}
                  disabled={!correlationIds.length}
                >
                  Correlation
                </button>
                <button type="button" className={view === "import" ? "active" : ""} onClick={() => navigateTo("import")} disabled={!activeId}>
                  Import Center
                </button>
                <button type="button" className={view === "export" ? "active" : ""} onClick={() => navigateTo("export")} disabled={!activeId}>
                  Export Center
                </button>
                <button
                  type="button"
                  disabled={!activeId}
                  onClick={() => {
                    setDisplayEditorOpen(true);
                    setMainMenuOpen(false);
                  }}
                >
                  Manage Display
                </button>
              </div>
            )}
          </div>
          <select
            value={activeId ?? ""}
            onChange={(event) => {
              const nextId = Number(event.target.value);
              setBoreholeId(nextId);
            }}
          >
            {boreholes.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.project_code} / {item.site_code} / {item.code} · {item.workflow_status}
              </option>
            ))}
          </select>
          <select value={displayChoice} onChange={(event) => setDisplayChoice(event.target.value)}>
            <option value="saved">Saved borehole display</option>
            <option value="default">Default correction display</option>
          </select>
          <button
            type="button"
            onClick={() => openWorkbench()}
            disabled={!activeId}
          >
            Open workbench
          </button>
        </div>
      </header>

      {view === "landing" && (
        <LandingPage
          boreholes={boreholes.data ?? []}
          loading={boreholes.isLoading}
          activeId={selectedBorehole?.id ?? null}
          onSelect={(id) => setBoreholeId(id)}
          onOpen={(id) => openWorkbench(id)}
          onManageDisplay={(id) => {
            setBoreholeId(id);
            setDisplayEditorOpen(true);
          }}
        />
      )}

      {view === "correlation" && (
        <CorrelationWorkspace
          boreholes={boreholes.data ?? []}
          initialIds={correlationIds}
          onOpenWorkbench={(id) => {
            setBoreholeId(id);
            setView("workbench");
          }}
        />
      )}

      {view === "workbench" && workbench.isLoading && <div className="empty">Loading borehole workbench...</div>}
      {view === "workbench" && workbench.error && <div className="empty">Could not load workbench.</div>}
      {view === "workbench" && runtimeWorkbenchData && (
        <DisplayRuntime
          data={runtimeWorkbenchData}
          aiSummary={aiSummary.data}
          aiProvider={aiProvider.data}
          exportReadiness={exportReadiness.data}
          exportJobs={exportJobs.data}
          importProfiles={importProfiles.data}
          selectedInterval={selectedInterval}
          selectedCoreImage={selectedCoreImage}
          validationRunning={validateCurrent.isPending}
          aiGenerating={generateSuggestions.isPending}
          aiActing={acceptSuggestion.isPending || rejectSuggestion.isPending}
          exportCreating={createExport.isPending}
          exportApproving={approveExport.isPending}
          sourceRegistering={registerSourceFile.isPending}
          sourceUploading={uploadFile.isPending}
          sourceProcessing={processFile.isPending}
          sourceImporting={importBoreholeFile.isPending}
          sourceMerging={mergeSourceFile.isPending}
          intervalSaving={saveInterval.isPending}
          onRunValidation={() => validateCurrent.mutate()}
          onGenerateAi={() => generateSuggestions.mutate()}
          onAcceptSuggestion={(suggestionId) => acceptSuggestion.mutate(suggestionId)}
          onRejectSuggestion={(suggestionId) => rejectSuggestion.mutate(suggestionId)}
          onCreateExport={(exportType) => createExport.mutate(exportType)}
          onApproveExport={() => approveExport.mutate()}
          onRegisterSourceFile={(payload) =>
            registerSourceFile.mutate({
              file_type: payload.file_type,
              original_name: payload.original_name,
              storage_path: payload.storage_path,
              file_metadata: payload.file_metadata,
            })
          }
          onUploadSourceFile={(payload) => uploadFile.mutate(payload)}
          onProcessSourceFile={(sourceFileId) => processFile.mutate(sourceFileId)}
          onImportBoreholeFile={(sourceFileId) => importBoreholeFile.mutate(sourceFileId)}
          onMergeSourceFile={(sourceFileId) => mergeSourceFile.mutate(sourceFileId)}
          onSaveInterval={(patch) => saveInterval.mutate(patch)}
          onSelectImage={(image) => setSelectedImage(image)}
        />
      )}

      {view === "import" && workbench.isLoading && <div className="empty">Loading import center...</div>}
      {view === "import" && runtimeWorkbenchData && (
        <ImportCenter
          data={runtimeWorkbenchData}
          importProfiles={importProfiles.data}
          registering={registerSourceFile.isPending}
          uploading={uploadFile.isPending}
          processing={processFile.isPending}
          importing={importBoreholeFile.isPending}
          merging={mergeSourceFile.isPending}
          onRegisterSourceFile={(payload) =>
            registerSourceFile.mutate({
              file_type: payload.file_type,
              original_name: payload.original_name,
            })
          }
          onUploadSourceFile={(payload) => uploadFile.mutate(payload)}
          onProcessSourceFile={(sourceFileId) => processFile.mutate(sourceFileId)}
          onImportBoreholeFile={(sourceFileId) => importBoreholeFile.mutate(sourceFileId)}
          onMergeSourceFile={(sourceFileId) => mergeSourceFile.mutate(sourceFileId)}
          onOpenWorkbench={() => setView("workbench")}
        />
      )}

      {view === "export" && workbench.isLoading && <div className="empty">Loading export center...</div>}
      {view === "export" && runtimeWorkbenchData && (
        <ExportCenter
          data={runtimeWorkbenchData}
          readiness={exportReadiness.data}
          jobs={exportJobs.data}
          creating={createExport.isPending}
          approving={approveExport.isPending}
          onCreate={(exportType) => createExport.mutate(exportType)}
          onApprove={() => approveExport.mutate()}
          onOpenWorkbench={() => setView("workbench")}
        />
      )}

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
          <img src={selectedImage.original_url ?? selectedImage.url} alt={`Corebox ${selectedImage.box_number}`} />
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
      <DisplayEditorDialog
        open={displayEditorOpen}
        layout={workbench.data?.layout ?? null}
        availableCurves={workbench.data?.curves ?? []}
        saving={saveDisplayLayout.isPending}
        resetting={resetCurrentLayout.isPending}
        onSave={(layout) =>
          saveDisplayLayout.mutate(layout, {
            onSuccess: () => setDisplayEditorOpen(false),
          })
        }
        onReset={() => resetCurrentLayout.mutate()}
        onClose={() => setDisplayEditorOpen(false)}
      />
    </main>
  );
}

type LandingPageProps = {
  boreholes: BoreholeListItem[];
  loading: boolean;
  activeId: number | null;
  onSelect: (id: number) => void;
  onOpen: (id: number) => void;
  onManageDisplay: (id: number) => void;
};

function LandingPage({
  boreholes,
  loading,
  activeId,
  onSelect,
  onOpen,
  onManageDisplay,
}: LandingPageProps) {
  const active = boreholes.filter((item) => item.workflow_status !== "approved_for_export");
  const historic = boreholes.filter((item) => item.workflow_status === "approved_for_export");

  return (
    <section className="landing-page">
      <div className="landing-hero">
        <div className="landing-workflow-card">
          <div className="landing-workflow-title">
            <h1>Coal Borehole Review Workspace</h1>
            <p>From site capture to corrected log export, with the geologist in control.</p>
          </div>
          <div className="workflow-diagram" aria-label="GeoWorkbench workflow">
            <WorkflowStep title="Site Inputs" detail="Mobile forms, Excel, LAS/PDF, corebox images" />
            <WorkflowArrow />
            <WorkflowStep title="Import Templates" detail="Known workbook shapes, curve adapters, file storage" />
            <WorkflowArrow />
            <WorkflowStep title="Central Display" detail="Lithology, curves, corebox, remarks, metadata" />
            <WorkflowArrow />
            <WorkflowStep title="AI Review" detail="Validation, suggestions, evidence summaries" />
            <WorkflowArrow />
            <WorkflowStep title="Geologist Sign-off" detail="Override, comments, audit trail, export" />
          </div>
        </div>
        <div className="landing-settings">
          <div className="project-default-header">
            <strong>Project Defaults</strong>
            <button type="button" disabled title="Settings editor planned">
              Edit
            </button>
          </div>
          <div className="project-default-row">
            <span>Depth profile</span>
            <b>Metric depth, SI units</b>
          </div>
          <div className="project-default-row">
            <span>Timezone</span>
            <b>Project timezone</b>
          </div>
          <div className="project-default-row">
            <span>Review mode</span>
            <b>Central correction</b>
          </div>
          <div className="project-default-row">
            <span>Display source</span>
            <b>Top bar selection</b>
          </div>
          <small>Defaults can later be managed per project, site, or user role.</small>
        </div>
      </div>

      {loading && <div className="empty">Loading boreholes...</div>}
      {!loading && (
        <div className="borehole-groups">
          <BoreholeGroup
            title="Active Boreholes"
            boreholes={active}
            pageSize={3}
            activeId={activeId}
            onSelect={onSelect}
            onOpen={onOpen}
            onManageDisplay={onManageDisplay}
          />
          <BoreholeGroup
            title="Historic Boreholes"
            boreholes={historic}
            pageSize={4}
            activeId={activeId}
            onSelect={onSelect}
            onOpen={onOpen}
            onManageDisplay={onManageDisplay}
          />
        </div>
      )}
    </section>
  );
}

function WorkflowStep({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="workflow-step">
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function WorkflowArrow() {
  return <div className="workflow-arrow" aria-hidden="true">→</div>;
}

function BoreholeGroup({
  title,
  boreholes,
  pageSize,
  activeId,
  onSelect,
  onOpen,
  onManageDisplay,
}: {
  title: string;
  boreholes: BoreholeListItem[];
  pageSize: number;
  activeId: number | null;
  onSelect: (id: number) => void;
  onOpen: (id: number) => void;
  onManageDisplay: (id: number) => void;
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(boreholes.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const visibleBoreholes = boreholes.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <section className="borehole-group">
      <div className="borehole-group-header">
        <h2>{title}</h2>
        <div className="borehole-group-tools">
          <span>
            {boreholes.length} boreholes
            {pageCount > 1 ? ` · page ${safePage + 1}/${pageCount}` : ""}
          </span>
          {pageCount > 1 && (
            <span className="pager-buttons">
              <button type="button" disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                Prev
              </button>
              <button
                type="button"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
              >
                Next
              </button>
            </span>
          )}
        </div>
      </div>
      <div className="borehole-card-grid">
        {visibleBoreholes.map((item) => (
          <article
            key={item.id}
            className={`borehole-card ${item.id === activeId ? "selected" : ""}`}
            onClick={() => onSelect(item.id)}
            onDoubleClick={() => onOpen(item.id)}
            tabIndex={0}
          >
            <span>{item.project_code} / {item.site_code}</span>
            <strong>{item.code}</strong>
            <small>{item.title}</small>
            <div>
              <b>{item.total_depth} m</b>
              <em>{item.workflow_status.replaceAll("_", " ")}</em>
            </div>
            <footer>
              <span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(item.id);
                  }}
                >
                  Open
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onManageDisplay(item.id);
                  }}
                >
                  Manage Display
                </button>
              </span>
            </footer>
          </article>
        ))}
        {!boreholes.length && <div className="empty">No boreholes in this group.</div>}
      </div>
    </section>
  );
}
