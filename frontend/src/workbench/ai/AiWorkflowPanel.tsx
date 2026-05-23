import type { AiSuggestion, BoreholeAiSummary } from "../../api/types";
import { useWorkbenchStore } from "../display/workbenchStore";

type Props = {
  summary: BoreholeAiSummary | undefined;
  provider: Record<string, unknown> | undefined;
  suggestions: AiSuggestion[];
  generating: boolean;
  acting: boolean;
  onGenerate: () => void;
  onAccept: (suggestionId: number) => void;
  onReject: (suggestionId: number) => void;
};

function confidenceLabel(value: number | null) {
  if (value === null) return "review";
  return `${Math.round(value * 100)}%`;
}

export function AiWorkflowPanel({
  summary,
  provider,
  suggestions,
  generating,
  acting,
  onGenerate,
  onAccept,
  onReject,
}: Props) {
  const openSuggestions = suggestions.filter((suggestion) => suggestion.status === "open");

  return (
    <div className="ai-panel">
      <button type="button" className="full-width-action" disabled={generating} onClick={onGenerate}>
        {generating ? "Generating suggestions..." : "Generate AI review"}
      </button>
      <div className="ai-summary">
        <strong>Assistant Summary</strong>
        {provider && (
          <small>
            Provider: {String(provider.provider)} · {String(provider.model)} ·{" "}
            {provider.reachable === false ? "offline" : provider.enabled ? "available" : "rules only"}
          </small>
        )}
        <p>{summary?.summary ?? "Run validation and generate suggestions to prepare an assistant review."}</p>
      </div>
      <div className="validation-summary">
        <span>{openSuggestions.length} open suggestions</span>
        <span>{suggestions.filter((item) => item.status === "accepted").length} accepted</span>
        <span>{suggestions.filter((item) => item.status === "rejected").length} rejected</span>
      </div>
      <div className="ai-suggestion-list">
        {suggestions.slice(0, 12).map((suggestion) => (
          <article key={suggestion.id} className={`ai-suggestion ${suggestion.status}`}>
            <button
              type="button"
              className="ai-suggestion-title"
              onClick={() => {
                if (suggestion.from_depth !== null) {
                  useWorkbenchStore.getState().setSelectedDepth(suggestion.from_depth);
                }
              }}
            >
              <strong>{suggestion.title}</strong>
              <span>{confidenceLabel(suggestion.confidence)}</span>
            </button>
            <p>{suggestion.recommended_action}</p>
            <small>
              {suggestion.from_depth !== null ? `${suggestion.from_depth.toFixed(2)}m` : "whole borehole"} ·{" "}
              {suggestion.provider} · {suggestion.status}
            </small>
            {suggestion.patch && (
              <code>{Object.entries(suggestion.patch).map(([key, value]) => `${key}: ${value}`).join(", ")}</code>
            )}
            {suggestion.status === "open" && (
              <div className="ai-suggestion-actions">
                <button
                  type="button"
                  disabled={acting || !suggestion.patch}
                  onClick={() => onAccept(suggestion.id)}
                >
                  Accept
                </button>
                <button type="button" disabled={acting} onClick={() => onReject(suggestion.id)}>
                  Reject
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
