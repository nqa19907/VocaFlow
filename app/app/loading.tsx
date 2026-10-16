export default function Loading() {
  return (
    <div role="status" className="animate-pulse space-y-6">
      <span className="sr-only">Đang tải dữ liệu của bạn…</span>
      <div className="h-9 w-60 bg-[#eae5f4] rounded-lg" />
      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 bg-[#efebf6] rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-[#efebf6] rounded-2xl" />
    </div>
  );
}
