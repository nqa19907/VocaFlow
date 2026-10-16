import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  chooseVoice,
  resolveSpeechLocale,
  startPronunciation,
  stopPronunciation,
  type PronunciationState,
} from "@/lib/speech/browser";

function voice(lang: string, isDefault = false, name = lang): SpeechSynthesisVoice {
  return { lang, default: isDefault, localService: true, name, voiceURI: name };
}

// Browser-only test doubles. Production always uses the device's real speech service.
class TestUtterance {
  lang = "";
  rate = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  constructor(public text: string) {}
}

class TestSpeech {
  voices: SpeechSynthesisVoice[] = [];
  listeners = new Set<() => void>();
  utterances: TestUtterance[] = [];
  getVoices = vi.fn(() => this.voices);
  cancel = vi.fn();
  speak = vi.fn((utterance: TestUtterance) => this.utterances.push(utterance));
  addEventListener = vi.fn((_type: string, listener: () => void) => this.listeners.add(listener));
  removeEventListener = vi.fn((_type: string, listener: () => void) =>
    this.listeners.delete(listener),
  );
  voicesChanged() {
    [...this.listeners].forEach((listener) => listener());
  }
}

describe("compatible device voices", () => {
  it.each([
    ["en", "en-US"],
    ["en-GB", "en-GB"],
    ["ko", "ko-KR"],
    ["ko-KR", "ko-KR"],
    ["zh-Hans", "zh-CN"],
    ["zh_CN", "zh-CN"],
    ["vi", null],
  ])("resolves course locale %s", (locale, expected) => {
    expect(resolveSpeechLocale(locale)).toBe(expected);
  });

  it("prefers the requested English locale over an unrelated default voice", () => {
    const american = voice("en-US");
    expect(chooseVoice([voice("vi-VN", true), voice("en-GB", true), american], "en")).toBe(
      american,
    );
  });

  it("allows an English regional fallback but never a different language", () => {
    const british = voice("en-GB");
    expect(chooseVoice([voice("fr-FR"), british], "en")).toBe(british);
    expect(chooseVoice([voice("en-US", true)], "ko")).toBeNull();
    expect(chooseVoice([voice("en-US", true)], "zh-Hans")).toBeNull();
  });

  it("prioritizes Google UK English Male voice when available", () => {
    const usVoice = voice("en-US", true, "Microsoft David");
    const googleUk = voice("en-GB", false, "Google UK English Male");
    expect(chooseVoice([usVoice, googleUk], "en")).toBe(googleUk);
  });

  it("selects Korean instead of the device default", () => {
    const korean = voice("ko-KR");
    expect(chooseVoice([voice("en-US", true), korean], "ko")).toBe(korean);
  });

  it("prefers Mandarin CN, then SG, then TW and excludes Cantonese", () => {
    const cn = voice("zh-CN");
    const sg = voice("zh-SG");
    const tw = voice("zh-TW", true);
    const cantonese = [voice("zh-HK", true), voice("yue-HK"), voice("zh-MO")];
    expect(chooseVoice([...cantonese, tw, sg, cn], "zh-Hans")).toBe(cn);
    expect(chooseVoice([...cantonese, tw, sg], "zh-Hans")).toBe(sg);
    expect(chooseVoice([...cantonese, tw], "zh-Hans")).toBe(tw);
    expect(chooseVoice(cantonese, "zh-Hans")).toBeNull();
  });
});

describe("browser pronunciation lifecycle", () => {
  let speech: TestSpeech;
  let states: PronunciationState[];
  const recordState = (state: PronunciationState) => states.push(state);

  beforeEach(() => {
    vi.useFakeTimers();
    speech = new TestSpeech();
    states = [];
    vi.stubGlobal("window", {
      speechSynthesis: speech,
      SpeechSynthesisUtterance: TestUtterance,
    });
  });

  afterEach(() => {
    stopPronunciation();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("reports unsupported browsers without throwing or touching audio", () => {
    vi.stubGlobal("window", undefined);
    startPronunciation({ text: "hello", locale: "en", onState: recordState });
    expect(states.at(-1)).toEqual({
      status: "error",
      message: "Trình duyệt này chưa hỗ trợ phát âm. Hãy thử Chrome, Edge hoặc Safari.",
    });
    expect(speech.speak).not.toHaveBeenCalled();
    expect(() => stopPronunciation()).not.toThrow();
  });

  it("waits for asynchronous voices, speaks once and cleans up listeners and timers", () => {
    startPronunciation({ text: "안녕하세요", locale: "ko", onState: recordState });
    expect(states).toEqual([{ status: "loading" }]);
    expect(speech.speak).not.toHaveBeenCalled();
    speech.voices = [voice("ko-KR")];
    speech.voicesChanged();
    speech.voicesChanged();
    expect(speech.speak).toHaveBeenCalledTimes(1);
    expect(speech.listeners.size).toBe(0);
    const utterance = speech.utterances[0];
    expect(utterance.text).toBe("안녕하세요");
    expect(utterance.lang).toBe("ko-KR");
    expect(utterance.voice).toBe(speech.voices[0]);
    utterance.onstart?.();
    expect(states.at(-1)).toEqual({ status: "speaking" });
    utterance.onend?.();
    expect(states.at(-1)).toEqual({ status: "idle" });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("shows a missing-language error after a bounded wait instead of using English", () => {
    speech.voices = [voice("en-US", true)];
    startPronunciation({ text: "你好", locale: "zh-Hans", onState: recordState });
    vi.advanceTimersByTime(2_000);
    expect(states.at(-1)).toEqual({
      status: "error",
      message:
        "Thiết bị chưa có giọng đọc Tiếng Trung. Hãy cài thêm giọng đọc trong cài đặt thiết bị.",
    });
    expect(speech.speak).not.toHaveBeenCalled();
    expect(speech.listeners.size).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancels a pending voice request before another button can own the audio", () => {
    const old = startPronunciation({ text: "안녕하세요", locale: "ko", onState: recordState });
    const nextStates: PronunciationState[] = [];
    startPronunciation({ text: "hello", locale: "en", onState: (state) => nextStates.push(state) });
    expect(states.at(-1)).toEqual({ status: "idle" });
    expect(speech.listeners.size).toBe(1);
    old.cancel();
    speech.voices = [voice("en-US"), voice("ko-KR")];
    speech.voicesChanged();
    expect(speech.speak).toHaveBeenCalledTimes(1);
    expect(speech.utterances[0].text).toBe("hello");
    speech.utterances[0].onstart?.();
    expect(nextStates.at(-1)).toEqual({ status: "speaking" });
    expect(states.at(-1)).toEqual({ status: "idle" });
  });

  it("replaces active audio, resets its owner and ignores stale utterance events", () => {
    speech.voices = [voice("en-US")];
    const first = startPronunciation({ text: "first", locale: "en", onState: recordState });
    const oldUtterance = speech.utterances[0];
    oldUtterance.onstart?.();
    const lateError = oldUtterance.onerror;
    const nextStates: PronunciationState[] = [];
    startPronunciation({
      text: "second",
      locale: "en",
      onState: (state) => nextStates.push(state),
    });
    expect(states.at(-1)).toEqual({ status: "idle" });
    expect(oldUtterance.onerror).toBeNull();
    lateError?.({ error: "interrupted" });
    first.cancel();
    expect(nextStates).toEqual([{ status: "loading" }]);
    speech.utterances[1].onstart?.();
    expect(nextStates.at(-1)).toEqual({ status: "speaking" });
  });

  it("cancels owned pending work during component cleanup", () => {
    const handle = startPronunciation({ text: "hello", locale: "en", onState: recordState });
    handle.cancel();
    speech.voices = [voice("en-US")];
    speech.voicesChanged();
    vi.runAllTimers();
    expect(states).toEqual([{ status: "loading" }, { status: "idle" }]);
    expect(speech.listeners.size).toBe(0);
    expect(speech.speak).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops current audio and resets its owner on mode changes", () => {
    speech.voices = [voice("en-US")];
    startPronunciation({ text: "hello", locale: "en", onState: recordState });
    speech.utterances[0].onstart?.();
    stopPronunciation();
    expect(states.at(-1)).toEqual({ status: "idle" });
    expect(speech.utterances[0].onend).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    ["not-allowed", "Trình duyệt chưa cho phép phát âm."],
    ["audio-busy", "Không thể phát âm thanh."],
    ["audio-hardware", "Không thể phát âm thanh."],
    ["network", "Không tải được giọng đọc."],
    ["synthesis-failed", "Không thể phát âm lúc này."],
  ])("surfaces %s errors and releases the audio session", (error, message) => {
    speech.voices = [voice("en-US")];
    startPronunciation({ text: "hello", locale: "en", onState: recordState });
    speech.utterances[0].onerror?.({ error });
    expect(states.at(-1)?.status).toBe("error");
    expect(states.at(-1)?.message).toContain(message);
    expect(vi.getTimerCount()).toBe(0);
    expect(speech.utterances[0].onerror).toBeNull();
  });

  it("reports stalled audio service startup rather than staying pressed forever", () => {
    speech.voices = [voice("en-US")];
    startPronunciation({ text: "hello", locale: "en", onState: recordState });
    vi.advanceTimersByTime(10_000);
    expect(states.at(-1)).toEqual({
      status: "error",
      message: "Không thể phát âm lúc này. Vui lòng thử lại.",
    });
    expect(vi.getTimerCount()).toBe(0);
  });
});
