import Link from "next/link";
import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { ProfileForm } from "@/components/auth/profile-form";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ password?: string; error?: string }>;
}) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (error || !data) throw new Error("PROFILE_NOT_AVAILABLE");
  const params = await searchParams;
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Tài khoản của bạn</h1>
          <p>Một vài thiết lập để không gian này phù hợp với bạn.</p>
        </div>
      </div>
      {params.error === "logout" && (
        <div className="notice error mb-5" role="alert">
          Chưa thể đăng xuất. Vui lòng thử lại khi kết nối ổn định.
        </div>
      )}
      {params.password === "updated" && (
        <div className="notice success mb-5" role="status">
          Đã cập nhật mật khẩu.
        </div>
      )}
      <div className="grid lg:grid-cols-2 gap-6">
        <section className="panel">
          <h2 className="text-base font-semibold mb-6">Hồ sơ học tập</h2>
          <ProfileForm name={data.display_name} timezone={data.timezone} />
        </section>
        <div className="space-y-6">
          <section className="panel">
            <h2 className="text-base font-semibold mb-5">Bảo mật và đăng nhập</h2>
            <span className="field-label">Email đăng nhập</span>
            <p className="text-sm text-muted mt-1 break-all">{user.email}</p>
            <div className="flex flex-wrap gap-3 mt-5">
              <Link className="button secondary" href="/auth/update-password">
                Đổi mật khẩu
              </Link>
              <form action={signOut}>
                <Button className="ghost">
                  <LogOut size={15} /> Đăng xuất
                </Button>
              </form>
            </div>
          </section>
          <section className="panel">
            <h2 className="text-base font-semibold mb-3">Quyền riêng tư</h2>
            <p className="text-xs text-muted leading-7">
              Thư viện từ vựng chỉ hiển thị trong tài khoản của bạn. Bạn có thể xóa từng thẻ ngay
              bây giờ. Chức năng xuất dữ liệu và xóa tài khoản chưa khả dụng, và sẽ được hoàn thiện
              trước khi phát hành chính thức.
            </p>
            <div className="flex gap-5 mt-4 text-xs text-primary">
              <Link href="/privacy">Quyền riêng tư</Link>
              <Link href="/terms">Điều khoản</Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
