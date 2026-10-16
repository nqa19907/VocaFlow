"use client";
import { useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function DeleteWord({ id, word }: { id: string; word: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <>
      <button
        className="icon-button"
        aria-label={`Xóa ${word}`}
        onClick={() => {
          setError("");
          dialog.current?.showModal();
        }}
      >
        <Trash2 size={15} />
      </button>
      <dialog
        ref={dialog}
        className="dialog"
        aria-labelledby={`delete-${id}`}
        onCancel={(event) => {
          if (pending) event.preventDefault();
        }}
      >
        <h2 id={`delete-${id}`} className="text-lg font-semibold">
          Xóa “{word}”?
        </h2>
        <p className="text-xs text-muted leading-7 mt-3">
          Thẻ từ và lịch sử ôn liên quan sẽ được xóa vĩnh viễn. Bạn không thể hoàn tác thao tác này.
        </p>
        {error && (
          <div role="alert" className="notice error mt-3">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <Button className="secondary" disabled={pending} onClick={() => dialog.current?.close()}>
            Giữ lại
          </Button>
          <Button
            className="danger"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  const result = await fetch(`/api/vocabulary/${id}`, { method: "DELETE" });
                  if (!result.ok) {
                    const body = await result.json();
                    setError(body.error?.message || "Chưa thể xóa từ.");
                    return;
                  }
                  dialog.current?.close();
                  router.refresh();
                } catch {
                  setError("Không thể kết nối. Hãy thử lại.");
                }
              })
            }
          >
            {pending ? "Đang xóa…" : "Xóa từ"}
          </Button>
        </div>
      </dialog>
    </>
  );
}
