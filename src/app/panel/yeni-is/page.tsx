import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateJobForm } from "@/components/CreateJobForm";

export default async function NewJobPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "FIRM") redirect("/panel");

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold text-slate-900">Yeni iş talebi</h1>
      <p className="mt-1 text-sm text-slate-600">
        Kategori, adet, temin süresi ve model fotoğrafı ile talebiniz atölyelere düşer.
      </p>
      <CreateJobForm />
    </div>
  );
}
