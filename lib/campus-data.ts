import type { Building, CampusData, Gate, GuardHouse, Point3 } from "./types"

export const WORLD_WIDTH = 1000
export const WORLD_DEPTH = 650

export const GATE_COLOR = "#f43f5e"

export const WALL = {
  height: 40,
  thickness: 3,
  gap: 30,
}

export interface TreeSpec extends Point3 {
  size: number
}

export const TREES: TreeSpec[] = [
  { x: 310, z: 70, size: 5 },
]

export const BUILDINGS: Building[] = [
  {
    id: "canteen",
    name: "Canteen",
    shortName: "Canteen",
    description: "Cafeteria and food court for students, faculty, and staff.",
    color: "#f59e0b",
    foot: { x: 120, z: 175, width: 200, depth: 150 },
    height: 20,
    floors: 1,
  },
  {
    id: "eeb",
    name: "EEB Building",
    shortName: "EEB",
    description: "Home to classrooms, laboratories, and administrative offices.",
    color: "#6366f1",
    foot: { x: 380, z: 150, width: 280, depth: 180 },
    height: 40,
    floors: 2,
  },
  {
    id: "ssc",
    name: "SSC Building",
    shortName: "SSC",
    description: "Office of Academic Affairs, science laboratories, and classrooms.",
    color: "#10b981",
    foot: { x: 70, z: 425, width: 650, depth: 170 },
    height: 100,
    floors: 4,
    mapRows: 2,
  },
  {
    id: "auto-lab",
    name: "Auto Lab Building",
    shortName: "Auto Lab",
    description:
      "A covered laboratory walkway between the SSC and EEB for automotive training and workshops.",
    color: "#8b5cf6",
    foot: { x: 450, z: 350, width: 240, depth: 70 },
    height: 28,
    floors: 1,
  },
  {
    id: "rgr",
    name: "RGR Building",
    shortName: "RGR",
    description: "Offices, classrooms, and campus support facilities.",
    color: "#0ea5e9",
    foot: { x: 700, z: 180, width: 250, depth: 180 },
    height: 40,
    floors: 2,
  },
  {
    id: "storage",
    name: "Storage Building",
    shortName: "Storage",
    description: "A yellow-painted storage building with a steel roof.",
    color: "#eab308",
    wallColor: "#eab308",
    roofColor: "#94a3b8",
    foot: { x: 780, z: 20, width: 150, depth: 80 },
    height: 12,
    floors: 1,
  },
  {
    id: "gso-barracks",
    name: "GSO Barracks",
    shortName: "GSO Barracks",
    description: "Barracks and dormitory for the campus GSO and security personnel.",
    color: "#6b8e23",
    wallColor: "#6b8e23",
    foot: { x: 50, z: 175, width: 60, depth: 140 },
    height: 20,
    floors: 2,
  },
]

export const GATES: Gate[] = [
  {
    id: "gate-1",
    name: "Gate 1",
    description: "Main entrance on the north wall, upper right of the campus.",
    position: { x: 60, z: 0 },
    notes: [
      {
        id: "gate-1-id",
        content:
          "Always wear your Student ID visibly at all times; you may be asked to present it upon entry. If your Student ID is not available, show your student portal or COR instead.",
        color: "yellow",
      },
      {
        id: "gate-1-uniform",
        content:
          "Follow proper uniform rules: Wear your prescribed white top/school uniform, proper pants, and closed shoes. Slippers, sandals, ripped jeans, and improper attire are NOT ALLOWED.",
        color: "yellow",
      },
      {
        id: "gate-1-inspection",
        content:
          "Prepare your belongings for inspection if requested by security personnel.",
        color: "yellow",
      },
      {
        id: "gate-1-visitors",
        content:
          "Visitors should log in at the guardhouse and get a visitor pass before entering the campus.",
        color: "blue",
      },
    ],
  },
  {
    id: "gate-2",
    name: "Gate 2",
    description: "Secondary entrance on the south wall, below the canteen.",
    position: { x: 1000, z: 530 },
    notes: [
      {
        id: "gate-2-id",
        content:
          "Always wear your Student ID visibly at all times; you may be asked to present it upon entry. If your Student ID is not available, show your student portal or COR instead.",
        color: "yellow",
      },
      {
        id: "gate-2-uniform",
        content:
          "Follow proper uniform rules: Wear your prescribed white top/school uniform, proper pants, and closed shoes. Slippers, sandals, ripped jeans, and improper attire are NOT ALLOWED.",
        color: "yellow",
      },
      {
        id: "gate-2-inspection",
        content:
          "Prepare your belongings for inspection if requested by security personnel.",
        color: "yellow",
      },
      {
        id: "gate-2-visitors",
        content:
          "Visitors should log in at the guardhouse and get a visitor pass before entering the campus.",
        color: "blue",
      },
    ],
  },
]

export const CAMPUS: CampusData = {
  worldWidth: WORLD_WIDTH,
  worldDepth: WORLD_DEPTH,
  buildings: BUILDINGS,
  gates: GATES,
}

export const GUARD_HOUSES: GuardHouse[] = [
  {
    id: "guard-house-1",
    name: "Guard House 1",
    position: { x: 960, z: 590 },
    width: 70,
    depth: 60,
    height: 16,
    floors: 1,
  },
  {
    id: "guard-house-2",
    name: "Guard House 2",
    position: { x: 115, z: 35 },
    width: 70,
    depth: 60,
    height: 16,
    floors: 2,
  },
]

export type RoadPath = Point3[]

export const MAIN_ROAD: RoadPath = [
  { x: 915, z: 0 },
  { x: 915, z: 580 },
  { x: 40, z: 580 },
  { x: 40, z: 700 },
]

export const GREENS: { x: number; z: number; width: number; depth: number }[] = [
  { x: 60, z: 60, width: 500, depth: 155 },
  { x: 740, z: 80, width: 170, depth: 170 },
]

export const PARKING_LOT = { x: 720, z: 370, width: 200, depth: 230 }

export const BENCH_AREA = { x: 700, z: 130, width: 60, depth: 40 }

export function buildingCenter(building: Building): Point3 {
  return {
    x: building.foot.x + building.foot.width / 2,
    z: building.foot.z + building.foot.depth / 2,
  }
}
