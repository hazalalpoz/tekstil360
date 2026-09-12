"use client";

import { useEffect, useRef, useState } from "react";
import { sendMessageAction } from "@/app/actions/jobs";
import { Button } from "./ui/Button";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  sender: { displayName: string; id: string };
};

type Props = {
  jobId: string;
  initialMessages: Message[];
  currentUserId: string;
  disabled?: boolean;
};

export function LiveChat({ jobId, initialMessages, currentUserId, disabled }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (disabled) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/messages?jobId=${jobId}`);
      if (res.ok) {
        const data = (await res.json()) as { messages: Message[] };
        setMessages(data.messages);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [jobId, disabled]);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">Canlı sohbet</p>
        <p className="text-xs text-teal-600">Firma ↔ Atölye</p>
      </div>
      <div className="h-64 space-y-2 overflow-y-auto px-4 py-3">
        {messages.map((m) => {
          const mine = m.sender.id === currentUserId;
          return (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                mine ? "ml-auto bg-teal-600 text-white" : "bg-slate-100 text-slate-800"
              }`}
            >
              <p className="text-[10px] opacity-80">{m.sender.displayName}</p>
              <p>{m.body}</p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {!disabled ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            fd.set("jobId", jobId);
            await sendMessageAction(fd);
            form.reset();
            const res = await fetch(`/api/messages?jobId=${jobId}`);
            if (res.ok) {
              const data = (await res.json()) as { messages: Message[] };
              setMessages(data.messages);
            }
          }}
          className="flex gap-2 border-t border-slate-100 p-3"
        >
          <input
            name="body"
            required
            placeholder="Mesaj yazın…"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <Button type="submit" size="sm">
            Gönder
          </Button>
        </form>
      ) : (
        <p className="border-t border-slate-100 p-3 text-center text-xs text-slate-500">
          Sohbet, atölye onaylandığında açılır.
        </p>
      )}
    </div>
  );
}
