import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { MessagesPageClient } from "@/components/customer/MessagesPageClient";
import { getThreadWithMessages, markThreadReadByCustomer } from "@/lib/supportMessages";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session?.customerId) redirect("/login");

  const thread = await getThreadWithMessages(session.customerId);
  if (thread && thread.customerUnreadCount > 0) {
    await markThreadReadByCustomer(session.customerId);
  }

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader title="Tin nhắn từ Admin" subtitle="Hội thoại riêng giữa bạn và đội ngũ hỗ trợ." />
      <MessagesPageClient
        initialMessages={
          thread?.messages.map((m) => ({
            id: m.id,
            senderRole: m.senderRole as "admin" | "customer",
            message: m.message,
            createdAt: m.createdAt.toISOString(),
          })) ?? []
        }
      />
    </div>
  );
}
