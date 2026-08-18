export type Point3 = { x: number; z: number }

export interface Office {
  id: string
  name: string
  shortName?: string
  room?: string
  guides?: Guide[]
  notes?: Note[]
}

export interface Guide {
  id: string
  title: string
  content: string
  updatedAt?: number
}

export type NoteColor = "yellow" | "blue" | "pink" | "green"

export interface Note {
  id: string
  content: string
  color: NoteColor
  updatedAt?: number
}

export interface Building {
  id: string
  name: string
  shortName: string
  description: string
  color: string
  foot: { x: number; z: number; width: number; depth: number }
  height: number
  floors: number
  mapRows?: number
  wallColor?: string
  roofColor?: string
  notes?: Note[]
}

export interface Gate {
  id: string
  name: string
  description: string
  position: Point3
  notes?: Note[]
}

export interface GuardHouse {
  id: string
  name: string
  position: Point3
  width: number
  depth: number
  height: number
  floors: number
}

export interface CampusData {
  worldWidth: number
  worldDepth: number
  buildings: Building[]
  gates: Gate[]
}

export interface Stats {
  queries: Record<string, number>
  views: Record<string, number>
}

export interface CampusStoreData {
  stats: Stats
}

export type MapSelection = { kind: "building" | "gate"; id: string; officeId?: string } | null
