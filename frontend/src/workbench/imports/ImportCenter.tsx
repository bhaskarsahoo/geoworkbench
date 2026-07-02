import { useState, type FormEvent } from "react";

import type { BoreholeWorkbench, ImportProfile, SourceFile } from "../../api/types";

type Props = {
  data: BoreholeWorkbench;
  importProfiles?: ImportProfile[];
  registering: boolean;
  uploading: boolean;
  processing: boolean;
  importing: boolean;
  merging: boolean;
  onRegisterSourceFile: (payload: {
    file_type: string;
    original_name: string;
    storage_path?: string;
    file_metadata?: Record<string, unknown>;
  }) => void;
  onUploadSourceFile: (payload: { file_type: string; file: File }) => void;
  onProcessSourceFile: (sourceFileId: number) => void;
  onImportBoreholeFile: (sourceFileId: number) => void;
  onMergeSourceFile: (sourceFileId: number) => void;
  onOpenWorkbench: () => void;
};

const ARRIVAL_STEPS = [
  "Receive source",
  "Detect template",
  "Parse and preview",
  "Validate",
  "Merge",
  "Audit",
];

const TEMPLATE_CAPABILITIES = [
  "Excel lithology workbook mapping",
  "LAS curve import",
  "Mobile interval form contract",
  "Corebox image batch association",
  "PDF/geophysical export registration",
  "Conflict-aware merge policies",
];

const CANONICAL_FIELDS = [
  { group: "Borehole", fields: "project, site, code, title, total_depth, collar metadata" },
  { group: "Lithology intervals", fields: "from_depth, to_depth, lithology_code, label, color, remarks" },
  { group: "Seams", fields: "name, from_depth, to_depth, thickness, lithology context" },
  { group: "Quality", fields: "recovery, recovery_percent, rqd, structural_features" },
  { group: "Curves", fields: "curve key, unit, source_type, depth-indexed samples" },
  { group: "Core images", fields: "box number, depth range, original image, processed strip metadata" },
  { group: "Provenance", fields: "source file, import batch, parser summary, merge status" },
];

const DEMO_ARRIVALS = [
  {
    label: "New borehole Excel",
    file_type: "excel",
    original_name: "IMPORT-DEMO-01-CTSJ-template.xlsx",
    storage_path: "sample-data/import-demo/IMPORT-DEMO-01-CTSJ-template.xlsx",
    detail: "Creates a new borehole using the supported CTSJ Excel template.",
  },
  {
    label: "Corrected Excel merge",
    file_type: "excel",
    original_name: "IMPORT-DEMO-02-corrected-section.xlsx",
    storage_path: "sample-data/import-demo/IMPORT-DEMO-02-corrected-section.xlsx",
    detail: "Profiles a corrected interval workbook and demonstrates merge review.",
  },
  {
    label: "Curve CSV mapping",
    file_type: "csv",
    original_name: "IMPORT-DEMO-03-curve-samples.csv",
    storage_path: "sample-data/import-demo/IMPORT-DEMO-03-curve-samples.csv",
    detail: "Shows column preview and mapping-required flow for incoming tabular data.",
  },
];

export function ImportCenter({
  data,
  importProfiles,
  registering,
  uploading,
  processing,
  importing,
  merging,
  onRegisterSourceFile,
  onUploadSourceFile,
  onProcessSourceFile,
  onImportBoreholeFile,
  onMergeSourceFile,
  onOpenWorkbench,
}: Props) {
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [mappingDialogOpen, setMappingDialogOpen] = useState(false);
  const [templatePage, setTemplatePage] = useState(0);
  const selectedProfile =
    importProfiles?.find((profile) => profile.id === selectedProfileId) ?? importProfiles?.[0] ?? null;
  const templateCards = [
    ...(importProfiles ?? []).map((profile) => ({ type: "profile" as const, profile })),
    ...TEMPLATE_CAPABILITIES.map((capability) => ({ type: "planned" as const, capability })),
  ];
  const templatePageSize = 4;
  const templatePageCount = Math.max(1, Math.ceil(templateCards.length / templatePageSize));
  const safeTemplatePage = Math.min(templatePage, templatePageCount - 1);
  const visibleTemplateCards = templateCards.slice(
    safeTemplatePage * templatePageSize,
    safeTemplatePage * templatePageSize + templatePageSize,
  );
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fileType = String(form.get("file_type") || "excel");
    const file = form.get("file");
    if (file instanceof File && file.name) {
      onUploadSourceFile({ file_type: fileType, file });
      event.currentTarget.reset();
      return;
    }
    const fileName = String(form.get("original_name") || "").trim();
    if (fileName) {
      onRegisterSourceFile({ file_type: fileType, original_name: fileName });
      event.currentTarget.reset();
    }
  };

  return (
    <section className="workflow-center import-center">
      <div className="workflow-center-header">
        <div>
          <span>Import Center</span>
          <h1>{data.code} data arrivals</h1>
          <p>
            Bring mobile forms, Excel, LAS, PDFs, and corebox images into one controlled import
            pipeline before the geologist reviews the corrected log.
          </p>
        </div>
        <button type="button" onClick={onOpenWorkbench}>
          Open workbench
        </button>
      </div>

      <div className="workflow-flow">
        {ARRIVAL_STEPS.map((step, index) => (
          <div key={step} className="workflow-flow-step">
            <b>{index + 1}</b>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <div className="workflow-center-grid">
        <section className="workflow-panel primary">
          <div className="workflow-panel-header">
            <strong>New Arrival</strong>
            <span>{uploading ? "Uploading..." : registering ? "Registering..." : "Ready"}</span>
          </div>
          <form className="import-upload-form" onSubmit={submit}>
            <label>
              Source type
              <select name="file_type" defaultValue="excel">
                <option value="excel">Excel lithology workbook</option>
                <option value="las">LAS geophysical log</option>
                <option value="pdf">Geophysical PDF/export</option>
                <option value="images">Corebox image batch</option>
                <option value="mobile_form">Mobile interval form</option>
              </select>
            </label>
            <label>
              Upload file
              <input name="file" type="file" />
            </label>
            <label>
              Or register filename
              <input name="original_name" placeholder="e.g. CTSJ-02 P-27 COMPOSITE.las" />
            </label>
            <button type="submit" disabled={uploading || registering}>
              {uploading || registering ? "Adding source..." : "Add source arrival"}
            </button>
          </form>
          <div className="demo-arrival-actions">
            <strong>Demo arrivals</strong>
            {DEMO_ARRIVALS.map((item) => (
              <button
                key={item.storage_path}
                type="button"
                disabled={registering}
                title={item.detail}
                onClick={() =>
                  onRegisterSourceFile({
                    file_type: item.file_type,
                    original_name: item.original_name,
                    storage_path: item.storage_path,
                    file_metadata: {
                      registration_mode: "demo_fixture",
                      demo_detail: item.detail,
                    },
                  })
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="workflow-panel template-registry-panel">
          <div className="workflow-panel-header">
            <strong>Template Registry</strong>
            <span>
              {importProfiles?.length ?? 0} profiles · page {safeTemplatePage + 1}/{templatePageCount}
            </span>
            {templatePageCount > 1 && (
              <div className="workflow-panel-pager">
                <button
                  type="button"
                  disabled={safeTemplatePage === 0}
                  onClick={() => setTemplatePage(safeTemplatePage - 1)}
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={safeTemplatePage >= templatePageCount - 1}
                  onClick={() => setTemplatePage(safeTemplatePage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
          <div className="template-list">
            {visibleTemplateCards.map((item) =>
              item.type === "profile" ? (
                <button
                  type="button"
                  key={`profile:${item.profile.id}`}
                  className={`template-card ${selectedProfile?.id === item.profile.id ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedProfileId(item.profile.id);
                    setMappingDialogOpen(true);
                  }}
                >
                  <strong>{item.profile.name}</strong>
                  <span>{item.profile.profile_type.replaceAll("_", " ")}</span>
                  <small>{item.profile.description ?? "Mapping profile"}</small>
                </button>
              ) : (
                <article key={`planned:${item.capability}`} className="template-card planned">
                  <strong>{item.capability}</strong>
                  <span>Planned template capability</span>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="workflow-panel wide">
          <div className="workflow-panel-header">
            <strong>Source Queue</strong>
            <span>{data.source_files.length} files</span>
          </div>
          <div className="workflow-table">
            {data.source_files.map((item) => (
              <article key={item.id} className="workflow-row">
                <div>
                  <strong>{item.original_name}</strong>
                  <span>
                    {item.file_type} · {item.status}
                  </span>
                </div>
                <small>{sourceFileStatusText(item)}</small>
                <div className="workflow-row-actions">
                  <button
                    type="button"
                    disabled={processing || item.status === "parsed"}
                    onClick={() => onProcessSourceFile(item.id)}
                  >
                    {item.status === "parsed" ? "Parsed" : "Process"}
                  </button>
                  <button
                    type="button"
                    disabled={merging || ["merged", "mapping_required"].includes(item.status)}
                    onClick={() => onMergeSourceFile(item.id)}
                  >
                    {item.status === "merged" ? "Merged" : "Merge"}
                  </button>
                  {item.file_type === "excel" && (
                    <button type="button" disabled={importing} onClick={() => onImportBoreholeFile(item.id)}>
                      Import borehole
                    </button>
                  )}
                </div>
                <SourceFileDiagnostics item={item} />
              </article>
            ))}
            {!data.source_files.length && <div className="empty">No source files received for this borehole.</div>}
          </div>
        </section>

        <section className="workflow-panel">
          <div className="workflow-panel-header">
            <strong>Parsed Imports</strong>
            <span>{data.source_imports.length} batches</span>
          </div>
          <div className="workflow-mini-list">
            {data.source_imports.map((item) => (
              <article key={item.id}>
                <strong>{item.import_type.replaceAll("_", " ")}</strong>
                <span>{item.status}</span>
                <small>{item.source_name}</small>
              </article>
            ))}
            {!data.source_imports.length && <div className="empty">No parsed import batches yet.</div>}
          </div>
        </section>

        <section className="workflow-panel">
          <div className="workflow-panel-header">
            <strong>Mobile Submissions</strong>
            <span>{data.field_submissions.length} arrivals</span>
          </div>
          <div className="workflow-mini-list">
            {data.field_submissions.map((item) => (
              <article key={item.id}>
                <strong>{item.submission_type.replaceAll("_", " ")}</strong>
                <span>{item.status}</span>
                <small>{item.submitted_by ?? "field user"}</small>
              </article>
            ))}
            {!data.field_submissions.length && <div className="empty">No mobile submissions yet.</div>}
          </div>
        </section>
      </div>
      {mappingDialogOpen && selectedProfile && (
        <TemplateMappingDialog profile={selectedProfile} onClose={() => setMappingDialogOpen(false)} />
      )}
    </section>
  );
}

function TemplateMappingDialog({ profile, onClose }: { profile: ImportProfile; onClose: () => void }) {
  return (
    <div className="mapping-dialog-backdrop" role="dialog" aria-modal="true">
      <div className="mapping-dialog">
        <header>
          <div>
            <strong>{profile.name}</strong>
            <span>Source template mapping into canonical GeoWorkbench storage</span>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="mapping-dialog-body">
          <TemplateMappingPreview profile={profile} />
          <section className="template-mapping-preview">
            <div className="workflow-panel-header compact">
              <strong>Canonical GeoWorkbench Data Model</strong>
              <span>target storage after import/merge</span>
            </div>
            <div className="canonical-field-grid">
              {CANONICAL_FIELDS.map((item) => (
                <article key={item.group}>
                  <strong>{item.group}</strong>
                  <span>{item.fields}</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function TemplateMappingPreview({ profile }: { profile: ImportProfile }) {
  const mapping = profile.mapping ?? {};
  const lithology = typeof mapping.lithology === "object" && mapping.lithology !== null ? mapping.lithology : null;
  return (
    <div className="template-mapping-preview">
      <div className="workflow-panel-header compact">
        <strong>Mapping Preview</strong>
        <span>{String(mapping.template_key ?? mapping.status ?? profile.profile_type)}</span>
      </div>
      {lithology ? (
        <div className="mapping-grid">
          {Object.entries(lithology).map(([field, column]) => (
            <span key={field}>
              <b>{field.replaceAll("_", " ")}</b>
              <code>{String(column)}</code>
            </span>
          ))}
        </div>
      ) : (
        <pre>{JSON.stringify(mapping, null, 2)}</pre>
      )}
    </div>
  );
}

function SourceFileDiagnostics({ item }: { item: SourceFile }) {
  const parseSummary = item.file_metadata?.parse_summary as Record<string, unknown> | undefined;
  const mergeSummary = item.file_metadata?.merge_summary as Record<string, unknown> | undefined;
  const summary = mergeSummary ?? parseSummary;
  if (!summary) return null;
  return (
    <details className="source-diagnostics">
      <summary>{mergeSummary ? "Merge result" : "Parse preview"}</summary>
      <DiagnosticRows summary={summary} />
    </details>
  );
}

function DiagnosticRows({ summary }: { summary: Record<string, unknown> }) {
  const template = valueText(nestedValue(summary, ["template", "key"]));
  const parser = valueText(summary.parser ?? summary.merge_mode);
  const message = valueText(summary.message);
  const rowCount = valueText(nestedValue(summary, ["summary", "lithology_interval_count"]) ?? summary.row_count);
  const warnings = Array.isArray(summary.warnings) ? summary.warnings : [];
  return (
    <div className="diagnostic-grid">
      {parser && <span><b>Adapter</b>{parser}</span>}
      {template && <span><b>Template</b>{template}</span>}
      {rowCount && <span><b>Rows</b>{rowCount}</span>}
      {message && <span className="full"><b>Message</b>{message}</span>}
      {warnings.map((warning, index) => (
        <span key={`${warning}:${index}`} className="full warning"><b>Warning</b>{String(warning)}</span>
      ))}
    </div>
  );
}

function valueText(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function nestedValue(source: Record<string, unknown>, path: string[]) {
  let current: unknown = source;
  for (const item of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[item];
  }
  return current;
}

function sourceFileStatusText(item: SourceFile) {
  if (item.status === "mapping_required") return "column mapping required";
  if (item.status === "merge_pending_review") return "merge rules need review";
  if (item.status === "linked_pending_depth_mapping") return "depth mapping required";
  if (item.file_metadata?.parse_summary) return "profile available";
  return item.file_metadata ? "metadata captured" : "awaiting template metadata";
}
