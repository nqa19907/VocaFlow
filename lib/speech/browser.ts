export type PronunciationState = {
  status: "idle" | "loading" | "speaking" | "error";
  message?: string;
};

type PronunciationRequest = {
  text: string;
  locale: string;
  rate?: number;
  pitch?: number;
  onState: (state: PronunciationState) => void;
};

export type PronunciationHandle = { cancel: () => void };

const VOICE_WAIT_MS = 2_000;
const START_WAIT_MS = 10_000;
const LANGUAGE_NAMES: Record<string, string> = {
  en: "Tiếng Anh",
  ko: "Tiếng Hàn",
  zh: "Tiếng Trung",
};

const DEFAULT_ENGLISH_VOICE_NAME = "Google UK English Male";

function isEnglishVoice(voice: SpeechSynthesisVoice): boolean {
  return voice.lang.toLowerCase().replaceAll("_", "-").split("-")[0] === "en";
}

/** The courses use language tags; speech engines need a concrete spoken locale. */
export function resolveSpeechLocale(locale: string): string | null {
  const normalized = locale.toLowerCase().replaceAll("_", "-");
  if (normalized === "en" || normalized.startsWith("en-")) {
    return normalized === "en" ? "en-US" : locale.replaceAll("_", "-");
  }
  if (normalized === "ko" || normalized.startsWith("ko-")) return "ko-KR";
  if (
    normalized === "zh" ||
    normalized.startsWith("zh-") ||
    normalized === "cmn" ||
    normalized.startsWith("cmn-")
  ) {
    return "zh-CN";
  }
  return null;
}

/** Never let a device's unrelated default voice read the requested language. */
export function chooseVoice(
  voices: readonly SpeechSynthesisVoice[],
  locale: string,
): SpeechSynthesisVoice | null {
  const target = resolveSpeechLocale(locale)?.toLowerCase();
  if (!target) return null;
  const language = target.split("-")[0];

  // For English, always prefer the hardcoded default voice when available.
  if (language === "en") {
    const defaultVoice = voices.find(
      (voice) => isEnglishVoice(voice) && voice.name === DEFAULT_ENGLISH_VOICE_NAME,
    );
    if (defaultVoice) return defaultVoice;
  }

  const ranked = voices.flatMap((voice) => {
    const tag = voice.lang.toLowerCase().replaceAll("_", "-");
    const parts = tag.split("-");
    let rank: number;

    if (language === "zh") {
      // zh-HK / zh-MO commonly mean Cantonese; yue is explicitly Cantonese.
      if (!["zh", "cmn"].includes(parts[0]) || parts.includes("hk") || parts.includes("mo")) {
        return [];
      }
      if (parts.includes("cn")) rank = 0;
      else if (parts.includes("sg")) rank = 1;
      else if (parts.includes("tw")) rank = 2;
      else if (parts.length === 1 || parts.includes("hans") || parts.includes("hant")) rank = 3;
      else return [];
    } else {
      if (parts[0] !== language) return [];
      rank = tag === target ? 0 : 1;
    }

    const voiceRank = rank * 2 + (voice.default ? 0 : 1);
    return [{ voice, rank: voiceRank }];
  });
  ranked.sort((a, b) => a.rank - b.rank);
  return ranked[0]?.voice ?? null;
}

type Session = {
  speech: SpeechSynthesis;
  utterance: SpeechSynthesisUtterance | null;
  disposeWait: () => void;
  startTimer: ReturnType<typeof setTimeout> | null;
  disposed: boolean;
  onState: PronunciationRequest["onState"];
};

let currentSession: Session | null = null;

function finish(session: Session, state: PronunciationState, cancelAudio = false) {
  if (session.disposed) return;
  session.disposed = true;
  session.disposeWait();
  if (session.startTimer !== null) clearTimeout(session.startTimer);
  if (session.utterance) {
    session.utterance.onstart = null;
    session.utterance.onend = null;
    session.utterance.onerror = null;
  }
  if (currentSession === session) currentSession = null;
  if (cancelAudio) {
    try {
      session.speech.cancel();
    } catch {
      // A browser can tear down its audio service during navigation.
    }
  }
  session.onState(state);
}

/** Used when navigating between learning modes without unmounting their panels. */
export function stopPronunciation(): void {
  if (currentSession) finish(currentSession, { status: "idle" }, true);
}

function speechError(error: string): string {
  if (error === "not-allowed") {
    return "Trình duyệt chưa cho phép phát âm. Hãy nhấn lại nút nghe hoặc kiểm tra cài đặt âm thanh.";
  }
  if (error === "audio-busy" || error === "audio-hardware") {
    return "Không thể phát âm thanh. Hãy kiểm tra loa hoặc tai nghe rồi thử lại.";
  }
  if (error === "network") {
    return "Không tải được giọng đọc. Hãy kiểm tra kết nối mạng rồi thử lại.";
  }
  return "Không thể phát âm lúc này. Vui lòng thử lại.";
}

/** Only called from an explicit click; importing this module never touches the browser. */
export function startPronunciation({
  text,
  locale,
  rate = 0.9,
  pitch = 1,
  onState,
}: PronunciationRequest): PronunciationHandle {
  stopPronunciation();
  const emptyHandle = { cancel: () => {} };
  if (
    typeof window === "undefined" ||
    !window.speechSynthesis ||
    typeof window.SpeechSynthesisUtterance !== "function"
  ) {
    onState({
      status: "error",
      message: "Trình duyệt này chưa hỗ trợ phát âm. Hãy thử Chrome, Edge hoặc Safari.",
    });
    return emptyHandle;
  }
  const speechLocale = resolveSpeechLocale(locale);
  if (!speechLocale || !text.trim()) {
    onState({
      status: "error",
      message: !text.trim()
        ? "Không có nội dung để phát âm."
        : "Ngôn ngữ này chưa được hỗ trợ phát âm.",
    });
    return emptyHandle;
  }

  const speech = window.speechSynthesis;
  const session: Session = {
    speech,
    utterance: null,
    disposeWait: () => {},
    startTimer: null,
    disposed: false,
    onState,
  };
  currentSession = session;
  onState({ status: "loading" });

  const fail = (message: string) => finish(session, { status: "error", message }, true);
  const missingVoice = () => {
    const name = LANGUAGE_NAMES[speechLocale.split("-")[0]];
    fail(`Thiết bị chưa có giọng đọc ${name}. Hãy cài thêm giọng đọc trong cài đặt thiết bị.`);
  };

  const speak = (voice: SpeechSynthesisVoice) => {
    if (session.disposed) return;
    session.disposeWait();
    try {
      // Retain the utterance in the active session for browsers that otherwise collect it.
      const utterance = new window.SpeechSynthesisUtterance(text.trim());
      session.utterance = utterance;
      utterance.lang = voice.lang || speechLocale;
      utterance.voice = voice;
      utterance.rate = Number.isFinite(rate) ? Math.min(1.5, Math.max(0.5, rate)) : 0.9;
      utterance.pitch = Number.isFinite(pitch) ? Math.min(2, Math.max(0.5, pitch)) : 1;
      utterance.onstart = () => {
        if (session.disposed) return;
        if (session.startTimer !== null) clearTimeout(session.startTimer);
        session.startTimer = null;
        onState({ status: "speaking" });
      };
      utterance.onend = () => finish(session, { status: "idle" });
      utterance.onerror = (event) => {
        if (event.error === "canceled" || event.error === "interrupted") {
          finish(session, { status: "idle" });
        } else {
          fail(speechError(event.error));
        }
      };
      session.startTimer = setTimeout(() => fail(speechError("synthesis-failed")), START_WAIT_MS);
      speech.cancel();
      speech.speak(utterance);
    } catch {
      fail(speechError("synthesis-failed"));
    }
  };

  const findVoice = () => {
    try {
      return chooseVoice(speech.getVoices(), speechLocale);
    } catch {
      fail(speechError("synthesis-failed"));
      return null;
    }
  };
  const voice = findVoice();
  if (voice) {
    speak(voice);
  } else if (!session.disposed) {
    const onVoicesChanged = () => {
      if (session.disposed) return;
      const loadedVoice = findVoice();
      if (loadedVoice) speak(loadedVoice);
    };
    const timeout = setTimeout(missingVoice, VOICE_WAIT_MS);
    session.disposeWait = () => {
      clearTimeout(timeout);
      speech.removeEventListener("voiceschanged", onVoicesChanged);
    };
    speech.addEventListener("voiceschanged", onVoicesChanged);
    // Recheck after subscribing in case voices loaded between the initial read and listener.
    onVoicesChanged();
  }

  return { cancel: () => finish(session, { status: "idle" }, true) };
}
