"use client"

import * as React from "react"
import { Building2, DoorOpen, MapPin, Search } from "lucide-react"

import { BUILDINGS, GATES } from "@/lib/campus-data"
import type { CampusStore } from "@/hooks/use-campus-store"
import type { Building, Gate, MapSelection, Office } from "@/lib/types"
import { cn } from "@/lib/utils"

type SearchItem =
  | { type: "building"; building: Building }
  | { type: "gate"; gate: Gate }
  | { type: "office"; office: Office; building: Building }

interface SearchBarProps {
  store: CampusStore
  onSelect: (selection: MapSelection) => void
}

export function SearchBar({ store, onSelect }: SearchBarProps) {
  const [query, setQuery] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)

  const items = React.useMemo<SearchItem[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const result: SearchItem[] = []
    const seenOffices = new Set<string>()
    for (const building of BUILDINGS) {
      if (
        building.name.toLowerCase().includes(q) ||
        building.shortName.toLowerCase().includes(q) ||
        building.description.toLowerCase().includes(q)
      ) {
        result.push({ type: "building", building })
      }
    }
    for (const gate of GATES) {
      if (gate.name.toLowerCase().includes(q)) {
        result.push({ type: "gate", gate })
      }
    }
    for (const building of BUILDINGS) {
      for (const office of store.getOffices(building.id)) {
        if (
          office.name.toLowerCase().includes(q) ||
          office.room?.toLowerCase().includes(q) ||
          building.name.toLowerCase().includes(q)
        ) {
          const key = `${building.id}:${office.id}`
          if (!seenOffices.has(key)) {
            seenOffices.add(key)
            result.push({ type: "office", office, building })
          }
        }
      }
      if (result.length >= 14) break
    }
    return result.slice(0, 14)
  }, [query, store])

  const choose = React.useCallback(
    (item: SearchItem) => {
      setOpen(false)
      setQuery("")
      if (item.type === "building") {
        store.registerQuery(item.building.id)
        onSelect({ kind: "building", id: item.building.id })
      } else if (item.type === "gate") {
        onSelect({ kind: "gate", id: item.gate.id })
      } else {
        store.registerQuery(item.building.id, item.office.id)
        onSelect({
          kind: "building",
          id: item.building.id,
          officeId: item.office.id,
        })
      }
    },
    [onSelect, store]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
      setActiveIndex((i) => (items.length ? (i + 1) % items.length : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) =>
        items.length ? (i - 1 + items.length) % items.length : 0
      )
    } else if (e.key === "Enter") {
      const item = items[activeIndex]
      if (item) {
        e.preventDefault()
        choose(item)
      }
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(0)
            setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          placeholder="Search buildings, offices, gates..."
          role="combobox"
          aria-expanded={open}
          aria-controls="campus-search-results"
          aria-autocomplete="list"
          aria-label="Search the campus"
          className="h-9 w-full rounded-full border bg-background pr-3 pl-8 text-sm shadow-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {open && query.trim() && (
        <div
          id="campus-search-results"
          className="absolute top-full right-0 left-0 z-30 mt-1.5 max-h-80 overflow-y-auto rounded-xl border bg-background p-1.5 shadow-lg"
        >
          {items.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground">
              No results for “{query.trim()}”
            </p>
          ) : (
            <ul className="space-y-0.5">
              {items.map((item, i) => (
                <li key={item.type === "office" ? item.office.id : `${item.type}:${item.type === "building" ? item.building.id : item.gate.id}`}>
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault()
                      choose(item)
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm",
                      i === activeIndex && "bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-md",
                        item.type === "building"
                          ? "text-white"
                          : item.type === "gate"
                            ? "bg-rose-500/10 text-rose-500"
                            : "bg-muted text-muted-foreground"
                      )}
                      style={
                        item.type === "building"
                          ? { backgroundColor: item.building.color }
                          : undefined
                      }
                    >
                      {item.type === "building" ? (
                        <Building2 className="size-4" />
                      ) : item.type === "gate" ? (
                        <DoorOpen className="size-4" />
                      ) : (
                        <MapPin className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {item.type === "building"
                          ? item.building.name
                          : item.type === "gate"
                            ? item.gate.name
                            : item.office.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.type === "building"
                          ? item.building.shortName
                          : item.type === "gate"
                            ? "Entrance gate"
                            : `${item.building.name}${item.office.room ? ` · ${item.office.room}` : ""}`}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
