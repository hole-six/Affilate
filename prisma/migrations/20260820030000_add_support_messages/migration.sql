-- CreateTable
CREATE TABLE "support_threads" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "last_message_at" DATETIME,
    "last_message_preview" TEXT,
    "customer_unread_count" INTEGER NOT NULL DEFAULT 0,
    "admin_unread_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_threads_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "support_threads_customer_id_key" ON "support_threads"("customer_id");

-- CreateTable
CREATE TABLE "support_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "thread_id" TEXT NOT NULL,
    "sender_role" TEXT NOT NULL,
    "sender_user_id" TEXT,
    "message" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "support_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "support_threads" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "support_messages_thread_id_idx" ON "support_messages"("thread_id");
