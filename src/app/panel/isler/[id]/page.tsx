import {
  AcceptBidForm,
  ConfirmDeliveryForm,
  ProductionStageForm,
  SubmitBidForm,
} from "@/components/JobDetailActions";
import { LiveChat } from "@/components/LiveChat";
import { ReviewForm } from "@/components/ReviewForm";
import { getCurrentUser } from "@/lib/auth";
import { PRODUCT_CATEGORIES, PRODUCTION_STAGES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

function categoryLabel(value: string) {
  return PRODUCT_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const job = await prisma.jobRequest.findUnique({
    where: { id },
    include: {
      firm: { include: { firmApplication: true } },
      bids: {
        include: {
          workshop: { include: { workshopProfile: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { id: true, displayName: true } } },
      },
      reviews: {
        include: {
          fromUser: { select: { displayName: true } },
          toUser: { select: { displayName: true, id: true } },
        },
      },
    },
  });

  if (!job) notFound();

  const isFirm = user.id === job.firmId;
  const isWorkshop = user.id === job.assignedWorkshopId;
  const canViewOpenAsWorkshop = user.role === "WORKSHOP" && job.status === "OPEN";
  const allowed =
    user.role === "ADMIN" ||
    isFirm ||
    isWorkshop ||
    canViewOpenAsWorkshop;
  if (!allowed) notFound();

  const chatActive = job.status !== "OPEN";
  const assignedWorkshop = job.bids.find((b) => b.status === "ACCEPTED")?.workshop;

  const myReview = job.reviews.find((r) => r.fromUserId === user.id);
  const counterpartyId = isFirm ? job.assignedWorkshopId : isWorkshop ? job.firmId : null;
  const counterpartyName = isFirm
    ? assignedWorkshop?.workshopProfile?.workshopName ?? assignedWorkshop?.displayName
    : job.firm.firmApplication?.officialName ?? job.firm.displayName;

  const showReviewForm =
    (job.status === "DELIVERED" || job.status === "COMPLETED") &&
    counterpartyId &&
    !myReview &&
    (isFirm || isWorkshop);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <Link href="/panel" className="text-sm text-teal-700 hover:underline">
          ← Panele dön
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          {categoryLabel(job.category)} · {job.quantity} adet
        </h1>
        <p className="text-sm text-slate-600">
          Temin: {job.deadlineDays} gün · Durum: {job.status}
        </p>
        {job.description && (
          <p className="mt-3 text-sm text-slate-700">{job.description}</p>
        )}
        {job.photoPath && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.photoPath}
            alt="Model"
            className="mt-4 max-h-64 rounded-2xl object-cover shadow-sm"
          />
        )}

        {isFirm && job.status === "OPEN" && (
          <div className="mt-8">
            <h2 className="font-semibold text-slate-900">Atölye teklifleri</h2>
            <ul className="mt-3 space-y-3">
              {job.bids.map((bid) => (
                <li
                  key={bid.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <p className="font-medium">
                    {bid.workshop.workshopProfile?.workshopName ?? bid.workshop.displayName}
                  </p>
                  <p className="text-xs text-slate-500">
                    ★ {bid.workshop.workshopProfile?.avgRating.toFixed(1) ?? "0"} (
                    {bid.workshop.workshopProfile?.reviewCount ?? 0} yorum) ·{" "}
                    {bid.workshop.workshopProfile?.workerCount} işçi ·{" "}
                    {bid.workshop.workshopProfile?.machineCount} makine
                  </p>
                  {bid.message && (
                    <p className="mt-2 text-sm text-slate-600">{bid.message}</p>
                  )}
                  <AcceptBidForm bidId={bid.id} />
                </li>
              ))}
              {job.bids.length === 0 && (
                <p className="text-sm text-slate-500">Henüz teklif yok.</p>
              )}
            </ul>
          </div>
        )}

        {canViewOpenAsWorkshop && <SubmitBidForm jobRequestId={job.id} />}

        {isWorkshop && job.assignedWorkshopId === user.id && (
          <div className="mt-8">
            <h2 className="font-semibold text-slate-900">Üretim takibi</h2>
            <p className="text-sm text-slate-600">
              Güncel:{" "}
              {PRODUCTION_STAGES.find((s) => s.value === job.productionStage)?.label ??
                "—"}
            </p>
            <ProductionStageForm jobId={job.id} currentStage={job.productionStage} />
          </div>
        )}

        {isFirm && job.status === "READY" && <ConfirmDeliveryForm jobId={job.id} />}

        {showReviewForm && counterpartyId && counterpartyName && (
          <div className="mt-6">
            <ReviewForm jobId={job.id} toUserId={counterpartyId} toName={counterpartyName} />
          </div>
        )}

        {job.reviews.length > 0 && (
          <div className="mt-8">
            <h2 className="font-semibold text-slate-900">Değerlendirmeler</h2>
            <ul className="mt-2 space-y-2">
              {job.reviews.map((r) => (
                <li key={r.id} className="text-sm text-slate-700">
                  {"★".repeat(r.stars)}
                  {"☆".repeat(5 - r.stars)} — {r.fromUser.displayName} →{" "}
                  {r.toUser.displayName}
                  {r.comment && `: ${r.comment}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {sp.review === "1" && !showReviewForm && (
          <p className="mt-4 text-sm text-teal-700">
            Teslim alındı. Karşı tarafı değerlendirebilirsiniz.
          </p>
        )}
      </div>

      <div>
        <LiveChat
          jobId={job.id}
          currentUserId={user.id}
          disabled={!chatActive}
          initialMessages={job.messages.map((m) => ({
            ...m,
            createdAt: m.createdAt.toISOString(),
          }))}
        />
        {!chatActive && (
          <p className="mt-3 text-xs text-slate-500">
            Firma bir atölyeyi onayladığında sohbet otomatik başlar.
          </p>
        )}
      </div>
    </div>
  );
}
