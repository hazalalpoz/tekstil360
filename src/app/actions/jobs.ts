"use server";

import { getCurrentUser, requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/uploads";
import { refreshUserRating } from "@/lib/reviews";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProductionStage } from "@prisma/client";

const validCategories = new Set(PRODUCT_CATEGORIES.map((c) => c.value));

export async function createJobAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  requireRole(user, ["FIRM"]);

  const category = String(formData.get("category") ?? "");
  const quantity = Number(formData.get("quantity"));
  const deadlineDays = Number(formData.get("deadlineDays"));
  const description = String(formData.get("description") ?? "").trim();
  const photo = formData.get("photo") as File | null;

  if (!validCategories.has(category as (typeof PRODUCT_CATEGORIES)[number]["value"])) {
    return { error: "Geçerli bir kategori seçin." };
  }
  if (!Number.isFinite(quantity) || quantity < 1) {
    return { error: "Adet en az 1 olmalıdır." };
  }
  if (!Number.isFinite(deadlineDays) || deadlineDays < 1) {
    return { error: "Temin süresi en az 1 gün olmalıdır." };
  }

  let photoPath: string | null = null;
  if (photo && photo.size > 0) {
    photoPath = await saveUpload(photo, "job-photos");
  }

  const job = await prisma.jobRequest.create({
    data: {
      firmId: user.id,
      category,
      quantity,
      deadlineDays,
      description: description || null,
      photoPath,
    },
  });

  redirect(`/panel/isler/${job.id}`);
}

export async function submitBidAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  requireRole(user, ["WORKSHOP"]);

  const jobRequestId = String(formData.get("jobRequestId") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  const job = await prisma.jobRequest.findUnique({ where: { id: jobRequestId } });
  if (!job || job.status !== "OPEN") {
    return { error: "Bu iş talebi artık açık değil." };
  }

  try {
    await prisma.jobBid.create({
      data: {
        jobRequestId,
        workshopId: user.id,
        message: message || null,
      },
    });
  } catch {
    return { error: "Bu işe zaten teklif gönderdiniz." };
  }

  redirect(`/panel/isler/${jobRequestId}`);
}

export async function acceptBidAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  requireRole(user, ["FIRM"]);

  const bidId = String(formData.get("bidId") ?? "");
  const bid = await prisma.jobBid.findUnique({
    where: { id: bidId },
    include: { jobRequest: true, workshop: { include: { workshopProfile: true } } },
  });

  if (!bid || bid.jobRequest.firmId !== user.id || bid.jobRequest.status !== "OPEN") {
    return { error: "Teklif kabul edilemedi." };
  }

  await prisma.$transaction([
    prisma.jobBid.update({
      where: { id: bidId },
      data: { status: "ACCEPTED" },
    }),
    prisma.jobBid.updateMany({
      where: {
        jobRequestId: bid.jobRequestId,
        id: { not: bidId },
      },
      data: { status: "REJECTED" },
    }),
    prisma.jobRequest.update({
      where: { id: bid.jobRequestId },
      data: {
        status: "ASSIGNED",
        assignedWorkshopId: bid.workshopId,
        productionStage: "SIPARIS_ALINDI",
      },
    }),
    prisma.message.create({
      data: {
        jobRequestId: bid.jobRequestId,
        senderId: user.id,
        body: `Tekstil360: ${bid.workshop.workshopProfile?.workshopName ?? bid.workshop.displayName} atölyesi ile canlı sohbet başlatıldı. Detayları buradan konuşabilirsiniz.`,
      },
    }),
  ]);

  redirect(`/panel/isler/${bid.jobRequestId}`);
}

export async function updateProductionStageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  requireRole(user, ["WORKSHOP"]);

  const jobId = String(formData.get("jobId") ?? "");
  const stage = String(formData.get("stage") ?? "") as ProductionStage;

  const job = await prisma.jobRequest.findUnique({ where: { id: jobId } });
  if (!job || job.assignedWorkshopId !== user.id) {
    return { error: "Yetkisiz." };
  }

  const status =
    stage === "TESLIME_HAZIR" ? "READY" : "IN_PRODUCTION";

  await prisma.jobRequest.update({
    where: { id: jobId },
    data: { productionStage: stage, status },
  });

  redirect(`/panel/isler/${jobId}`);
}

export async function confirmDeliveryAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  requireRole(user, ["FIRM"]);

  const jobId = String(formData.get("jobId") ?? "");
  const job = await prisma.jobRequest.findUnique({ where: { id: jobId } });
  if (!job || job.firmId !== user.id || job.status !== "READY") {
    return { error: "Teslim onaylanamadı." };
  }

  await prisma.jobRequest.update({
    where: { id: jobId },
    data: { status: "DELIVERED" },
  });

  redirect(`/panel/isler/${jobId}?review=1`);
}

export async function submitReviewAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const jobId = String(formData.get("jobId") ?? "");
  const toUserId = String(formData.get("toUserId") ?? "");
  const stars = Number(formData.get("stars"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return { error: "1–5 arası puan verin." };
  }

  const job = await prisma.jobRequest.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "DELIVERED" && job.status !== "COMPLETED") {
    return { error: "Bu iş için değerlendirme yapılamaz." };
  }

  const isFirm = user.id === job.firmId;
  const isWorkshop = user.id === job.assignedWorkshopId;
  if (!isFirm && !isWorkshop) return { error: "Yetkisiz." };

  const expectedTo = isFirm ? job.assignedWorkshopId : job.firmId;
  if (toUserId !== expectedTo) return { error: "Geçersiz alıcı." };

  try {
    await prisma.review.create({
      data: {
        jobRequestId: jobId,
        fromUserId: user.id,
        toUserId,
        stars,
        comment: comment || null,
      },
    });
  } catch {
    return { error: "Bu iş için zaten değerlendirme yaptınız." };
  }

  await refreshUserRating(toUserId);

  const reviews = await prisma.review.count({ where: { jobRequestId: jobId } });
  if (reviews >= 2) {
    await prisma.jobRequest.update({
      where: { id: jobId },
      data: { status: "COMPLETED" },
    });
  }

  redirect(`/panel/isler/${jobId}`);
}

export async function sendMessageAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const jobId = String(formData.get("jobId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Mesaj boş olamaz." };

  const job = await prisma.jobRequest.findUnique({ where: { id: jobId } });
  if (!job || job.status === "OPEN") {
    return { error: "Sohbet henüz aktif değil." };
  }

  const allowed =
    user.id === job.firmId || user.id === job.assignedWorkshopId || user.role === "ADMIN";
  if (!allowed) return { error: "Yetkisiz." };

  await prisma.message.create({
    data: { jobRequestId: jobId, senderId: user.id, body },
  });

  revalidatePath(`/panel/isler/${jobId}`);
  return { ok: true };
}
