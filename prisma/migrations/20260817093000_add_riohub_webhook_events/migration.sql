CREATE TABLE "riohub_webhook_events" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "event_id" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "order_external_id" TEXT,
  "payload" TEXT NOT NULL,
  "processed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "riohub_webhook_events_event_id_key" ON "riohub_webhook_events"("event_id");
CREATE INDEX "riohub_webhook_events_event_idx" ON "riohub_webhook_events"("event");
CREATE INDEX "riohub_webhook_events_order_external_id_idx" ON "riohub_webhook_events"("order_external_id");
