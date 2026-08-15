import type { Office } from "@/lib/types"

export const AUTO_LAB_OFFICES: Office[] = [
  {
    id: "auto-lab-workshop",
    name: "Auto Workshop",
    shortName: "Workshop",
    room: "Ground",
    guides: [
      {
        id: "auto-lab-workshop-guide",
        title: "Workshop Use",
        content:
          "Open to automotive students during class hours. Tools are signed out at the start of a session and must be returned after use.",
      },
    ],
    notes: [
      {
        id: "auto-lab-workshop-safety",
        content: "Safety glasses and closed shoes are required inside the workshop.",
        color: "yellow",
      },
      {
        id: "auto-lab-workshop-location",
        content:
          "A covered laboratory walkway between the SSC and EEB used for automotive training and hands-on workshops.",
        color: "blue",
      },
    ],
  },
]
