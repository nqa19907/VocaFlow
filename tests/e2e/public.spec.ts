import { test, expect } from "@playwright/test";

test("multilingual landing flashcard switches language, flips, and links to registration", async ({
  page,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Một nền tảng.");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Nhiều ngôn ngữ.");
  const korean = page.getByRole("button", { name: "Tiếng Hàn", exact: true });
  const english = page.getByRole("button", { name: "Tiếng Anh", exact: true });
  const chinese = page.getByRole("button", { name: "Tiếng Trung", exact: true });
  const sampleCard = page.locator(".sample-card");
  await expect(korean).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "안녕하세요", exact: true })).toBeVisible();
  await expect(sampleCard.locator("mark.learning-example-highlight")).toHaveText("안녕하세요");
  await expect(sampleCard.getByText("Xin chào, tôi là Minsu.", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Lật thẻ để khám phá" }).click();
  await expect(page.getByText("Xin chào", { exact: true })).toBeVisible();
  await expect(sampleCard.getByText("Xin chào, tôi là Minsu.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xem mặt trước" }).click();
  await expect(page.getByRole("heading", { name: "안녕하세요", exact: true })).toBeVisible();
  await english.click();
  await expect(english).toHaveAttribute("aria-pressed", "true");
  await expect(korean).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("heading", { name: "environment", exact: true })).toBeVisible();
  await expect(page.locator(".sample-reading .word-reading-text")).toHaveText(/^\/.+\/$/);
  await expect(sampleCard.locator("mark.learning-example-highlight")).toHaveText("environment");
  await page.getByRole("button", { name: "Lật thẻ để khám phá" }).click();
  await expect(
    sampleCard.getByText("Những thay đổi nhỏ có thể giúp bảo vệ môi trường.", { exact: true }),
  ).toBeVisible();
  await chinese.click();
  await expect(chinese).toHaveAttribute("aria-pressed", "true");
  await expect(english).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("heading", { name: "你好", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Lật thẻ để khám phá" })).toBeVisible();
  await page.getByRole("link", { name: "Bắt đầu miễn phí", exact: false }).first().click();
  await expect(page).toHaveURL(/\/auth\/sign-up/);
  await expect(page.getByLabel("Tên của bạn")).toBeVisible();
  await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
  expect(failures).toEqual([]);
});

test("private routes and APIs do not leak data without a session", async ({ page, request }) => {
  const health = await (await request.get("/api/health")).json();
  await page.goto("/app/vocabulary");
  await expect(page).toHaveURL(health.supabase === "configured" ? /\/auth\/login/ : /\/setup/);
  for (const path of ["/api/vocabulary", "/api/vocabulary/10000000-0000-4000-8000-000000000001"]) {
    const response = await request.get(path);
    expect(response.status()).toBe(health.supabase === "configured" ? 401 : 503);
    const body = await response.json();
    expect(body).toHaveProperty("error.code");
    expect(body).not.toHaveProperty("data");
  }
  const mutate = await request.post("/api/vocabulary", { data: { word: "stolen" } });
  expect(mutate.status()).toBe(health.supabase === "configured" ? 401 : 503);
});

for (const width of [375, 768, 1440, 1920]) {
  test(`public pages are usable at ${width}px`, async ({ page, request }) => {
    const health = await (await request.get("/api/health")).json();
    await page.setViewportSize({ width, height: width === 1920 ? 1080 : 1000 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: `.artifacts/screenshots/landing-${width}.png`, fullPage: true });
    await page.goto("/auth/login");
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: `.artifacts/screenshots/login-${width}.png`, fullPage: true });
    await page.goto("/auth/sign-up");
    await expect(page.getByLabel("Tên của bạn")).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    const password = page.getByLabel("Mật khẩu", { exact: true });
    await expect(password).toBeVisible();
    const submit = page.getByRole("button", { name: "Tạo tài khoản miễn phí", exact: true });
    if (health.supabase !== "configured") {
      await expect(page.getByText("Tài khoản đang tạm đóng", { exact: true })).toBeVisible();
      await expect(page.getByLabel("Tên của bạn")).toBeDisabled();
      await expect(page.getByLabel("Email", { exact: true })).toBeDisabled();
      await expect(password).toBeDisabled();
      await expect(submit).toBeDisabled();
    }
    if (width === 375) {
      await page.getByRole("button", { name: "Hiện mật khẩu", exact: true }).click();
      await expect(password).toHaveAttribute("type", "text");
      await expect(page.getByRole("button", { name: "Ẩn mật khẩu", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await page.getByRole("button", { name: "Ẩn mật khẩu", exact: true }).click();
      await expect(password).toHaveAttribute("type", "password");
    }
    if (width === 1920) await expect(submit).toBeInViewport();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: `.artifacts/screenshots/signup-${width}.png`, fullPage: true });
  });
}

test("unconfigured mode is transparent and does not simulate login", async ({ page, request }) => {
  const health = await (await request.get("/api/health")).json();
  test.skip(health.supabase === "configured", "Only applies before Supabase setup");
  await page.goto("/auth/login");
  await expect(page.getByText("Tài khoản đang tạm đóng", { exact: true })).toBeVisible();
  const setupMessage = page.getByText("Cần kết nối Supabase trước khi sử dụng tài khoản.", {
    exact: false,
  });
  await expect(setupMessage).toBeHidden();
  await page.getByText("Thông tin thiết lập", { exact: true }).click();
  await expect(
    page.getByText("Cần kết nối Supabase trước khi sử dụng tài khoản.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Đăng nhập", exact: true })).toBeDisabled();
  await page.getByRole("link", { name: "Hướng dẫn thiết lập" }).click();
  await expect(
    page.getByText("Không có tài khoản hoặc dữ liệu học giả.", { exact: false }),
  ).toBeVisible();
});
