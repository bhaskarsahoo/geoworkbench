import type { FormEvent, ReactNode } from "react";
import { useMemo } from "react";

import type {
  BoreholeAiSummary,
  BoreholeWorkbench,
  CoreImage,
  Curve,
  DisplayLayout,
  ExportJob,
  ExportReadiness,
  ImportProfile,
  LithologyInterval,
} from "../../api/types";
import { AiWorkflowPanel } from "../ai/AiWorkflowPanel";
import { ExportPanel } from "../exports/ExportPanel";
import { LogWidget } from "../widgets/LogWidget";
import { useWorkbenchStore } from "./workbenchStore";
import { normalizeDisplayLayout } from "./displayEditorModel";

type Props = {
  data: BoreholeWorkbench;
  aiSummary?: BoreholeAiSummary;
  aiProvider?: Record<string, unknown>;
  exportReadiness?: ExportReadiness;
  exportJobs?: ExportJob[];
  importProfiles?: ImportProfile[];
  selectedInterval: LithologyInterval | null;
  selectedCoreImage: CoreImage | null;
  validationRunning: boolean;
  aiGenerating: boolean;
  aiActing: boolean;
  exportCreating: boolean;
  exportApproving: boolean;
  sourceRegistering: boolean;
  sourceUploading: boolean;
  sourceProcessing: boolean;
  sourceImporting: boolean;
  intervalSaving: boolean;
  onRunValidation: () => void;
  onGenerateAi: () => void;
  onAcceptSuggestion: (suggestionId: number) => void;
  onRejectSuggestion: (suggestionId: number) => void;
  onCreateExport: (exportType: string) => void;
  onApproveExport: () => void;
  onRegisterSourceFile: (payload: { file_type: string; original_name: string }) => void;
  onUploadSourceFile: (payload: { file_type: string; file: File }) => void;
  onProcessSourceFile: (sourceFileId: number) => void;
  onImportBoreholeFile: (sourceFileId: number) => void;
  onSaveInterval: (patch: Partial<LithologyInterval>) => void;
  onSelectImage: (image: CoreImage) => void;
};

export function DisplayRuntime(props: Props) {
  const layout = useMemo(
    () => (props.data.layout ? normalizeDisplayLayout(props.data.layout as DisplayLayout, props.data.curves) : null),
    [props.data.curves, props.data.layout],
  );
  const grid = layout?.settings.grid;
  const widgets = layout?.settings.widgets ?? {};

  if (!grid) {
    return <div className="empty">No display grid is configured.</div>;
  }

  return (
    <section className="runtime-display">
      <div
        className="runtime-grid"
        style={{
          gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
          gridAutoRows: `${grid.rowHeight}px`,
        }}
      >
        {grid.items.map((item) => {
          const widget = widgets[item.widgetId];
          if (!widget) return null;
          return (
            <section
              key={item.widgetId}
              className={`runtime-widget runtime-widget-${widget.type}`}
              style={{
                gridColumn: `${item.x + 1} / span ${item.w}`,
                gridRow: `${item.y + 1} / span ${item.h}`,
              }}
            >
              {renderWidget(item.widgetId, widget, props)}
            </section>
          );
        })}
      </div>
    </section>
  );
}

function renderWidget(widgetId: string, widget: NonNullable<DisplayLayout["settings"]["widgets"]>[string], props: Props) {
  if (widget.type === "singleValue") {
    return <SingleValueWidget title={widget.title} metric={widget.metric ?? "total_depth"} data={props.data} />;
  }
  if (widget.type === "logWidget") {
    return <LogWidget data={withRuntimeLogWidget(props.data, widgetId, widget)} />;
  }
  if (widget.type === "validationPanel") {
    return <ValidationWidget {...props} />;
  }
  if (widget.type === "aiWorkflow") {
    return (
      <RuntimeWidgetFrame title={widget.title}>
        <AiWorkflowPanel
          summary={props.aiSummary}
          provider={props.aiProvider}
          suggestions={props.data.ai_suggestions}
          generating={props.aiGenerating}
          acting={props.aiActing}
          onGenerate={props.onGenerateAi}
          onAccept={props.onAcceptSuggestion}
          onReject={props.onRejectSuggestion}
        />
      </RuntimeWidgetFrame>
    );
  }
  if (widget.type === "exportPanel") {
    return (
      <RuntimeWidgetFrame title={widget.title}>
        <ExportPanel
          readiness={props.exportReadiness}
          jobs={props.exportJobs}
          creating={props.exportCreating}
          approving={props.exportApproving}
          onCreate={props.onCreateExport}
          onApprove={props.onApproveExport}
        />
      </RuntimeWidgetFrame>
    );
  }
  if (widget.type === "dataArrival") {
    return <DataArrivalWidget title={widget.title} {...props} />;
  }
  if (widget.type === "intervalDetails") {
    return <IntervalDetailsWidget title={widget.title} {...props} />;
  }
  return (
    <RuntimeWidgetFrame title={widget.title}>
      <div className="empty">No runtime renderer is registered for {widget.type}.</div>
    </RuntimeWidgetFrame>
  );
}

function RuntimeWidgetFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <div className="runtime-widget-header">
        <strong>{title}</strong>
      </div>
      <div className="runtime-widget-body">{children}</div>
    </>
  );
}

function SingleValueWidget({
  title,
  metric,
  data,
}: {
  title: string;
  metric: string;
  data: BoreholeWorkbench;
}) {
  const value = metricValue(metric, data);
  return (
    <div className="runtime-kpi">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ValidationWidget(props: Props) {
  const errors = props.data.validation_issues.filter((issue) => issue.severity === "error").length;
  const warnings = props.data.validation_issues.filter((issue) => issue.severity === "warning").length;
  const info = props.data.validation_issues.filter((issue) => issue.severity === "info").length;
  return (
    <RuntimeWidgetFrame title="Validation">
      <button
        type="button"
        className="full-width-action"
        disabled={props.validationRunning}
        onClick={props.onRunValidation}
      >
        {props.validationRunning ? "Running validation..." : "Run validation"}
      </button>
      <div className="validation-summary">
        <span>{errors} errors</span>
        <span>{warnings} warnings</span>
        <span>{info} info</span>
      </div>
      <div className="validation-list">
        {props.data.validation_issues.slice(0, 8).map((issue) => (
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
    </RuntimeWidgetFrame>
  );
}

function DataArrivalWidget({ title, ...props }: Props & { title: string }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fileType = String(form.get("file_type") || "excel");
    const file = form.get("file");
    if (file instanceof File && file.name) {
      props.onUploadSourceFile({ file_type: fileType, file });
      event.currentTarget.reset();
      return;
    }
    const fileName = String(form.get("original_name") || "").trim();
    if (fileName) {
      props.onRegisterSourceFile({ file_type: fileType, original_name: fileName });
    }
    event.currentTarget.reset();
  };

  return (
    <RuntimeWidgetFrame title={title}>
      <form className="source-file-form" onSubmit={submit}>
        <select name="file_type" defaultValue="excel">
          <option value="excel">Excel</option>
          <option value="las">LAS</option>
          <option value="images">Images</option>
          <option value="mobile_form">Mobile form</option>
        </select>
        <input name="file" type="file" />
        <input name="original_name" placeholder="or register filename" />
        <button type="submit" disabled={props.sourceRegistering || props.sourceUploading}>
          {props.sourceUploading ? "Uploading..." : "Add"}
        </button>
      </form>
      <div className="arrival-list runtime-arrival-list">
        {props.data.source_files.map((item) => (
          <div key={`source-file:${item.id}`} className="arrival-item">
            <strong>{item.file_type} file</strong>
            <span>{item.status}</span>
            <small>{item.original_name}</small>
            <button
              type="button"
              disabled={props.sourceProcessing || item.status === "parsed"}
              onClick={() => props.onProcessSourceFile(item.id)}
            >
              {item.status === "parsed" ? "Parsed" : "Process"}
            </button>
            {item.file_type === "excel" && (
              <button
                type="button"
                disabled={props.sourceImporting}
                onClick={() => props.onImportBoreholeFile(item.id)}
              >
                Import borehole
              </button>
            )}
          </div>
        ))}
        {props.data.source_imports.map((item) => (
          <div key={`import:${item.id}`} className="arrival-item">
            <strong>{item.import_type}</strong>
            <span>{item.status}</span>
            <small>{item.source_name}</small>
          </div>
        ))}
        {props.data.field_submissions.map((item) => (
          <div key={`submission:${item.id}`} className="arrival-item">
            <strong>{item.submission_type}</strong>
            <span>{item.status}</span>
            <small>{item.submitted_by ?? "field user"}</small>
          </div>
        ))}
        {props.importProfiles?.map((profile) => (
          <div key={`profile:${profile.id}`} className="arrival-item">
            <strong>{profile.name}</strong>
            <span>{profile.profile_type}</span>
            <small>{profile.description}</small>
          </div>
        ))}
      </div>
    </RuntimeWidgetFrame>
  );
}

function IntervalDetailsWidget({ title, ...props }: Props & { title: string }) {
  const interval = props.selectedInterval;
  const boreholeMetadata = buildBoreholeMetadata(props.data);
  return (
    <RuntimeWidgetFrame title={title}>
      {!interval && <div className="empty">Select an interval or curve point.</div>}
      {interval && (
        <>
          <div className="interval-card">
            <strong>
              {interval.from_depth} m - {interval.to_depth} m
            </strong>
            <span>
              {interval.lithology_code} · {interval.lithology_label}
            </span>
            <small>Source row {interval.source_row ?? "-"}</small>
          </div>
          <div className="field-grid">
            <MetadataField label="Thickness" value={`${(interval.to_depth - interval.from_depth).toFixed(2)} m`} />
            <MetadataField label="Logged color" value={interval.logged_color || "-"} />
            <MetadataField label="Seam" value={interval.seam_name || "-"} />
            <MetadataField
              label="Recovery"
              value={`${interval.recovery ?? "-"} m ${interval.recovery_percent ? `(${interval.recovery_percent}%)` : ""}`}
            />
            <MetadataField label="RQD" value={interval.rqd !== null ? `${Math.round(interval.rqd * 100)}%` : "-"} />
            <MetadataField label="Core box" value={props.selectedCoreImage ? `Box ${props.selectedCoreImage.box_number}` : "-"} />
            <MetadataField label="Features" value={interval.structural_features || "-"} full />
            <MetadataField label="Remarks" value={interval.remark || "-"} full />
            <MetadataField
              label="Source"
              value={`${props.data.source_workbook || "-"} · sheet ${props.data.source_sheet || "-"} · row ${interval.source_row ?? "-"}`}
              full
            />
          </div>
          {props.selectedCoreImage && (
            <button
              type="button"
              className="core-preview"
              onClick={() => props.onSelectImage(props.selectedCoreImage!)}
            >
              <img src={props.selectedCoreImage.url} alt={`Corebox ${props.selectedCoreImage.box_number}`} />
              <span>
                Corebox {props.selectedCoreImage.box_number} · {props.selectedCoreImage.from_depth} m -{" "}
                {props.selectedCoreImage.to_depth} m
              </span>
            </button>
          )}
          <details className="metadata-collapsible">
            <summary>Borehole metadata</summary>
            <div className="field-grid metadata-grid">
              {boreholeMetadata.map((item) => (
                <MetadataField key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </details>
          <form
            className="edit-form"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              props.onSaveInterval({
                lithology_code: String(form.get("lithology_code")),
                lithology_label: String(form.get("lithology_label")),
                seam_name: String(form.get("seam_name") || ""),
                remark: String(form.get("remark") || ""),
              });
            }}
          >
            <label>
              Lithology code
              <input name="lithology_code" defaultValue={interval.lithology_code ?? ""} />
            </label>
            <label>
              Lithology label
              <input name="lithology_label" defaultValue={interval.lithology_label} />
            </label>
            <label>
              Seam
              <input name="seam_name" defaultValue={interval.seam_name ?? ""} />
            </label>
            <label>
              Remarks
              <textarea name="remark" defaultValue={interval.remark ?? ""} />
            </label>
            <button type="submit" disabled={props.intervalSaving}>
              {props.intervalSaving ? "Saving..." : "Save correction"}
            </button>
          </form>
        </>
      )}
    </RuntimeWidgetFrame>
  );
}

function buildBoreholeMetadata(data: BoreholeWorkbench) {
  const excelImport = data.source_imports.find((item) => item.import_type === "excel");
  const metadata = (excelImport?.summary?.metadata ?? {}) as Record<string, unknown>;
  const sourceDepthText = Array.isArray(metadata.source_depth_text)
    ? metadata.source_depth_text
        .map((item) =>
          typeof item === "object" && item !== null && "text" in item
            ? String((item as { text?: unknown }).text ?? "")
            : "",
        )
        .filter(Boolean)
        .join(" | ")
    : "";

  return [
    { label: "Borehole", value: data.code || "-" },
    { label: "State", value: data.state || "-" },
    { label: "Block", value: String(metadata.block ?? data.source_sheet ?? "-") },
    { label: "Latitude", value: String(metadata.latitude ?? "-") },
    { label: "Departure", value: String(metadata.departure ?? "-") },
    { label: "Reduced level", value: String(metadata.reduced_level ?? metadata.rl ?? "-") },
    { label: "Water level", value: String(metadata.water_level ?? "-") },
    { label: "Total depth", value: `${data.total_depth} m` },
    { label: "Status/depth text", value: sourceDepthText || data.closure_note || "-" },
    { label: "Source workbook", value: data.source_workbook || "-" },
  ];
}

function MetadataField({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`field ${full ? "full" : ""}`}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

function metricValue(metric: string, data: BoreholeWorkbench) {
  if (metric === "interval_count") return String(data.lithology_intervals.length);
  if (metric === "curve_count") return String(data.curves.length);
  if (metric === "corebox_count") return String(data.core_images.length);
  if (metric === "total_depth") return `${data.total_depth} m`;
  return "-";
}

function withRuntimeLogWidget(
  data: BoreholeWorkbench,
  widgetId: string,
  widget: NonNullable<DisplayLayout["settings"]["widgets"]>[string],
): BoreholeWorkbench {
  if (widgetId === "log-widget") return data;
  if (!data.layout) return data;
  const layout = structuredClone(data.layout);
  layout.settings.widgets = { ...(layout.settings.widgets ?? {}), "log-widget": widget };
  return { ...data, layout };
}
