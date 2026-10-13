import "server-only";

import { headers } from "next/headers";
import type { TradeMode } from "./types";

export async function tradeMode(): Promise<TradeMode> {
  const headerStore = await headers();
  return headerStore.get("x-kb-trade") === "export" ? "export" : "domestic";
}
