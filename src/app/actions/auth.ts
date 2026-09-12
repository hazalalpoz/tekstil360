"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/uploads";
import { CompanyType, UserRole } from "@prisma/client";

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "E-posta veya şifre hatalı." };
  }

  if (user.role === UserRole.FIRM) {
    const app = await prisma.firmApplication.findUnique({
      where: { userId: user.id },
    });
    if (!app || app.status !== "APPROVED") {
      return {
        error:
          "Kurumsal başvurunuz henüz onaylanmadı. Onay sonrası giriş yapabilirsiniz.",
      };
    }
  }

  await createSession(user.id);
  redirect("/panel");
}

export async function registerWorkshopAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const workshopName = String(formData.get("workshopName") ?? "").trim();
  const workerCount = Number(formData.get("workerCount"));
  const machineCount = Number(formData.get("machineCount"));
  const machineModels = String(formData.get("machineModels") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();

  if (!email || password.length < 6) {
    return { error: "Geçerli e-posta ve en az 6 karakter şifre girin." };
  }
  if (!workshopName || !displayName) {
    return { error: "Ad ve atölye adı zorunludur." };
  }
  if (!Number.isFinite(workerCount) || workerCount < 1) {
    return { error: "İşçi sayısı en az 1 olmalıdır." };
  }
  if (!Number.isFinite(machineCount) || machineCount < 1) {
    return { error: "Makine sayısı en az 1 olmalıdır." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Bu e-posta zaten kayıtlı." };

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
      role: UserRole.WORKSHOP,
      workshopProfile: {
        create: {
          workshopName,
          workerCount,
          machineCount,
          machineModels: machineModels || null,
          city: city || null,
        },
      },
    },
  });

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) await createSession(user.id);
  redirect("/panel");
}

export async function corporateApplicationAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("displayName") ?? "").trim();
  const companyTypeRaw = String(formData.get("companyType") ?? "");
  const officialName = String(formData.get("officialName") ?? "").trim();
  const taxNumber = String(formData.get("taxNumber") ?? "").trim();
  const taxOffice = String(formData.get("taxOffice") ?? "").trim();
  const kvkk = formData.get("kvkk") === "on";
  const terms = formData.get("terms") === "on";
  const nda = formData.get("nda") === "on";

  const taxPlate = formData.get("taxPlate") as File | null;
  const signature = formData.get("signature") as File | null;
  const tradeGazette = formData.get("tradeGazette") as File | null;

  if (!email || password.length < 6) {
    return { error: "Geçerli e-posta ve en az 6 karakter şifre girin." };
  }
  if (!displayName || !officialName || !taxNumber || !taxOffice) {
    return { error: "Zorunlu alanları doldurun." };
  }
  if (!kvkk || !terms || !nda) {
    return { error: "Tüm yasal onay kutularını işaretleyin." };
  }

  const companyType =
    companyTypeRaw === "KURUMSAL" ? CompanyType.KURUMSAL : CompanyType.SAHIS;

  if (companyType === CompanyType.KURUMSAL) {
    if (!tradeGazette || tradeGazette.size === 0) {
      return { error: "LTD/AŞ için Ticaret Gazetesi yükleyin." };
    }
  }

  if (!taxPlate || taxPlate.size === 0) {
    return { error: "Güncel vergi levhası yükleyin." };
  }
  if (!signature || signature.size === 0) {
    return { error: "Noter onaylı imza beyanı / sirküleri yükleyin." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Bu e-posta zaten kayıtlı." };

  const taxPlatePath = await saveUpload(taxPlate, "firm-docs");
  const signaturePath = await saveUpload(signature, "firm-docs");
  let tradeGazettePath: string | null = null;
  if (tradeGazette && tradeGazette.size > 0) {
    tradeGazettePath = await saveUpload(tradeGazette, "firm-docs");
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
      role: UserRole.FIRM,
      firmApplication: {
        create: {
          companyType,
          officialName,
          taxNumber,
          taxOffice,
          taxPlatePath,
          signaturePath,
          tradeGazettePath,
          kvkkAccepted: kvkk,
          termsAccepted: terms,
          ndaAccepted: nda,
          status: "PENDING",
        },
      },
    },
  });

  return {
    success:
      "Başvurunuz admine iletildi. Onaylandığında e-posta adresinizle giriş yapabilirsiniz.",
  };
}

export async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== UserRole.ADMIN) redirect("/");
  return user;
}
