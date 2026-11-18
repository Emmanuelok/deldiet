import { atelierWebhook } from "@/lib/atelier-api";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return atelierWebhook(request);
}
