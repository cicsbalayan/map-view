import type { Office } from "@/lib/types"

export const STORAGE_OFFICES: Office[] = [
  { id: "storage-office", name: "Storage Office", shortName: "Office", room: "1F" },
  {
    id: "storage-main",
    name: "Storage Room",
    shortName: "Storage",
    room: "1F",
    notes: [
      {
        id: "storage-main-contents",
        content:
          "Holds campus maintenance items and supplies such as floor mats, cleaning equipment, and spare fixtures.",
        color: "blue",
      },
    ],
  },
  {
    id: "storage-generator",
    name: "Generator Office",
    shortName: "Generator",
    room: "1F",
    guides: [
      {
        id: "storage-generator-guide",
        title: "Power Generator",
        content:
          "Houses the campus backup power generator. Start-up, refueling, and maintenance are handled by the facilities team.",
      },
    ],
    notes: [
      {
        id: "storage-generator-access",
        content: "Keep the door locked. Only authorized personnel may enter.",
        color: "yellow",
      },
    ],
  },
]
