import { expect, test, type Page } from "@playwright/test";

type VoiceFixture = { name: string; lang: string };
type SpokenUtterance = {
  text: string;
  lang: string;
  rate: number;
  pitch: number;
  voice: string | null;
  activeBefore: boolean;
};

declare global {
  interface Window {
    __speechTest: {
      spoken: SpokenUtterance[];
      cancellations: number;
      active: boolean;
      finish: () => void;
      fail: (error: string) => void;
      setVoices: (voices: VoiceFixture[]) => void;
    };
  }
}

const voices: VoiceFixture[] = [
  { name: "Test Korean", lang: "ko-KR" },
  { name: "Test English male", lang: "en-US" },
  { name: "Microsoft Jenny Online (Natural)", lang: "en-US" },
  { name: "Test Mandarin", lang: "zh-CN" },
];

// Browser speech is simulated only in this test harness: no OS voices or audio device required.
async function mockBrowserSpeech(page: Page, initialVoices = voices) {
  await page.addInitScript((initial) => {
    class TestUtterance extends EventTarget {
      text: string;
      lang = "";
      rate = 1;
      pitch = 1;
      voice: SpeechSynthesisVoice | null = null;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;

      constructor(text = "") {
        super();
        this.text = text;
      }
    }

    let available = initial;
    let current: TestUtterance | null = null;
    const state: Window["__speechTest"] = {
      spoken: [],
      cancellations: 0,
      active: false,
      finish() {
        const utterance = current;
        current = null;
        state.active = false;
        utterance?.onend?.();
      },
      fail(error) {
        const utterance = current;
        current = null;
        state.active = false;
        utterance?.onerror?.({ error });
      },
      setVoices(next) {
        available = next;
        synthesis.dispatchEvent(new Event("voiceschanged"));
      },
    };
    const synthesis = Object.assign(new EventTarget(), {
      getVoices: () =>
        available.map((voice, index) => ({
          ...voice,
          voiceURI: voice.name,
          default: index === 0,
          localService: true,
        })),
      cancel() {
        state.cancellations += 1;
        current = null;
        state.active = false;
      },
      speak(utterance: TestUtterance) {
        state.spoken.push({
          text: utterance.text,
          lang: utterance.lang,
          rate: utterance.rate,
          pitch: utterance.pitch,
          voice: utterance.voice?.name ?? null,
          activeBefore: current !== null,
        });
        current = utterance;
        state.active = true;
        queueMicrotask(() => {
          if (current === utterance) utterance.onstart?.();
        });
      },
      pause() {},
      resume() {},
    });
    Object.defineProperties(synthesis, {
      speaking: { get: () => current !== null },
      pending: { get: () => false },
      paused: { get: () => false },
    });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synthesis });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: TestUtterance,
    });
    window.__speechTest = state;
  }, initialVoices);
}

const samples = [
  { path: "/topik", term: "안녕하세요", lang: "ko-KR", voice: "Test Korean" },
  {
    path: "/ielts",
    term: "environment",
    lang: "en-US",
    voice: "Microsoft Jenny Online (Natural)",
  },
  { path: "/hsk", term: "你好", lang: "zh-CN", voice: "Test Mandarin" },
] as const;

for (const sample of samples) {
  test(`pronounces the native word in the correct language on ${sample.path}`, async ({ page }) => {
    await mockBrowserSpeech(page);
    await page.goto(sample.path);
    const panel = page.getByRole("tabpanel", { name: "Từ vựng", exact: true });
    const flip = panel.getByRole("button", {
      name: `Xem nghĩa của ${sample.term}`,
      exact: true,
    });
    const reading = flip.locator(".word-reading-text");
    await expect(reading).toBeVisible();
    const writtenReading = (await reading.innerText()).trim();
    expect(writtenReading.length).toBeGreaterThan(0);
    if (sample.lang === "en-US") expect(writtenReading).toMatch(/^\/.+\/$/);
    await panel.getByRole("button", { name: `Nghe phát âm: ${sample.term}`, exact: true }).click();
    const stop = panel.getByRole("button", {
      name: `Dừng phát âm: ${sample.term}`,
      exact: true,
    });
    await expect(stop).toHaveAttribute("aria-pressed", "true");
    await expect(flip).toHaveAttribute("aria-pressed", "false");
    const spoken = await page.evaluate(() => window.__speechTest.spoken);
    expect(spoken).toHaveLength(1);
    expect(spoken[0]).toMatchObject({
      text: sample.term,
      lang: sample.lang,
      voice: sample.voice,
      activeBefore: false,
    });
    expect(spoken[0].rate).toBeGreaterThan(0);
    expect(spoken[0].rate).toBeLessThanOrEqual(2);
    if (sample.lang === "en-US") {
      expect(spoken[0]).toMatchObject({ rate: 0.82, pitch: 1.04 });
    }

    await page.evaluate(() => window.__speechTest.finish());
    await expect(
      panel.getByRole("button", { name: `Nghe phát âm: ${sample.term}`, exact: true }),
    ).toHaveAttribute("aria-pressed", "false");
    await flip.click();
    const back = panel.getByRole("button", { name: `Xem từ ${sample.term}`, exact: true });
    await expect(back.locator(".word-reading-text")).toHaveText(writtenReading);
    await page.getByRole("tab", { name: "Luyện tập", exact: true }).click();
    await expect(
      page
        .getByRole("tabpanel", { name: "Luyện tập", exact: true })
        .locator(".quiz-reading .word-reading-text"),
    ).toHaveText(writtenReading);
  });
}

test("example playback replaces the word, can stop, and is cancelled on navigation", async ({
  page,
}) => {
  await mockBrowserSpeech(page);
  await page.goto("/topik");
  const word = "안녕하세요";
  const example = "안녕하세요, 저는 민수예요.";
  const wordPlay = page.getByRole("button", { name: `Nghe phát âm: ${word}`, exact: true });
  await wordPlay.click();
  await expect(
    page.getByRole("button", { name: `Dừng phát âm: ${word}`, exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const cancelBefore = await page.evaluate(() => window.__speechTest.cancellations);
  await page.getByRole("button", { name: `Nghe câu ví dụ: ${example}`, exact: true }).click();
  await expect(wordPlay).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("button", { name: `Dừng phát âm: ${example}`, exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.__speechTest.cancellations)).toBeGreaterThan(
    cancelBefore,
  );
  expect(await page.evaluate(() => window.__speechTest.spoken)).toEqual([
    expect.objectContaining({ text: word, lang: "ko-KR", activeBefore: false }),
    expect.objectContaining({ text: example, lang: "ko-KR", activeBefore: false }),
  ]);

  await page.getByRole("button", { name: `Dừng phát âm: ${example}`, exact: true }).click();
  expect(await page.evaluate(() => window.__speechTest.active)).toBe(false);
  await page.getByRole("button", { name: `Nghe câu ví dụ: ${example}`, exact: true }).click();
  const beforeNavigation = await page.evaluate(() => window.__speechTest.cancellations);
  await page
    .getByRole("navigation", { name: "Điều hướng chính" })
    .getByRole("link", { name: "IELTS", exact: true })
    .click();
  await expect(page).toHaveURL(/\/ielts$/);
  expect(await page.evaluate(() => window.__speechTest.active)).toBe(false);
  expect(await page.evaluate(() => window.__speechTest.cancellations)).toBeGreaterThan(
    beforeNavigation,
  );
});

test("waits for voices loaded after the first click", async ({ page }) => {
  await mockBrowserSpeech(page, []);
  await page.goto("/hsk");
  await page.getByRole("button", { name: "Nghe phát âm: 你好", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Dừng phát âm: 你好", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.__speechTest.spoken)).toHaveLength(0);
  await page.evaluate((available) => window.__speechTest.setVoices(available), voices);
  await expect
    .poll(() => page.evaluate(() => window.__speechTest.spoken))
    .toEqual([expect.objectContaining({ text: "你好", lang: "zh-CN", voice: "Test Mandarin" })]);
});

test("does not fall back to an unrelated language and offers a useful message", async ({
  page,
}) => {
  await mockBrowserSpeech(page, [{ name: "English only", lang: "en-US" }]);
  await page.goto("/topik");
  await page.getByRole("button", { name: "Nghe phát âm: 안녕하세요", exact: true }).click();
  await expect(
    page.getByText(
      "Thiết bị chưa có giọng đọc Tiếng Hàn. Hãy cài thêm giọng đọc trong cài đặt thiết bị.",
      { exact: true },
    ),
  ).toBeVisible();
  expect(await page.evaluate(() => window.__speechTest.spoken)).toHaveLength(0);
  await expect(
    page.getByRole("button", { name: "Nghe phát âm: 안녕하세요", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
});

test("recovers after a speech synthesis failure", async ({ page }) => {
  await mockBrowserSpeech(page);
  await page.goto("/ielts");
  const play = page.getByRole("button", { name: "Nghe phát âm: environment", exact: true });
  await play.click();
  await page.evaluate(() => window.__speechTest.fail("synthesis-failed"));
  await expect(
    page.getByText("Không thể phát âm lúc này. Vui lòng thử lại.", { exact: true }),
  ).toBeVisible();
  await expect(play).toHaveAttribute("aria-pressed", "false");
  await play.click();
  await expect(
    page.getByRole("button", { name: "Dừng phát âm: environment", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.__speechTest.spoken)).toHaveLength(2);
});

test("explains when browser speech synthesis is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: undefined });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto("/hsk");
  await page.getByRole("button", { name: "Nghe phát âm: 你好", exact: true }).click();
  await expect(
    page.getByText("Trình duyệt này chưa hỗ trợ phát âm. Hãy thử Chrome, Edge hoặc Safari.", {
      exact: true,
    }),
  ).toBeVisible();
});
