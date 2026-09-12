import Link from "next/link";
import { Logo } from "@/components/Logo";
import { WorkshopRegisterForm } from "@/components/WorkshopRegisterForm";

export default function WorkshopRegisterPage() {
  return (
    <div className="min-h-full bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
        <h1 className="mt-8 text-2xl font-semibold text-slate-900">Atölye kaydı</h1>
        <p className="mt-2 text-sm text-slate-600">
          İşçi ve makine kapasitenizi girerek açık iş taleplerine teklif verebilirsiniz.
        </p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <WorkshopRegisterForm />
        </div>
      </div>
    </div>
  );
}
