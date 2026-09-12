import { ensureAdmin } from "@/app/actions/auth";
import { approveFirmAction } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await ensureAdmin();

  const pending = await prisma.firmApplication.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Kurumsal başvurular</h1>
      <p className="text-sm text-slate-600">Onaylanan firmalar giriş yapabilir.</p>
      <ul className="mt-8 space-y-4">
        {pending.map((app) => (
          <li
            key={app.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="font-medium text-slate-900">{app.officialName}</p>
            <p className="text-sm text-slate-600">
              {app.user.email} · {app.companyType} · VKN/TCKN: {app.taxNumber}
            </p>
            <p className="text-sm text-slate-600">Vergi dairesi: {app.taxOffice}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              {app.taxPlatePath && (
                <a href={app.taxPlatePath} target="_blank" rel="noreferrer" className="text-teal-700 underline">
                  Vergi levhası
                </a>
              )}
              {app.signaturePath && (
                <a href={app.signaturePath} target="_blank" rel="noreferrer" className="text-teal-700 underline">
                  İmza beyanı
                </a>
              )}
              {app.tradeGazettePath && (
                <a href={app.tradeGazettePath} target="_blank" rel="noreferrer" className="text-teal-700 underline">
                  Ticaret gazetesi
                </a>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <form action={approveFirmAction}>
                <input type="hidden" name="applicationId" value={app.id} />
                <input type="hidden" name="decision" value="approve" />
                <Button type="submit" size="sm">
                  Onayla
                </Button>
              </form>
              <form action={approveFirmAction}>
                <input type="hidden" name="applicationId" value={app.id} />
                <input type="hidden" name="decision" value="reject" />
                <Button type="submit" size="sm" variant="danger">
                  Reddet
                </Button>
              </form>
            </div>
          </li>
        ))}
        {pending.length === 0 && (
          <p className="text-sm text-slate-500">Bekleyen başvuru yok.</p>
        )}
      </ul>
    </div>
  );
}
