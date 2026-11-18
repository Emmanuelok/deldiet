import { atelierResponse } from "@/lib/atelier-api";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return atelierResponse("catalogue", request);
}
