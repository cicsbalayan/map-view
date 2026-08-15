"use client"

import * as React from "react"

import type { Building, Office } from "@/lib/types"
import { cn } from "@/lib/utils"

function floorKey(room: string | undefined): string {
  if (!room) return "G"
  const match = room.match(/\d+/)
  if (match) return match[0]
  const lower = room.trim().toLowerCase()
  if (lower.startsWith("g")) return "G"
  return room.trim()
}

function floorSortValue(key: string): number {
  if (key === "G") return 0
  const n = Number(key)
  return Number.isFinite(n) ? n : 1000
}

function floorLabel(key: string): string {
  if (key === "G") return "Ground"
  const n = Number(key)
  return Number.isFinite(n) ? `${n}F` : key
}

function floorTabLabel(key: string): string {
  if (key === "G") return "G"
  const n = Number(key)
  return Number.isFinite(n) ? `${n}F` : key
}

interface CellPos {
  row: number
  col: number
}

function cellPositions(count: number, cols: number): CellPos[] {
  const positions: CellPos[] = []
  for (let i = 0; i < count; i++) {
    positions.push({ row: Math.floor(i / cols), col: i % cols })
  }
  return positions
}

interface BuildingMapProps {
  building: Building
  offices: Office[]
  selectedId: string | null
  onSelect: (officeId: string | null) => void
}

export function BuildingMap({
  building,
  offices,
  selectedId,
  onSelect,
}: BuildingMapProps) {
  const footW = building.foot.width
  const W = Math.max(footW, 240)
  const H0 = W * 0.35

  const groups = React.useMemo(() => {
    const map = new Map<string, Office[]>()
    for (const office of offices) {
      const key = floorKey(office.room)
      const list = map.get(key)
      if (list) {
        list.push(office)
      } else {
        map.set(key, [office])
      }
    }
    return map
  }, [offices])

  const floorKeys = React.useMemo(
    () =>
      [...groups.keys()].sort(
        (a, b) => floorSortValue(a) - floorSortValue(b)
      ),
    [groups]
  )

  const [activeFloor, setActiveFloor] = React.useState<string | null>(null)
  const floor = activeFloor ?? floorKeys[0]
  const list = floor ? (groups.get(floor) ?? []) : []

  const pad = Math.min(W, H0) * 0.02
  const baseFont = Math.max(9, Math.min(W, H0) * 0.02)
  const gap = pad

  const isGrid = building.mapRows != null
  const gridRowsCount = isGrid ? building.mapRows! : 1

  const layoutCols = Math.max(
    1,
    isGrid ? Math.ceil(list.length / gridRowsCount) : list.length
  )
  const rowsNeeded = isGrid ? gridRowsCount : 1

  const colW = (W - pad * 2 - gap * (layoutCols - 1)) / layoutCols
  const H = Math.max(
    H0,
    Math.min(
      pad * 2 + gap * (rowsNeeded - 1) + rowsNeeded * colW,
      Math.max(H0, W)
    )
  )

  const cellSize = Math.max(
    1,
    Math.min(
      colW,
      (H - pad * 2 - gap * (rowsNeeded - 1)) / rowsNeeded,
      Math.min(W, H) * 0.6
    )
  )
  const startX = (W - (layoutCols * cellSize + gap * (layoutCols - 1))) / 2
  const startY = (H - (rowsNeeded * cellSize + gap * (rowsNeeded - 1))) / 2
  const cellFont = Math.max(6, Math.min(16, cellSize * 0.18))
  const positions = cellPositions(list.length, layoutCols)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">Floor</span>
        <div className="flex flex-wrap gap-1">
          {floorKeys.map((key) => {
            const isActive = floor === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveFloor(key)}
                aria-pressed={isActive}
                title={floorLabel(key)}
                className={cn(
                  "h-7 min-w-8 rounded-md border px-2 text-xs font-medium transition-colors",
                  isActive
                    ? "border-transparent text-white"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                )}
                style={
                  isActive ? { backgroundColor: building.color } : undefined
                }
              >
                {floorTabLabel(key)}
              </button>
            )
          })}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${floorLabel(floor)} floor plan of ${building.name}`}
        className="h-auto w-full rounded-lg border bg-card"
      >
        <rect
          x={0}
          y={0}
          width={W}
          height={H}
          rx={baseFont * 0.6}
          fill="var(--color-card)"
          onClick={() => onSelect(null)}
        />

        {list.map((office, idx) => {
          const pos = positions[idx]
          const x = startX + pos.col * (cellSize + gap)
          const y = startY + pos.row * (cellSize + gap)
          const w = cellSize
          const h = cellSize
          const selected = office.id === selectedId
          const label = office.shortName ?? office.name
          const maxChars = Math.max(1, Math.floor(w / (cellFont * 0.55)))
          const display =
            label.length > maxChars
              ? `${label.slice(0, maxChars - 1)}…`
              : label
          const nameY =
            office.room && h >= cellFont * 3
              ? y + h / 2 - cellFont * 0.72
              : y + h / 2

          return (
            <g
              key={office.id}
              className="cursor-pointer"
              onClick={() => onSelect(selected ? null : office.id)}
            >
              <title>{`${office.name}${office.room ? ` · ${office.room}` : ""}`}</title>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={Math.min(w, h) * 0.08}
                fill={selected ? building.color : "var(--color-muted)"}
                stroke={
                  selected ? "var(--color-ring)" : "var(--color-border)"
                }
                strokeWidth={Math.max(1, Math.min(W, H) * 0.005)}
              />
              <text
                x={x + w / 2}
                y={nameY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={cellFont}
                fontWeight={600}
                fill={selected ? "white" : "var(--color-foreground)"}
              >
                {display}
              </text>
              {office.room && h >= cellFont * 3 && (
                <text
                  x={x + w / 2}
                  y={y + h / 2 + cellFont * 0.9}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={cellFont * 0.72}
                  fill={
                    selected ? "white" : "var(--color-muted-foreground)"
                  }
                  opacity={selected ? 0.85 : 1}
                >
                  {office.room}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
