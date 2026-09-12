import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PRODUCT_CATEGORIES, PRODUCTION_STAGES } from "@/lib/constants";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

function categoryLabel(value: string) {
  return PRODUCT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function stageLabel(value: string | null) {
  if (!value) return "—";
  return PRODUCTION_STAGES.find((s) => s.value === value)?.label ?? value;
}

export default async function MyJobsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "WORKSHOP") redirect("/panel");

  const jobs = await prisma.jobRequest.findMany({
    where: { assignedWorkshopId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">İşlerim</h1>
      <ul className="mt-6 space-y-3">
        {jobs.map((job) => (
          <li key={job.id}>
            <Link
              href={`/panel/isler/${job.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-teal-200"
            >
              <p className="font-medium">
                {categoryLabel(job.category)} · {job.quantity} adet
              </p>
              <p className="text-sm text-slate-600">Aşama: {stageLabel(job.productionStage)}</p>
            </Link>
          </li>
        ))}
        {jobs.length === 0 && (
          <p className="text-sm text-slate-500">Henüz atanmış işiniz yok.</p>
        )}
      </ul>
    </div>
  );
}
