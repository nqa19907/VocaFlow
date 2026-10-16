import Link from "next/link";
import { Layers2 } from "lucide-react";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand" aria-label="VocaFlow - Trang chủ">
      <span className="brand-mark">
        <Layers2 size={23} strokeWidth={2.3} />
      </span>
      {!compact && (
        <span>
          Voca<span className="text-primary">Flow</span>
          <span className="brand-dot">.</span>
        </span>
      )}
    </Link>
  );
}
