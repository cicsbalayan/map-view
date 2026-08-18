"use client"

import * as React from "react"
import {
  BookOpen,
  Building2,
  DoorOpen,
  StickyNote,
  X,
} from "lucide-react"

import { BuildingMap } from "@/components/building-map"
import { Button } from "@/components/ui/button"
import { BUILDINGS, GATES } from "@/lib/campus-data"
import type { CampusStore } from "@/hooks/use-campus-store"
import type {
  Building,
  Guide,
  MapSelection,
  Note,
  NoteColor,
  Office,
} from "@/lib/types"
import { cn } from "@/lib/utils"

const NOTE_COLORS: Record<NoteColor, { card: string }> = {
  yellow: { card: "border-yellow-500/60 bg-yellow-500/10" },
  blue: { card: "border-blue-500/60 bg-blue-500/10" },
  pink: { card: "border-pink-500/60 bg-pink-500/10" },
  green: { card: "border-green-500/60 bg-green-500/10" },
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp)
}

interface OfficePanelProps {
  selection: MapSelection
  store: CampusStore
  onClose: () => void
}

export function OfficePanel({ selection, store, onClose }: OfficePanelProps) {
  const building = React.useMemo(
    () =>
      selection?.kind === "building"
        ? (BUILDINGS.find((b) => b.id === selection.id) ?? null)
        : null,
    [selection]
  )
  const gate = React.useMemo(
    () =>
      selection?.kind === "gate"
        ? (GATES.find((g) => g.id === selection.id) ?? null)
        : null,
    [selection]
  )

  const [selectedOfficeId, setSelectedOfficeId] = React.useState<string | null>(
    null
  )
  const [lastSelectionKey, setLastSelectionKey] = React.useState<string | null>(
    null
  )
  const selectionKey =
    selection?.kind === "building"
      ? `${selection.id}:${selection.officeId ?? ""}`
      : null
  if (selectionKey !== null && selectionKey !== lastSelectionKey) {
    setLastSelectionKey(selectionKey)
    setSelectedOfficeId(
      selection?.kind === "building" ? (selection.officeId ?? null) : null
    )
  }

  if (!building && !gate) return null

  return (
    <aside className="absolute top-4 right-4 bottom-4 z-20 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border bg-background/95 shadow-lg backdrop-blur">
      <header className="flex items-start justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {building ? (
              <Building2
                className="size-4 shrink-0"
                style={{ color: building.color }}
              />
            ) : (
              <DoorOpen className="size-4 shrink-0 text-rose-500" />
            )}
            <h2 className="truncate font-semibold">
              {building?.name ?? gate?.name}
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {building ? `${building.description}` : gate?.description}
          </p>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Close panel"
          onClick={onClose}
        >
          <X />
        </Button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {building ? (
          <BuildingContent
            building={building}
            store={store}
            selectedOfficeId={selectedOfficeId}
            onSelectOffice={setSelectedOfficeId}
          />
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
              <p>
                This is one of the campus entrance gates. Click a building on the
                map to view its 2D floor plan, guides, and notes.
              </p>
            </div>
            {gate?.notes && gate.notes.length > 0 && (
              <section className="space-y-2">
                <h4 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <StickyNote className="size-3.5" /> Notes ({gate.notes.length})
                </h4>
                {gate.notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

interface BuildingContentProps {
  building: Building
  store: CampusStore
  selectedOfficeId: string | null
  onSelectOffice: (officeId: string | null) => void
}

function BuildingContent({
  building,
  store,
  selectedOfficeId,
  onSelectOffice,
}: BuildingContentProps) {
  const offices = store.getOffices(building.id)
  const selectedOffice =
    offices.find((office) => office.id === selectedOfficeId) ?? null

  return (
    <>
      <div>
        <h3 className="text-sm font-semibold">Floor Plan</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {offices.length} office{offices.length === 1 ? "" : "s"} · click a
          room to view its guides and notes.
        </p>
      </div>

      {offices.length === 0 ? (
        building.notes && building.notes.length > 0 ? (
          <section className="space-y-2">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <StickyNote className="size-3.5" /> Notes ({building.notes.length})
            </h4>
            {building.notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </section>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
            No offices listed for this building.
          </p>
        )
      ) : (
        <BuildingMap
          key={building.id}
          building={building}
          offices={offices}
          selectedId={selectedOfficeId}
          onSelect={onSelectOffice}
        />
      )}

      {selectedOffice ? (
        <OfficeDetail office={selectedOffice} />
      ) : (
        <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
          Click a room on the map to see its guides and notes.
        </p>
      )}
    </>
  )
}

function OfficeDetail({ office }: { office: Office }) {
  const guides = office.guides ?? []
  const notes = office.notes ?? []

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">{office.name}</h3>
        {office.room && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {office.room} · {buildingFloor(office)}
          </p>
        )}
      </div>

      <section className="space-y-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <BookOpen className="size-3.5" /> Guides ({guides.length})
        </h4>

        {guides.length === 0 ? (
          <p className="rounded-md border border-dashed p-2.5 text-center text-xs text-muted-foreground">
            No guides for this office.
          </p>
        ) : (
          guides.map((guide) => <GuideCard key={guide.id} guide={guide} />)
        )}
      </section>

      <section className="space-y-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          <StickyNote className="size-3.5" /> Notes ({notes.length})
        </h4>

        {notes.length === 0 ? (
          <p className="rounded-md border border-dashed p-2.5 text-center text-xs text-muted-foreground">
            No notes for this office.
          </p>
        ) : (
          notes.map((note) => <NoteCard key={note.id} note={note} />)
        )}
      </section>
    </div>
  )
}

function buildingFloor(office: Office): string {
  const room = office.room
  if (!room) return "Ground"
  const match = room.match(/\d+/)
  if (match) return `${match[0]}F`
  return room.trim().toLowerCase().startsWith("g") ? "Ground" : room.trim()
}

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-sm font-medium">{guide.title}</p>
      {guide.updatedAt != null && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Updated {formatDate(guide.updatedAt)}
        </p>
      )}
      {guide.content && (
        <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
          {guide.content}
        </p>
      )}
    </div>
  )
}

function NoteCard({ note }: { note: Note }) {
  return (
    <div className={cn("rounded-lg border p-3", NOTE_COLORS[note.color].card)}>
      {note.updatedAt != null && (
        <p className="text-[11px] text-muted-foreground">
          Updated {formatDate(note.updatedAt)}
        </p>
      )}
      <p className="mt-1 text-sm whitespace-pre-wrap">{note.content}</p>
    </div>
  )
}
