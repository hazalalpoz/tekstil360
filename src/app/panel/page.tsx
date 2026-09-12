import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

function categoryLabel(value: string) {
  return PRODUCT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export default async function PanelHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  if (user.role === "ADMIN") redirect("/panel/admin");

  if (user.role === "FIRM") {
    const jobs = await prisma.jobRequest.findMany({
      where: { firmId: user.id },
      orderBy: { createdAt: "desc" },
      include: { bids: true },
    });

    return (
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">İş taleplerim</h1>
            <p className="text-sm text-slate-600">Oluşturduğunuz talepler ve atölye teklifleri</p>
          </div>
          <Link
            href="/panel/yeni-is"
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            + Yeni iş talebi
          </Link>
        </div>
        <ul className="mt-8 space-y-3">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/panel/isler/${job.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-slate-900">
                    {categoryLabel(job.category)} · {job.quantity} adet
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    {job.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  Temin süresi: {job.deadlineDays} gün · {job.bids.length} teklif
                </p>
              </Link>
            </li>
          ))}
          {jobs.length === 0 && (
            <p className="text-sm text-slate-500">Henüz iş talebi yok. Yeni talep oluşturun.</p>
          )}
        </ul>
      </div>
    );
  }

  const openJobs = await prisma.jobRequest.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: {
      firm: { include: { firmApplication: true } },
      bids: { where: { workshopId: user.id } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Açık iş talepleri</h1>
      <p className="text-sm text-slate-600">
        Yetiştirebileceğiniz işlere teklif gönderin ({user.workshopProfile?.workshopName})
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {openJobs.map((job) => (
          <li key={job.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              {job.photoPath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.photoPath}
                  alt="Model"
                  className="h-20 w-20 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-500">
                  Model
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  {categoryLabel(job.category)} · {job.quantity} adet
                </p>
                <p className="text-sm text-slate-600">Süre: {job.deadlineDays} gün</p>
                <p className="truncate text-xs text-slate-500">
                  {job.firm.firmApplication?.officialName ?? job.firm.displayName}
                </p>
                <Link
                  href={`/panel/isler/${job.id}`}
                  className="mt-2 inline-block text-sm font-medium text-teal-700 hover:underline"
                >
                  {job.bids.length ? "Teklifiniz var — detay" : "Detay & teklif ver"}
                </Link>
              </div>
            </div>
          </li>
        ))}
        {openJobs.length === 0 && (
          <p className="text-sm text-slate-500">Şu an açık iş talebi yok.</p>
        )}
      </ul>
    </div>
  );
}
