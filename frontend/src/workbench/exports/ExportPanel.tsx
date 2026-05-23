import { exportDownloadUrl } from "../../api/client";
import type { ExportJob, ExportReadiness } from "../../api/types";

type Props = {
  readiness: ExportReadiness | undefined;
  jobs: ExportJob[] | undefined;
  creating: boolean;
  approving: boolean;
  onCreate: (exportType: string) => void;
  onApprove: () => void;
};

export function ExportPanel({ readiness, jobs, creating, approving, onCreate, onApprove }: Props) {
  return (
    <div className="export-panel">
      <div className={`export-status ${readiness?.ready ? "ready" : "blocked"}`}>
        <strong>{readiness?.ready ? "Ready for export" : "Review before export"}</strong>
        <span>{readiness?.status ?? "checking"}</span>
      </div>

      <div className="export-checks">
        {readiness?.checks.map((check) => (
          <div key={check.key} className={`export-check ${check.status}`}>
            <strong>{check.label}</strong>
            <span>{check.detail}</span>
          </div>
        ))}
      </div>

      <div className="export-actions">
        <button type="button" disabled={approving} onClick={onApprove}>
          {approving ? "Approving..." : "Approve"}
        </button>
        <button
          type="button"
          disabled={creating}
          onClick={() => onCreate("corrected_lithology_csv")}
        >
          Log CSV
        </button>
        <button
          type="button"
          disabled={creating}
          onClick={() => onCreate("corrected_lithology_xlsx")}
        >
          Log Excel
        </button>
        <button type="button" disabled={creating} onClick={() => onCreate("curves_csv")}>
          Curve CSV
        </button>
        <button type="button" disabled={creating} onClick={() => onCreate("curves_las")}>
          Curve LAS
        </button>
      </div>

      <div className="arrival-list">
        {jobs?.map((job) => (
          <div key={job.id} className="arrival-item">
            <strong>{job.export_type.replaceAll("_", " ")}</strong>
            <span>{job.status}</span>
            <small>{job.file_name}</small>
            <a className="download-link" href={exportDownloadUrl(job.id)}>
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
