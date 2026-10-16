import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const result = spawnSync("supabase", ["gen", "types", "typescript", "--local"], {
  encoding: "utf8",
});
if (result.error || result.status !== 0 || !result.stdout.includes("export type Database")) {
  console.error("Không tạo được types. Hãy cài Supabase CLI và chạy Supabase local trước.");
  if (result.stderr) process.stderr.write(result.stderr);
  process.exit(1);
}
// A failed CLI command must never truncate the currently working types.
writeFileSync(new URL("../lib/supabase/database.types.ts", import.meta.url), result.stdout);
console.log("Đã cập nhật lib/supabase/database.types.ts");
