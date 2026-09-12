import { LoginTabs } from "@/components/LoginTabs";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect("/panel");

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40">
      <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <p className="mt-4 text-sm text-slate-600">
            Sipariş ve üretim takibini tek çatı altında yönetin.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-900/5">
          <LoginTabs />
        </div>

        <p className="mt-6 text-center text-sm text-slate-600">
          Atölye misiniz?{" "}
          <Link href="/atolye-kayit" className="font-medium text-teal-700 hover:underline">
            Atölye kaydı oluşturun
          </Link>
        </p>

        <p className="mt-2 text-center text-xs text-slate-500">
          <Link href="/yorumlar" className="hover:text-teal-700">
            Herkese açık değerlendirmeler →
          </Link>
        </p>
      </div>
    </div>
  );
}
