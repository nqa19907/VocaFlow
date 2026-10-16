import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { test, expect } from "@playwright/test";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = process.env.E2E_SUPABASE === "true" && Boolean(url && key);

test.skip(!enabled, "Requires an isolated Supabase project and E2E_SUPABASE=true; never mocked.");
test("real Supabase: login, manual CRUD, duplicate guard and logout", async ({ page }) => {
  const host = new URL(url!).hostname;
  if (!["localhost", "127.0.0.1"].includes(host) && process.env.E2E_ALLOW_REMOTE_TEST_DB !== "true")
    throw new Error("Use local Supabase or explicitly opt in to an isolated remote test project.");
  const admin = createClient(url!, key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = `vocaflow-e2e-${randomUUID()}@example.com`;
  const password = `VocaFlow-${randomUUID()}`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: "E2E Learner" },
  });
  if (error || !data.user) throw error || new Error("Unable to create test account");
  try {
    await page.goto("/auth/login");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Mật khẩu", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
    await expect(page).toHaveURL(/\/app$/);
    await page.getByRole("link", { name: "Thêm từ mới", exact: true }).last().click();
    await page.getByLabel("Từ tiếng Anh", { exact: false }).fill("hurricane");
    await page.getByLabel("Nghĩa tiếng Việt", { exact: false }).fill("bão nhiệt đới");
    await page.getByRole("button", { name: "Lưu vào thư viện" }).click();
    await expect(page.getByRole("link", { name: "hurricane", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "hurricane", exact: true }).click();
    await page.getByLabel("Nghĩa tiếng Việt", { exact: false }).fill("bão lớn");
    await page.getByRole("button", { name: "Lưu thay đổi" }).click();
    await expect(page.getByText("bão lớn", { exact: true })).toBeVisible();
    await page.goto("/app/vocabulary/new");
    await page.getByLabel("Từ tiếng Anh", { exact: false }).fill("HURRICANE");
    await page.getByLabel("Nghĩa tiếng Việt", { exact: false }).fill("bão");
    await page.getByRole("button", { name: "Lưu vào thư viện" }).click();
    await expect(page.getByRole("alert")).toContainText("đã có trong thư viện");
    await page.goto("/app/vocabulary");
    await page.getByRole("button", { name: "Xóa hurricane" }).click();
    await page.getByRole("button", { name: "Xóa từ", exact: true }).click();
    await expect(page.getByRole("link", { name: "hurricane", exact: true })).toHaveCount(0);
    await page.goto("/app/settings");
    await page.getByRole("button", { name: "Đăng xuất", exact: true }).last().click();
    await expect(page).toHaveURL(/\/auth\/login/);
  } finally {
    const deleted = await admin.auth.admin.deleteUser(data.user.id);
    if (deleted.error) throw deleted.error;
  }
});
