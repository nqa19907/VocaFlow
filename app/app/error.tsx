"use client";
import { Button } from "@/components/ui/button";
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="panel empty-state">
      <h2>Chưa tải được dữ liệu</h2>
      <p>Hãy kiểm tra kết nối Supabase và database migration, sau đó thử lại.</p>
      <Button onClick={reset}>Thử lại</Button>
    </div>
  );
}
