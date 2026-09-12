"use client";

import { useState } from "react";
import { submitReviewAction } from "@/app/actions/jobs";
import { Stars } from "./Stars";
import { Button } from "./ui/Button";

type Props = {
  jobId: string;
  toUserId: string;
  toName: string;
};

export function ReviewForm({ jobId, toUserId, toName }: Props) {
  const [stars, setStars] = useState(5);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (fd) => {
        setError(null);
        fd.set("jobId", jobId);
        fd.set("toUserId", toUserId);
        fd.set("stars", String(stars));
        const res = await submitReviewAction(fd);
        if (res?.error) setError(res.error);
      }}
      className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4"
    >
      <p className="text-sm font-medium text-slate-800">{toName} için değerlendirme</p>
      <div className="mt-2">
        <Stars value={stars} onChange={setStars} />
      </div>
      <textarea
        name="comment"
        rows={2}
        placeholder="Yorumunuz (herkese açık)"
        className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <Button type="submit" className="mt-3" size="sm">
        Değerlendirmeyi gönder
      </Button>
    </form>
  );
}
