export type BoreholeListItem = {
  id: number;
  code: string;
  title: string;
  total_depth: number;
  site_code: string;
  project_code: string;
};

export type LithologyInterval = {
  id: string;
  source_row: number | null;
  from_depth: number;
  to_depth: number;
  lithology_code: string;
  lithology_label: string;
  display_color: string | null;
  logged_color: string | null;
  seam_name: string | null;
  recovery: number | null;
  recovery_percent: number | null;
  rqd: number | null;
  structural_features: string | null;
  remark: string | null;
  image_box: number | null;
  image_file: string | null;
};

export type SeamInterval = {
  id: string;
  name: string;
  from_depth: number;
  to_depth: number;
  thickness: number | null;
  lithology_code: string | null;
  lithology_label: string | null;
  image_box: number | null;
};

export type CurveSample = {
  depth: number;
  value: number;
};

export type Curve = {
  id: number;
  key: string;
  label: string;
  unit: string;
  source_type: string;
  color: string;
  samples: CurveSample[];
};

export type CoreImage = {
  box_number: number;
  name: string;
  file_path: string;
  from_depth: number | null;
  to_depth: number | null;
  url: string;
};

export type DisplayLayout = {
  id: number;
  name: string;
  mode: string;
  settings: {
    widgets?: {
      "log-widget"?: {
        tracks?: DisplayTrack[];
      };
    };
  };
};

export type DisplayTrack = {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  width: number;
  curves?: Array<{
    curveKey: string;
    label: string;
    unit: string;
    color: string;
    visible: boolean;
    scale: { mode: string; min: number; max: number };
  }>;
  valueField?: "recovery_percent" | "rqd";
  unit?: string;
  min?: number;
  max?: number;
  valueMultiplier?: number;
  color?: string;
};

export type BoreholeWorkbench = {
  id: number;
  code: string;
  title: string;
  state: string | null;
  total_depth: number;
  closure_note: string | null;
  source_workbook: string | null;
  source_sheet: string | null;
  lithology_intervals: LithologyInterval[];
  seam_intervals: SeamInterval[];
  curves: Curve[];
  core_images: CoreImage[];
  layout: DisplayLayout | null;
  validation_issues: unknown[];
};
