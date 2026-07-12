"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";

type TelegramAccount = {
  id: string;
  botName: string;
  botUsername: string | null;
  botTokenHint: string | null;
  webhookUrl: string | null;
  status: string;
};

export function TelegramAccountForm({ account }: { account: TelegramAccount | null }) {
  const router = useRouter();
  const [botName, setBotName] = useState(account?.botName ?? "");
  const [botUsername, setBotUsername] = useState(account?.botUsername ?? "");
  const [botTokenHint, setBotTokenHint] = useState(account?.botTokenHint ?? "");
  const [webhookUrl, setWebhookUrl] = useState(account?.webhookUrl ?? "");
  const [status, setStatus] = useState(account?.status ?? "inactive");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/telegram/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: account?.id, botName, botUsername, botTokenHint, webhookUrl, status }),
    });

    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-lg">
      <div className="grid grid-cols-1 gap-lg sm:grid-cols-2">
        <TextInput placeholder="Ten bot" required value={botName} onChange={(e) => setBotName(e.target.value)} />
        <TextInput placeholder="@botusername" value={botUsername} onChange={(e) => setBotUsername(e.target.value)} />
        <TextInput
          placeholder="Token hint de doi chieu"
          value={botTokenHint}
          onChange={(e) => setBotTokenHint(e.target.value)}
        />
        <TextInput placeholder="Webhook URL" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
      </div>
      <label className="flex items-center gap-sm text-[14px]">
        <input type="checkbox" checked={status === "active"} onChange={(e) => setStatus(e.target.checked ? "active" : "inactive")} />
        Bat bot auto reply
      </label>
      <Button type="submit" disabled={loading} className="w-fit">
        {loading ? "Dang luu..." : "Luu cau hinh"}
      </Button>
    </form>
  );
}
