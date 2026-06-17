import { useMemo, useState } from "react";

import { exportDownloadUrl } from "../../api/client";
import type { BoreholeWorkbench, ExportJob, ExportReadiness } from "../../api/types";

type Props = {
  data: BoreholeWorkbench;
  readiness?: ExportReadiness;
  jobs?: ExportJob[];
  creating: boolean;
  approving: boolean;
  onCreate: (exportType: string) => void;
  onApprove: () => void;
  onOpenWorkbench: () => void;
};

const EXPORT_FORMATS = [
  { value: "corrected_lithology_xlsx", label: "Corrected log Excel", target: "Review and handover" },
  { value: "corrected_lithology_csv", label: "Corrected log CSV", target: "Analytics or interchange" },
  { value: "curves_las", label: "Curve LAS", target: "Geophysical workflows" },
  { value: "curves_csv", label: "Curve CSV", target: "Curve QA and analytics" },
  { value: "minex_demo", label: "Minex-compatible preview", target: "Mining package handoff" },
];

const EXPORT_STEPS = ["Select scope", "Choose format", "Readiness checks", "Approve", "Generate", "Download"];

const EXPORT_MAPPINGS: Record<string, Array<{ source: string; target: string }>> = {
  corrected_lithology_xlsx: [
    { source: "boreholes.code, metadata", target: "Workbook header" },
    { source: "lithology_intervals.from_depth/to_depth", target: "Depth interval columns" },
    { source: "lithology_intervals.lithology_code/label", target: "Lithology columns" },
    { source: "seam_intervals.name/thickness", target: "Seam columns" },
    { source: "recovery, recovery_percent, rqd", target: "Quality columns" },
    { source: "remarks, structural_features", target: "Observation columns" },
  ],
  corrected_lithology_csv: [
    { source: "lithology_intervals", target: "One row per corrected interval" },
    { source: "seam_name, rqd, recovery", target: "Delimited columns" },
    { source: "source_row, source_workbook", target: "Provenance columns" },
  ],
  curves_las: [
    { source: "curves.key/unit", target: "LAS ~CURVE section" },
    { source: "curve_samples.depth", target: "DEPT index" },
    { source: "curve_samples.value", target: "LAS ~A sample columns" },
  ],
  curves_csv: [
    { source: "curves + curve_samples", target: "depth, curve_key, value, unit rows" },
    { source: "source_type", target: "curve provenance column" },
  ],
  minex_demo: [
    { source: "borehole metadata", target: "Minex-compatible header preview" },
    { source: "corrected lithology/seams", target: "Interval import section" },
    { source: "remarks/quality fields", target: "Optional mapped attributes" },
  ],
};

export function ExportCenter({
  data,
  readiness,
  jobs,
  creating,
  approving,
  onCreate,
  onApprove,
  onOpenWorkbench,
}: Props) {
  const [format, setFormat] = useState("corrected_lithology_xlsx");
  const [stage, setStage] = useState("central_corrected");
  const [fromDepth, setFromDepth] = useState("0");
  const [toDepth, setToDepth] = useState(String(data.total_depth));
  const [sections, setSections] = useState({
    lithology: true,
    seams: true,
    recovery: true,
    rqd: true,
    remarks: true,
    curves: true,
    core_images: false,
    ai_review: true,
    audit: false,
  });
  const selectedFormat = EXPORT_FORMATS.find((item) => item.value === format) ?? EXPORT_FORMATS[0];
  const exportType = format === "minex_demo" ? "corrected_lithology_xlsx" : format;
  const mappingRows = EXPORT_MAPPINGS[format] ?? EXPORT_MAPPINGS[exportType] ?? [];
  const includedSections = useMemo(
    () => Object.entries(sections).filter(([, enabled]) => enabled).map(([key]) => key),
    [sections],
  );
  const toggleSection = (key: keyof typeof sections) =>
    setSections((current) => ({ ...current, [key]: !current[key] }));

  return (
    <section className="workflow-center export-center">
      <div className="workflow-center-header">
        <div>
          <span>Export Center</span>
          <h1>{data.code} corrected log delivery</h1>
          <p>
            Configure exactly what leaves the system: corrected lithology, curves, remarks, review
            evidence, audit trail, and mining-software-friendly formats.
          </p>
        </div>
        <button type="button" onClick={onOpenWorkbench}>
          Open workbench
        </button>
      </div>

      <div className="workflow-flow">
        {EXPORT_STEPS.map((step, index) => (
          <div key={step} className="workflow-flow-step">
            <b>{index + 1}</b>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <div className="workflow-center-grid export-grid">
        <section className="workflow-panel primary">
          <div className="workflow-panel-header">
            <strong>Export Settings</strong>
            <span>{selectedFormat.target}</span>
          </div>
          <div className="export-settings large">
            <label>
              Format
              <select value={format} onChange={(event) => setFormat(event.target.value)}>
                {EXPORT_FORMATS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Correction stage
              <select value={stage} onChange={(event) => setStage(event.target.value)}>
                <option value="raw">Raw source</option>
                <option value="field_submitted">Field submitted</option>
                <option value="central_corrected">Central corrected draft</option>
                <option value="approved_final">Approved final</option>
              </select>
            </label>
            <div className="export-depth-range">
              <label>
                From depth
                <input value={fromDepth} onChange={(event) => setFromDepth(event.target.value)} />
              </label>
              <label>
                To depth
                <input value={toDepth} onChange={(event) => setToDepth(event.target.value)} />
              </label>
            </div>
            <div className="export-section-grid">
              {(Object.keys(sections) as Array<keyof typeof sections>).map((key) => (
                <label key={key}>
                  <input type="checkbox" checked={sections[key]} onChange={() => toggleSection(key)} />
                  {key.replaceAll("_", " ")}
                </label>
              ))}
            </div>
            <div className="export-preview-card">
              <strong>Configured package</strong>
              <span>
                {selectedFormat.label} · {stage.replaceAll("_", " ")} · {fromDepth || 0}-
                {toDepth || data.total_depth}m
              </span>
              <small>{includedSections.join(", ")}</small>
            </div>
          </div>
        </section>

        <section className="workflow-panel">
          <div className="workflow-panel-header">
            <strong>Readiness</strong>
            <span>{readiness?.ready ? "Ready" : "Needs review"}</span>
          </div>
          <div className={`export-status ${readiness?.ready ? "ready" : "blocked"}`}>
            <strong>{readiness?.ready ? "Ready for export" : "Review before export"}</strong>
            <span>{readiness?.status ?? "checking"}</span>
          </div>
          <div className="export-actions">
            <button type="button" disabled={approving} onClick={onApprove}>
              {approving ? "Approving..." : "Approve for export"}
            </button>
            <button type="button" disabled={creating} onClick={() => onCreate(exportType)}>
              {creating ? "Generating..." : "Generate export"}
            </button>
          </div>
        </section>

        <section className="workflow-panel wide">
          <div className="workflow-panel-header">
            <strong>Export Field Mapping</strong>
            <span>{selectedFormat.label}</span>
          </div>
          <div className="export-mapping-grid">
            {mappingRows.map((row) => (
              <article key={`${row.source}:${row.target}`}>
                <strong>{row.source}</strong>
                <span>{row.target}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="workflow-panel wide">
          <div className="workflow-panel-header">
            <strong>Readiness Checks</strong>
            <span>{readiness?.checks.length ?? 0} checks</span>
          </div>
          <div className="export-checks page-checks">
            {readiness?.checks.map((check) => (
              <div key={check.key} className={`export-check ${check.status}`}>
                <strong>{check.label}</strong>
                <span>{check.detail}</span>
              </div>
            ))}
            {!readiness?.checks.length && <div className="empty">No readiness checks available.</div>}
          </div>
        </section>

        <section className="workflow-panel wide">
          <div className="workflow-panel-header">
            <strong>Export History</strong>
            <span>{jobs?.length ?? 0} jobs</span>
          </div>
          <div className="workflow-table">
            {jobs?.map((job) => (
              <article key={job.id} className="workflow-row">
                <div>
                  <strong>{job.export_type.replaceAll("_", " ")}</strong>
                  <span>{job.file_name}</span>
                </div>
                <small>{job.status}</small>
                <div className="workflow-row-actions">
                  <a className="download-link" href={exportDownloadUrl(job.id)}>
                    Download
                  </a>
                </div>
              </article>
            ))}
            {!jobs?.length && <div className="empty">No exports generated yet.</div>}
          </div>
        </section>
      </div>
    </section>
  );
}
