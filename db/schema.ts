import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const serviceRequests = sqliteTable(
  "service_requests",
  {
    id: text("id").primaryKey(),
    publicReference: text("reference").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    requestType: text("request_type").notNull(),
    source: text("fulfilment"),
    status: text("status").notNull(),
    customerName: text("contact_name"),
    customerEmail: text("contact_email"),
    currency: text("currency").notNull().default("CAD"),
    estimatedSubtotalCents: integer("subtotal_cents"),
    payloadJson: text("payload_json").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("service_requests_reference_uq").on(table.publicReference),
    uniqueIndex("service_requests_type_idempotency_uq").on(table.requestType, table.idempotencyKey),
    index("service_requests_type_status_idx").on(table.requestType, table.status),
    index("service_requests_created_at_idx").on(table.createdAt),
  ]
);
