import type { Office } from "@/lib/types"

import { AUTO_LAB_OFFICES } from "./auto-lab"
import { CANTEEN_OFFICES } from "./canteen"
import { EEB_OFFICES } from "./eeb"
import { GSO_BARRACKS_OFFICES } from "./gso-barracks"
import { RGR_OFFICES } from "./rgr"
import { SSC_OFFICES } from "./ssc"
import { STORAGE_OFFICES } from "./storage"

export const OFFICES: Record<string, Office[]> = {
  canteen: CANTEEN_OFFICES,
  eeb: EEB_OFFICES,
  ssc: SSC_OFFICES,
  "auto-lab": AUTO_LAB_OFFICES,
  rgr: RGR_OFFICES,
  storage: STORAGE_OFFICES,
  "gso-barracks": GSO_BARRACKS_OFFICES,
}

export function officesFor(buildingId: string): Office[] {
  return OFFICES[buildingId] ?? []
}
