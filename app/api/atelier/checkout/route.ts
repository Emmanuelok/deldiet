import { atelierResponse } from "@/lib/atelier-api";

export const dynamic = "force-dynamic";

export function POST(request: Request) {
  return atelierResponse("checkout", request);
}
