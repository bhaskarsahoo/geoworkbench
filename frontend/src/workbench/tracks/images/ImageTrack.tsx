import type { BoreholeWorkbench, DisplayTrack } from "../../../api/types";
import { useWorkbenchStore } from "../../display/workbenchStore";

type Props = {
  data: BoreholeWorkbench;
  track: DisplayTrack;
};

export function ImageTrack({ data, track }: Props) {
  const { setSelectedImage } = useWorkbenchStore();

  return (
    <div className="track image-track" style={{ width: track.width }}>
      <div className="track-title">{track.title}</div>
      {data.core_images
        .filter((image) => image.box_number % 5 === 0 || image.box_number === 1)
        .map((image) => (
          <button
            type="button"
            className="image-chip"
            key={image.box_number}
            style={{ top: `${(((image.from_depth ?? 0) / data.total_depth) * 100)}%` }}
            onClick={() => setSelectedImage(image)}
            title={`Open corebox ${image.box_number}`}
          >
            Box {image.box_number}
          </button>
        ))}
    </div>
  );
}

