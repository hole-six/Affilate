"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Đăng ký thất bại");
      return;
    }

    const data = await res.json();
    router.push(data.redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
      <div className="flex flex-col gap-sm">
        <label className="text-[14px] font-semibold text-ink">Họ và tên</label>
        <TextInput
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nguyễn Văn A"
        />
      </div>
      <div className="flex flex-col gap-sm">
        <label className="text-[14px] font-semibold text-ink">Số điện thoại</label>
        <TextInput
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0901234567"
        />
      </div>
      <div className="flex flex-col gap-sm">
        <label className="text-[14px] font-semibold text-ink">Email</label>
        <TextInput
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ban@email.com"
        />
      </div>
      <div className="flex flex-col gap-sm">
        <label className="text-[14px] font-semibold text-ink">Mật khẩu</label>
        <TextInput
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Tối thiểu 6 ký tự"
        />
      </div>
      {error && <div className="text-[14px] text-negative-darkest">{error}</div>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Đang đăng ký..." : "Đăng ký"}
      </Button>
    </form>
  );
}
