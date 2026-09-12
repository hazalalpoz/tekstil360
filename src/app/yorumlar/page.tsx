import { Logo } from "@/components/Logo";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function PublicReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      fromUser: { select: { displayName: true, role: true } },
      toUser: {
        select: {
          displayName: true,
          role: true,
          workshopProfile: { select: { workshopName: true } },
          firmApplication: { select: { officialName: true } },
        },
      },
      jobRequest: { select: { category: true } },
    },
  });

  function displayName(
    u: (typeof reviews)[0]["toUser"],
  ) {
    if (u.workshopProfile?.workshopName) return u.workshopProfile.workshopName;
    if (u.firmApplication?.officialName) return u.firmApplication.officialName;
    return u.displayName;
  }

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-teal-700 hover:underline">
            Giriş
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Herkese açık değerlendirmeler</h1>
        <p className="mt-1 text-sm text-slate-600">
          Firmalar ve atölyeler tamamlanan işlerde birbirlerini puanlar.
        </p>
        <ul className="mt-8 space-y-4">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-lg text-amber-500">
                {"★".repeat(r.stars)}
                <span className="text-slate-300">{"☆".repeat(5 - r.stars)}</span>
              </p>
              <p className="mt-1 text-sm text-slate-800">
                <span className="font-medium">{r.fromUser.displayName}</span>
                {" → "}
                <span className="font-medium">{displayName(r.toUser)}</span>
              </p>
              {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
              <p className="mt-2 text-xs text-slate-400">
                {new Date(r.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </li>
          ))}
          {reviews.length === 0 && (
            <p className="text-sm text-slate-500">Henüz yorum yok.</p>
          )}
        </ul>
      </main>
    </div>
  );
}
