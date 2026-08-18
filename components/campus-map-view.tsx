"use client"

import * as React from "react"
import { Eye, Locate, MapPin, Search } from "lucide-react"

import { CampusMap, type CampusMapHandle } from "@/components/campus-map"
import { OfficePanel } from "@/components/office-panel"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { useCampusStore } from "@/hooks/use-campus-store"
import type { MapSelection } from "@/lib/types"

export function CampusMapView() {
  const store = useCampusStore()
  const mapRef = React.useRef<CampusMapHandle>(null)
  const [selection, setSelection] = React.useState<MapSelection>(null)

  const handleSelect = React.useCallback(
    (next: MapSelection) => {
      if (next?.kind === "building") {
        store.registerView(next.id, next.officeId)
      }
      setSelection(next)
    },
    [store]
  )

  const stats = store.getStats()
  const totalQueries = Object.values(stats.queries).reduce(
    (sum, n) => sum + n,
    0
  )
  const totalViews = Object.values(stats.views).reduce((sum, n) => sum + n, 0)

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b px-3 py-2 sm:px-4 sm:py-2.5">
        <div className="flex min-w-0 shrink-0 items-center gap-2.5">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <MapPin className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold">Campus Map</h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              Interactive 3D building and office guide
            </p>
          </div>
        </div>

        <div className="min-w-0 max-sm:order-last max-sm:w-full sm:mx-auto sm:w-full sm:max-w-md">
          <SearchBar
            store={store}
            onSelect={(sel) => {
              handleSelect(sel)
              mapRef.current?.focus(sel)
            }}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div
            className="hidden items-center gap-3 rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground sm:flex"
            aria-label="Search activity"
          >
            <span className="flex items-center gap-1.5">
              <Search className="size-3.5" />
              <span className="tabular-nums">{totalQueries}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="size-3.5" />
              <span className="tabular-nums">{totalViews}</span>
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => mapRef.current?.resetView()}
          >
            <Locate className="size-3.5" /> Fit map
          </Button>
        </div>
      </header>

      <main className="relative min-h-0 flex-1">
        <CampusMap ref={mapRef} selected={selection} onSelect={handleSelect} />
        {selection && (
          <OfficePanel
            selection={selection}
            store={store}
            onClose={() => {
              setSelection(null)
              mapRef.current?.resetView()
            }}
          />
        )}
      </main>
    </div>
  )
}
