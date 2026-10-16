"use client";
import { useActionState } from "react";
import { Save } from "lucide-react";
import { saveProfile, type AuthState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
export function ProfileForm({ name, timezone }: { name: string; timezone: string }) {
  const [state, action, pending] = useActionState(saveProfile, {} as AuthState);
  const options = Array.from(
    new Set([
      timezone,
      "Asia/Ho_Chi_Minh",
      "Asia/Bangkok",
      "Asia/Singapore",
      "Asia/Tokyo",
      "Europe/London",
      "America/New_York",
      "America/Los_Angeles",
      "Australia/Sydney",
      "UTC",
    ]),
  );
  return (
    <form action={action} className="space-y-5">
      <div className="field">
        <label htmlFor="display_name">Tên hiển thị</label>
        <input
          name="display_name"
          id="display_name"
          className="input"
          defaultValue={name}
          required
          maxLength={80}
          disabled={pending}
          autoComplete="name"
        />
      </div>
      <div className="field">
        <label htmlFor="timezone">Múi giờ học tập</label>
        <select
          className="input"
          name="timezone"
          id="timezone"
          defaultValue={timezone}
          disabled={pending}
        >
          {options.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-muted">
          Múi giờ được lưu để xác định ngày học khi tính năng ôn tập khả dụng.
        </p>
      </div>
      {state.error && (
        <div className="notice error" role="alert">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="notice success" role="status">
          {state.success}
        </div>
      )}
      <Button disabled={pending}>
        <Save size={15} />
        {pending ? "Đang lưu…" : "Lưu thông tin"}
      </Button>
    </form>
  );
}
