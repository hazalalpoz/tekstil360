"use client";

import { useState } from "react";
import { createJobAction } from "@/app/actions/jobs";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export function CreateJobForm() {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (fd) => {
        setError(null);
        const res = await createJobAction(fd);
        if (res?.error) setError(res.error);
      }}
      className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Ürün kategorisi</span>
        <select
          name="category"
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5"
        >
          {PRODUCT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </label>
      <Input name="quantity" type="number" label="Adet" required min={1} />
      <Input name="deadlineDays" type="number" label="Temin süresi (gün)" required min={1} />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Model fotoğrafı</span>
        <input name="photo" type="file" accept="image/*" className="w-full text-sm" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Açıklama (opsiyonel)</span>
        <textarea
          name="description"
          rows={3}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" size="lg">
        İş talebini yayınla
      </Button>
    </form>
  );
}
