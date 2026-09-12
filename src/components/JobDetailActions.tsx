"use client";

import { useState } from "react";
import {
  acceptBidAction,
  confirmDeliveryAction,
  submitBidAction,
  updateProductionStageAction,
} from "@/app/actions/jobs";
import { PRODUCTION_STAGES } from "@/lib/constants";
import { Button } from "./ui/Button";

export function AcceptBidForm({ bidId }: { bidId: string }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      action={async (fd) => {
        setError(null);
        const res = await acceptBidAction(fd);
        if (res?.error) setError(res.error);
      }}
      className="mt-3"
    >
      <input type="hidden" name="bidId" value={bidId} />
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" size="sm">
        Bu atölyeye işi ver (onay)
      </Button>
    </form>
  );
}

export function SubmitBidForm({ jobRequestId }: { jobRequestId: string }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      action={async (fd) => {
        setError(null);
        fd.set("jobRequestId", jobRequestId);
        const res = await submitBidAction(fd);
        if (res?.error) setError(res.error);
      }}
      className="mt-8 space-y-3 rounded-2xl border border-teal-200 bg-teal-50/30 p-4"
    >
      <p className="font-medium text-slate-900">Bu işe teklif gönder</p>
      <textarea
        name="message"
        rows={2}
        placeholder="Kapasitenizi kısaca belirtin (opsiyonel)"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button type="submit">Teklif gönder</Button>
    </form>
  );
}

export function ProductionStageForm({
  jobId,
  currentStage,
}: {
  jobId: string;
  currentStage: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      action={async (fd) => {
        setError(null);
        fd.set("jobId", jobId);
        const res = await updateProductionStageAction(fd);
        if (res?.error) setError(res.error);
      }}
      className="mt-3 flex flex-wrap gap-2"
    >
      {PRODUCTION_STAGES.map((s) => (
        <Button
          key={s.value}
          type="submit"
          name="stage"
          value={s.value}
          variant={currentStage === s.value ? "primary" : "secondary"}
          size="sm"
        >
          {s.label}
        </Button>
      ))}
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </form>
  );
}

export function ConfirmDeliveryForm({ jobId }: { jobId: string }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      action={async (fd) => {
        setError(null);
        fd.set("jobId", jobId);
        const res = await confirmDeliveryAction(fd);
        if (res?.error) setError(res.error);
      }}
      className="mt-6"
    >
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <Button type="submit" size="lg">
        Ürünü teslim aldım
      </Button>
    </form>
  );
}
