"use server";

import { ensureAdmin } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function approveFirmAction(formData: FormData) {
  await ensureAdmin();
  const applicationId = String(formData.get("applicationId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  await prisma.firmApplication.update({
    where: { id: applicationId },
    data: {
      status: decision === "approve" ? "APPROVED" : "REJECTED",
    },
  });

  redirect("/panel/admin");
}
