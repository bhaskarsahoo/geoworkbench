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
import { DisplayEditorDialog } from "./workbench/display/DisplayEditorDialog";
import { DisplayRuntime } from "./workbench/display/DisplayRuntime";
import { useWorkbenchStore } from "./workbench/display/workbenchStore";

export function App() {
  const queryClient = useQueryClient();
  const [boreholeId, setBoreholeId] = useState<number | null>(null);
  const [displayEditorOpen, setDisplayEditorOpen] = useState(false);
  const { selectedInterval, setSelectedInterval, selectedImage, setSelectedImage } =
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
            className={displayEditorOpen ? "active" : ""}
            onClick={() => setDisplayEditorOpen(true)}
            type="button"
          >
            Edit display
          </button>
        </div>
      </header>

      {workbench.isLoading && <div className="empty">Loading borehole workbench...</div>}
      {workbench.error && <div className="empty">Could not load workbench.</div>}
      {workbench.data && (
        <DisplayRuntime
          data={workbench.data}
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
            })
          }
          onUploadSourceFile={(payload) => uploadFile.mutate(payload)}
          onProcessSourceFile={(sourceFileId) => processFile.mutate(sourceFileId)}
          onImportBoreholeFile={(sourceFileId) => importBoreholeFile.mutate(sourceFileId)}
          onSaveInterval={(patch) => saveInterval.mutate(patch)}
          onSelectImage={(image) => setSelectedImage(image)}
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
