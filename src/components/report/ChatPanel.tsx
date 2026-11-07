"use client";

import { SignUpButton } from "@clerk/nextjs";
import { ArrowUp, Bot, Loader2, MessageCircleQuestion } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ChatMessageDTO } from "@/lib/analysis";
import { readApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChatPanel({
  analysisId,
  initialMessages,
  signedIn,
  topConcern,
  limit,
}: {
  analysisId: string;
  initialMessages: ChatMessageDTO[];
  signedIn: boolean;
  topConcern: string;
  limit: number;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const asked = messages.filter((m) => m.role === "user").length;
  const remaining = limit - asked;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const suggestions = [
    `What's the single most important step for ${topConcern.toLowerCase()}?`,
    "How long until I'd see a difference?",
    "Can I use retinol and vitamin C together?",
  ];

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setInput("");
    setBusy(true);
    const userMsg: ChatMessageDTO = { id: crypto.randomUUID(), role: "user", content: message };
    const botId = crypto.randomUUID();
    setMessages((m) => [...m, userMsg, { id: botId, role: "assistant", content: "" }]);

    try {
      const res = await fetch(`/api/analyses/${analysisId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok || !res.body) throw new Error((await readApiError(res)).message);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => m.map((x) => (x.id === botId ? { ...x, content: x.content + chunk } : x)));
      }
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== botId && x.id !== userMsg.id));
      setInput(message);
      toast.error(e instanceof Error && e.message ? e.message : "The assistant couldn't reply. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!signedIn) {
    return (
      <section className="rounded-3xl border bg-card p-6 text-center print:hidden">
        <MessageCircleQuestion className="mx-auto size-8 text-primary" />
        <h2 className="mt-3 text-2xl">Have a question about your results?</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Create a free account to ask follow-up questions, save this report, and get 10 more analyses.
        </p>
        <SignUpButton mode="modal">
          <Button className="mt-5">Create free account</Button>
        </SignUpButton>
      </section>
    );
  }

  return (
    <section className="flex flex-col rounded-3xl border bg-card print:hidden" aria-label="Ask about your results">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="flex items-center gap-2 font-sans text-base font-semibold">
          <Bot className="size-4 text-primary" /> Ask about your results
        </h2>
        <span className="text-xs text-muted-foreground">{Math.max(remaining, 0)} questions left</span>
      </div>

      <div ref={listRef} className="max-h-[28rem] min-h-40 space-y-4 overflow-y-auto px-5 py-5" aria-live="polite">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Try asking:</p>
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                disabled={busy}
                className="block w-full rounded-xl border px-4 py-2.5 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted",
                )}
              >
                {m.role === "assistant" ? (
                  m.content ? (
                    <div className="space-y-2 [&_li]:ml-4 [&_ol]:list-decimal [&_strong]:font-semibold [&_ul]:list-disc">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Thinking" />
                  )
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="flex items-end gap-2 border-t p-3"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder={remaining > 0 ? "Ask a question…" : "Question limit reached for this analysis"}
          disabled={busy || remaining <= 0}
          rows={1}
          maxLength={1000}
          className="max-h-32 min-h-10 resize-none"
          aria-label="Your question"
        />
        <Button type="submit" size="icon" disabled={busy || !input.trim() || remaining <= 0} aria-label="Send">
          {busy ? <Loader2 className="animate-spin" /> : <ArrowUp />}
        </Button>
      </form>
    </section>
  );
}
