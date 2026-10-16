import { test, expect } from "@playwright/test";

const courses = [
  ["IELTS", "/ielts"],
  ["HSK", "/hsk"],
  ["TOPIK", "/topik"],
] as const;
const publicRoutes = [...courses.map(([, path]) => path), "/help"];
const removedRoutes = [
  "/how-it-works",
  "/features",
  "/guides",
  "/guides/tao-the-tu-co-ngu-canh",
  "/guides/phan-biet-tu-va-loai-tu",
  "/guides/xay-thoi-quen-hoc-tu",
];

test("exam navigation opens separate pages and supports browser history", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const headings = new Set([await page.getByRole("heading", { level: 1 }).innerText()]);
  const navigation = page.getByRole("navigation", { name: "Điều hướng chính" });
  await expect(navigation.locator("a:not(.mobile-auth-link)")).toHaveText(
    courses.map(([label]) => label),
  );

  for (const [label, path] of courses) {
    await navigation.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    expect(new URL(page.url()).hash).toBe("");
    await expect(navigation.getByRole("link", { name: label, exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    headings.add(await heading.innerText());
  }
  expect(headings.size).toBe(4);

  await page.goBack();
  await expect(page).toHaveURL(/\/hsk$/);
  await expect(navigation.getByRole("link", { name: "HSK", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.locator("footer").locator('a[href="/help"]').first().click();
  await expect(page).toHaveURL(/\/help$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("mobile menu navigates, closes, and preserves the selected exam", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  await expect(page.getByRole("button", { name: "Đóng menu", exact: true })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  const navigation = page.getByRole("navigation", { name: "Điều hướng chính" });
  await expect(navigation.locator("a:not(.mobile-auth-link)")).toHaveText(
    courses.map(([label]) => label),
  );
  await navigation.getByRole("link", { name: "HSK", exact: true }).click();
  await expect(page).toHaveURL(/\/hsk$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mở menu", exact: true })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await page.getByRole("button", { name: "Mở menu", exact: true }).click();
  await expect(navigation.getByRole("link", { name: "HSK", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Mở menu", exact: true })).toBeFocused();
  await expect(page.getByRole("button", { name: "Mở menu", exact: true })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});

test("removed learning guides return 404 and the sitemap lists the exam pages", async ({
  request,
}) => {
  for (const path of removedRoutes) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
  }

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const paths = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(
    (match) => new URL(match[1]).pathname,
  );
  expect(paths).toEqual(expect.arrayContaining(["/", ...publicRoutes]));
  expect(paths.filter((path) => removedRoutes.some((removed) => path.startsWith(removed)))).toEqual(
    [],
  );
});

test("exam pages load directly at phone, tablet, and desktop widths without overflow", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of publicRoutes) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} at ${width}px`).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${path} overflows at ${width}px`,
      ).toBe(true);
      await page.screenshot({
        path: `.artifacts/screenshots/pages/${path.slice(1)}-${width}.png`,
        fullPage: true,
      });
    }
  }
});

test("TOPIK vocabulary search, flashcards, and quiz respond to learner input", async ({ page }) => {
  await page.goto("/topik");
  const search = page.getByRole("searchbox", { name: "Tìm từ vựng" });
  await search.fill("도서관");
  await expect(page.getByRole("button", { name: /^Xem nghĩa của / })).toHaveCount(1);
  const vocabulary = page.getByRole("tabpanel", { name: "Từ vựng", exact: true });
  await expect(vocabulary.locator("mark.learning-example-highlight")).toHaveText("도서관");
  await expect(vocabulary.getByText("Tôi đọc sách ở thư viện.", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Xem nghĩa của 도서관", exact: true }).click();
  await expect(
    page
      .getByRole("tabpanel", { name: "Từ vựng", exact: true })
      .getByText("thư viện", { exact: true }),
  ).toBeVisible();
  await expect(vocabulary.getByText("Tôi đọc sách ở thư viện.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xem từ 도서관", exact: true }).click();
  await search.fill("không có từ này");
  await expect(page.getByText("Không tìm thấy từ phù hợp.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Xem nghĩa của / })).toHaveCount(0);
  await search.fill("");
  expect(await page.getByRole("button", { name: /^Xem nghĩa của / }).count()).toBeGreaterThan(1);

  await page.getByRole("tab", { name: "Luyện tập", exact: true }).click();
  const practice = page.getByRole("tabpanel", { name: "Luyện tập", exact: true });
  await expect(
    practice.getByRole("heading", { name: "Chọn nghĩa đúng", exact: true }),
  ).toBeVisible();
  await expect(practice.getByText("안녕하세요", { exact: true })).toBeVisible();
  await practice.getByRole("button", { name: "thư viện", exact: true }).click();
  await expect(
    practice.getByText("Chưa đúng. Đáp án là: Xin chào.", { exact: true }),
  ).toBeVisible();
  await expect(practice.getByRole("button", { name: "Xin chào", exact: true })).toBeDisabled();
  await expect(practice.locator("mark.learning-example-highlight")).toHaveText("안녕하세요");
  await expect(practice.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
  await page.screenshot({
    path: ".artifacts/screenshots/pages/topik-practice.png",
    fullPage: true,
  });
  await practice.getByRole("button", { name: "Câu tiếp theo", exact: true }).click();
  await expect(practice.getByText("도서관", { exact: true })).toBeVisible();

  const remainingAnswers = ["thư viện", "cuộc hẹn", "chuẩn bị", "trải nghiệm", "môi trường"];
  for (const [index, answer] of remainingAnswers.entries()) {
    await practice.getByRole("button", { name: answer, exact: true }).click();
    await expect(practice.getByText("Chính xác!", { exact: true })).toBeVisible();
    await practice
      .getByRole("button", {
        name: index === remainingAnswers.length - 1 ? "Xem kết quả" : "Câu tiếp theo",
        exact: true,
      })
      .click();
  }
  await expect(
    practice.getByRole("heading", { name: "Bạn đã hoàn thành lượt luyện tập", exact: true }),
  ).toBeVisible();
  await expect(practice.getByText("5/6 câu đúng", { exact: true })).toBeVisible();
  await practice.getByRole("button", { name: "Luyện lại", exact: true }).click();
  await expect(practice.getByText("안녕하세요", { exact: true })).toBeVisible();
  await expect(practice.getByText("Câu 1 / 6", { exact: true })).toBeVisible();
  await expect(practice.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  await expect(practice.getByRole("button", { name: "Xin chào", exact: true })).toBeEnabled();
  await expect(practice.getByText("5/6 câu đúng", { exact: true })).toBeHidden();
});
