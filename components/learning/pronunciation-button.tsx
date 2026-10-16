"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LoaderCircle, Square, Volume2 } from "lucide-react";
import {
  startPronunciation,
  type PronunciationHandle,
  type PronunciationState,
} from "@/lib/speech/browser";

type PronunciationButtonProps = {
  text: string;
  locale: string;
  label?: string;
  className?: string;
  rate?: number;
  pitch?: number;
};

const idleState: PronunciationState = { status: "idle" };

export function PronunciationButton({
  text,
  locale,
  label,
  className = "",
  rate = locale.toLowerCase().startsWith("en") ? 0.82 : 0.9,
  pitch = locale.toLowerCase().startsWith("en") ? 1.04 : 1,
}: PronunciationButtonProps) {
  const source = JSON.stringify([text, locale, rate, pitch]);
  const [state, setState] = useState<{ source: string; value: PronunciationState }>({
    source,
    value: idleState,
  });
  const handle = useRef<PronunciationHandle | null>(null);
  const mounted = useRef(false);
  const errorId = useId();
  const currentState = state.source === source ? state.value : idleState;
  const active = currentState.status === "loading" || currentState.status === "speaking";
  const accessibleLabel = active ? `Dừng phát âm: ${text}` : (label ?? `Nghe phát âm: ${text}`);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      handle.current?.cancel();
      handle.current = null;
    };
  }, [text, locale, rate, pitch]);

  function togglePronunciation() {
    if (active) {
      handle.current?.cancel();
      return;
    }
    handle.current = startPronunciation({
      text,
      locale,
      rate,
      pitch,
      onState: (value) => {
        if (mounted.current) setState({ source, value });
      },
    });
  }

  return (
    <span className={`pronunciation-control ${className}`.trim()}>
      <button
        type="button"
        className={`pronunciation-button${active ? ` is-${currentState.status}` : ""}`}
        onClick={togglePronunciation}
        aria-label={accessibleLabel}
        title={accessibleLabel}
        aria-pressed={active}
        aria-busy={currentState.status === "loading"}
        aria-describedby={currentState.message ? errorId : undefined}
        disabled={!text.trim()}
      >
        {currentState.status === "loading" ? (
          <LoaderCircle size={18} aria-hidden="true" />
        ) : currentState.status === "speaking" ? (
          <Square size={15} fill="currentColor" aria-hidden="true" />
        ) : (
          <Volume2 size={19} aria-hidden="true" />
        )}
      </button>
      {currentState.message && (
        <span className="pronunciation-error" id={errorId} role="status">
          {currentState.message}
        </span>
      )}
    </span>
  );
}
