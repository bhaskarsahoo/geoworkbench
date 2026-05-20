import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { getWorkbench, listBoreholes, updateInterval } from "./api/client";
import type { LithologyInterval } from "./api/types";
import { LogWidget } from "./workbench/widgets/LogWidget";
import { useWorkbenchStore } from "./workbench/display/workbenchStore";

export function App() {
  const queryClient = useQueryClient();
  const [boreholeId, setBoreholeId] = useState<number | null>(null);
  const { selectedInterval, setSelectedInterval, selectedImage, setSelectedImage, mode, setMode } =
    useWorkbenchStore();
  const { selectedRemarkGroup, setSelectedRemarkGroup } = useWorkbenchStore();

  const boreholes = useQuery({ queryKey: ["boreholes"], queryFn: listBoreholes });
  const activeId = boreholeId ?? boreholes.data?.[0]?.id;
  const workbench = useQuery({
    queryKey: ["workbench", activeId],
    queryFn: () => getWorkbench(activeId as number),
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

  const intervalsByCode = useMemo(() => {
    const counts = new Map<string, number>();
    for (const interval of workbench.data?.lithology_intervals ?? []) {
      counts.set(interval.lithology_code, (counts.get(interval.lithology_code) ?? 0) + 1);
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
                {item.project_code} / {item.site_code} / {item.code}
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
          <div className="settings-note">
            {mode === "edit"
              ? "Display edit mode will add drag/drop widgets, track visibility, curve scaling, and saved layout JSON."
              : "Runtime mode is for correction, AI review, image inspection, and export readiness."}
          </div>

          <h2>Lithology Counts</h2>
          <ul className="compact-list">
            {intervalsByCode.map(([code, count]) => (
              <li key={code}>
                <span>{code}</span>
                <b>{count}</b>
              </li>
            ))}
          </ul>
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
                  <input name="lithology_code" defaultValue={selectedInterval.lithology_code} />
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
