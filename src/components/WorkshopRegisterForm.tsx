"use client";

import { useState } from "react";
import { registerWorkshopAction } from "@/app/actions/auth";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export function WorkshopRegisterForm() {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (fd) => {
        setError(null);
        const res = await registerWorkshopAction(fd);
        if (res?.error) setError(res.error);
      }}
      className="space-y-4"
    >
      <Input name="displayName" label="Yetkili ad soyad" required />
      <Input name="workshopName" label="Atölye adı" required />
      <Input name="email" type="email" label="E-posta" required />
      <Input name="password" type="password" label="Şifre" required minLength={6} />
      <Input name="workerCount" type="number" label="İşçi sayısı *" required min={1} />
      <Input name="machineCount" type="number" label="Makine sayısı *" required min={1} />
      <Input
        name="machineModels"
        label="Makine modelleri (opsiyonel)"
        placeholder="Örn: Juki DDL-8700, Brother S-7250A"
      />
      <Input name="city" label="Şehir (opsiyonel)" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" size="lg">
        Kaydol ve panele git
      </Button>
    </form>
  );
}
