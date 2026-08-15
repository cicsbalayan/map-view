"use client"

import * as React from "react"
import {
  BookOpen,
  Building2,
  ChevronDown,
  ChevronRight,
  DoorOpen,
  Pencil,
  Plus,
  StickyNote,
  Trash2,
  X,
} from "lucide-react"

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

const inputCls =
  "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const textareaCls =
  "w-full rounded-lg border border-input bg-background p-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
const labelCls = "mb-1 block text-xs font-medium text-muted-foreground"

const NOTE_COLORS: Record<
  NoteColor,
  { name: string; swatch: string; card: string }
> = {
  yellow: {
    name: "Yellow",
    swatch: "#eab308",
    card: "border-yellow-500/60 bg-yellow-500/10",
  },
  blue: {
    name: "Blue",
    swatch: "#3b82f6",
    card: "border-blue-500/60 bg-blue-500/10",
  },
  pink: {
    name: "Pink",
    swatch: "#ec4899",
    card: "border-pink-500/60 bg-pink-500/10",
  },
  green: {
    name: "Green",
    swatch: "#22c55e",
    card: "border-green-500/60 bg-green-500/10",
  },
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

  const [expandedOfficeId, setExpandedOfficeId] = React.useState<string | null>(
    null
  )
  const [lastOfficeId, setLastOfficeId] = React.useState<string | null>(null)
  const focusedOfficeId =
    selection?.kind === "building" ? selection.officeId ?? null : null
  if (focusedOfficeId && focusedOfficeId !== lastOfficeId) {
    setLastOfficeId(focusedOfficeId)
    setExpandedOfficeId(focusedOfficeId)
  }
  const [addingOffice, setAddingOffice] = React.useState(false)
  const [addingGuideFor, setAddingGuideFor] = React.useState<string | null>(
    null
  )
  const [editingGuide, setEditingGuide] = React.useState<{
    officeId: string
    guide: Guide
  } | null>(null)
  const [addingNoteFor, setAddingNoteFor] = React.useState<string | null>(null)

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
            expandedOfficeId={expandedOfficeId}
            onToggleOffice={(id) =>
              setExpandedOfficeId((prev) => (prev === id ? null : id))
            }
            addingOffice={addingOffice}
            onAddOfficeStart={() => setAddingOffice(true)}
            onAddOfficeCancel={() => setAddingOffice(false)}
            onAddOfficeSubmit={(name, room) => {
              store.addOffice(building.id, name, room)
              setAddingOffice(false)
            }}
            addingGuideFor={addingGuideFor}
            onAddGuideStart={(officeId) => setAddingGuideFor(officeId)}
            onAddGuideCancel={() => setAddingGuideFor(null)}
            onAddGuideSubmit={(officeId, title, content) => {
              store.addGuide(officeId, title, content)
              setAddingGuideFor(null)
            }}
            editingGuide={editingGuide}
            onEditGuide={(officeId, guide) =>
              setEditingGuide({ officeId, guide })
            }
            onEditGuideCancel={() => setEditingGuide(null)}
            onEditGuideSubmit={(officeId, guideId, title, content) => {
              store.updateGuide(officeId, guideId, { title, content })
              setEditingGuide(null)
            }}
            onDeleteGuide={(officeId, guideId) => {
              if (window.confirm("Delete this guide?")) {
                store.removeGuide(officeId, guideId)
              }
            }}
            addingNoteFor={addingNoteFor}
            onAddNoteStart={(officeId) => setAddingNoteFor(officeId)}
            onAddNoteCancel={() => setAddingNoteFor(null)}
            onAddNoteSubmit={(officeId, content, color) => {
              store.addNote(officeId, content, color)
              setAddingNoteFor(null)
            }}
          />
        ) : (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            <p>
              This is one of the campus entrance gates. Click a building on the
              map to view its offices, guides, and notes.
            </p>
          </div>
        )}
      </div>
    </aside>
  )
}

interface BuildingContentProps {
  building: Building
  store: CampusStore
  expandedOfficeId: string | null
  onToggleOffice: (id: string) => void
  addingOffice: boolean
  onAddOfficeStart: () => void
  onAddOfficeCancel: () => void
  onAddOfficeSubmit: (name: string, room?: string) => void
  addingGuideFor: string | null
  onAddGuideStart: (officeId: string) => void
  onAddGuideCancel: () => void
  onAddGuideSubmit: (officeId: string, title: string, content: string) => void
  editingGuide: { officeId: string; guide: Guide } | null
  onEditGuide: (officeId: string, guide: Guide) => void
  onEditGuideCancel: () => void
  onEditGuideSubmit: (
    officeId: string,
    guideId: string,
    title: string,
    content: string
  ) => void
  onDeleteGuide: (officeId: string, guideId: string) => void
  addingNoteFor: string | null
  onAddNoteStart: (officeId: string) => void
  onAddNoteCancel: () => void
  onAddNoteSubmit: (officeId: string, content: string, color: NoteColor) => void
}

function BuildingContent({
  building,
  store,
  expandedOfficeId,
  onToggleOffice,
  addingOffice,
  onAddOfficeStart,
  onAddOfficeCancel,
  onAddOfficeSubmit,
  editingOffice,
  onEditOffice,
  onEditOfficeCancel,
  onEditOfficeSubmit,
  onDeleteOffice,
  addingGuideFor,
  onAddGuideStart,
  onAddGuideCancel,
  onAddGuideSubmit,
  editingGuide,
  onEditGuide,
  onEditGuideCancel,
  onEditGuideSubmit,
  onDeleteGuide,
  addingNoteFor,
  onAddNoteStart,
  onAddNoteCancel,
  onAddNoteSubmit,
}: BuildingContentProps) {
  const offices = store.getOffices(building.id)

  return (
    <>
      <p className="text-sm text-muted-foreground">{building.description}</p>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Offices ({offices.length})</h3>
        {!addingOffice && !editingOffice && (
          <Button size="xs" variant="outline" onClick={onAddOfficeStart}>
            <Plus /> Add office
          </Button>
        )}
      </div>

      {addingOffice && (
        <OfficeForm
          onCancel={onAddOfficeCancel}
          onSubmit={onAddOfficeSubmit}
          submitLabel="Add office"
        />
      )}
      {editingOffice && (
        <OfficeForm
          initial={editingOffice}
          onCancel={onEditOfficeCancel}
          onSubmit={(name, room) =>
            onEditOfficeSubmit(editingOffice.id, name, room)
          }
          submitLabel="Save changes"
        />
      )}

      {offices.length === 0 ? (
        <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
          No offices yet. Add one to start adding guides and notes.
        </p>
      ) : (
        <div className="space-y-2">
          {offices.map((office) => (
            <OfficeCard
              key={office.id}
              office={office}
              store={store}
              expanded={expandedOfficeId === office.id}
              onToggle={() => onToggleOffice(office.id)}
              onEdit={() => onEditOffice(office)}
              onDelete={() => onDeleteOffice(office.id)}
              addingGuideFor={addingGuideFor}
              onAddGuideStart={() => onAddGuideStart(office.id)}
              onAddGuideCancel={onAddGuideCancel}
              onAddGuideSubmit={(title, content) =>
                onAddGuideSubmit(office.id, title, content)
              }
              editingGuide={
                editingGuide?.officeId === office.id ? editingGuide.guide : null
              }
              onEditGuide={(guide) => onEditGuide(office.id, guide)}
              onEditGuideCancel={onEditGuideCancel}
              onEditGuideSubmit={(guideId, title, content) =>
                onEditGuideSubmit(office.id, guideId, title, content)
              }
              onDeleteGuide={(guideId) => onDeleteGuide(office.id, guideId)}
              addingNoteFor={addingNoteFor}
              onAddNoteStart={() => onAddNoteStart(office.id)}
              onAddNoteCancel={onAddNoteCancel}
              onAddNoteSubmit={(content, color) =>
                onAddNoteSubmit(office.id, content, color)
              }
            />
          ))}
        </div>
      )}
    </>
  )
}

interface OfficeCardProps {
  office: Office
  store: CampusStore
  expanded: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  addingGuideFor: string | null
  onAddGuideStart: () => void
  onAddGuideCancel: () => void
  onAddGuideSubmit: (title: string, content: string) => void
  editingGuide: Guide | null
  onEditGuide: (guide: Guide) => void
  onEditGuideCancel: () => void
  onEditGuideSubmit: (guideId: string, title: string, content: string) => void
  onDeleteGuide: (guideId: string) => void
  addingNoteFor: string | null
  onAddNoteStart: () => void
  onAddNoteCancel: () => void
  onAddNoteSubmit: (content: string, color: NoteColor) => void
}

function OfficeCard({
  office,
  store,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  addingGuideFor,
  onAddGuideStart,
  onAddGuideCancel,
  onAddGuideSubmit,
  editingGuide,
  onEditGuide,
  onEditGuideCancel,
  onEditGuideSubmit,
  onDeleteGuide,
  addingNoteFor,
  onAddNoteStart,
  onAddNoteCancel,
  onAddNoteSubmit,
}: OfficeCardProps) {
  const content = store.getContent(office.id)

  return (
    <div className="overflow-hidden rounded-lg border bg-muted/30">
      <div className="flex items-center gap-1 p-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1 py-0.5 text-left hover:bg-muted"
        >
          {expanded ? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className="truncate text-sm font-medium">{office.name}</span>
          {office.room && (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {office.room}
            </span>
          )}
        </button>
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label="Edit office"
          onClick={onEdit}
        >
          <Pencil />
        </Button>
        <Button
          size="icon-xs"
          variant="ghost"
          aria-label="Delete office"
          onClick={onDelete}
        >
          <Trash2 />
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4 border-t px-3 py-3">
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <BookOpen className="size-3.5" /> Guides (
                {content.guides.length})
              </h4>
              {!addingGuideFor && !editingGuide && (
                <Button size="xs" variant="ghost" onClick={onAddGuideStart}>
                  <Plus /> Guide
                </Button>
              )}
            </div>

            {addingGuideFor && (
              <GuideForm
                onCancel={onAddGuideCancel}
                onSubmit={onAddGuideSubmit}
                submitLabel="Save guide"
              />
            )}
            {editingGuide && (
              <GuideForm
                initial={editingGuide}
                onCancel={onEditGuideCancel}
                onSubmit={(title, content) =>
                  onEditGuideSubmit(editingGuide.id, title, content)
                }
                submitLabel="Save changes"
              />
            )}

            {content.guides.length === 0 && !addingGuideFor && !editingGuide ? (
              <p className="rounded-md border border-dashed p-2.5 text-center text-xs text-muted-foreground">
                No guides yet. Add a guide to help visitors find this office.
              </p>
            ) : (
              content.guides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  onEdit={() => onEditGuide(guide)}
                  onDelete={() => onDeleteGuide(guide.id)}
                />
              ))
            )}
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                <StickyNote className="size-3.5" /> Notes (
                {content.notes.length})
              </h4>
              {!addingNoteFor && (
                <Button size="xs" variant="ghost" onClick={onAddNoteStart}>
                  <Plus /> Note
                </Button>
              )}
            </div>

            {addingNoteFor && (
              <NoteForm
                onCancel={onAddNoteCancel}
                onSubmit={onAddNoteSubmit}
                submitLabel="Save note"
              />
            )}

            {content.notes.length === 0 && !addingNoteFor ? (
              <p className="rounded-md border border-dashed p-2.5 text-center text-xs text-muted-foreground">
                No notes yet. Add a reminder, schedule, or contact info.
              </p>
            ) : (
              content.notes.map((note) => <NoteCard key={note.id} note={note} />)
            )}
          </section>
        </div>
      )}
    </div>
  )
}

function OfficeForm({
  initial,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  initial?: Pick<Office, "name" | "room">
  onCancel: () => void
  onSubmit: (name: string, room?: string) => void
  submitLabel: string
}) {
  const [name, setName] = React.useState(initial?.name ?? "")
  const [room, setRoom] = React.useState(initial?.room ?? "")

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!name.trim()) return
        onSubmit(name.trim(), room.trim() || undefined)
      }}
      className="space-y-2 rounded-lg border bg-background p-2.5"
    >
      <div>
        <label className={labelCls}>Office name</label>
        <input
          autoFocus
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Registrar's Office"
        />
      </div>
      <div>
        <label className={labelCls}>Room / floor</label>
        <input
          className={inputCls}
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="e.g. 2F (optional)"
        />
      </div>
      <div className="flex justify-end gap-1.5">
        <Button size="xs" variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="xs" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function GuideForm({
  initial,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  initial?: Pick<Guide, "title" | "content">
  onCancel: () => void
  onSubmit: (title: string, content: string) => void
  submitLabel: string
}) {
  const [title, setTitle] = React.useState(initial?.title ?? "")
  const [content, setContent] = React.useState(initial?.content ?? "")

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim() && !content.trim()) return
        onSubmit(title.trim(), content.trim())
      }}
      className="space-y-2 rounded-lg border bg-background p-2.5"
    >
      <div>
        <label className={labelCls}>Title</label>
        <input
          autoFocus
          className={inputCls}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. How to get here"
        />
      </div>
      <div>
        <label className={labelCls}>Details</label>
        <textarea
          rows={3}
          className={textareaCls}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Directions, requirements, tips..."
        />
      </div>
      <div className="flex justify-end gap-1.5">
        <Button size="xs" variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="xs" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function NoteForm({
  initial,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  initial?: Pick<Note, "content" | "color">
  onCancel: () => void
  onSubmit: (content: string, color: NoteColor) => void
  submitLabel: string
}) {
  const [content, setContent] = React.useState(initial?.content ?? "")
  const [color, setColor] = React.useState<NoteColor>(
    initial?.color ?? "yellow"
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!content.trim()) return
        onSubmit(content.trim(), color)
      }}
      className="space-y-2 rounded-lg border bg-background p-2.5"
    >
      <div>
        <label className={labelCls}>Note</label>
        <textarea
          autoFocus
          rows={3}
          className={textareaCls}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Reminder, schedule, contact info..."
        />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Color</span>
        {(Object.keys(NOTE_COLORS) as NoteColor[]).map((c) => (
          <button
            key={c}
            type="button"
            aria-label={NOTE_COLORS[c].name}
            onClick={() => setColor(c)}
            className={cn(
              "size-5 rounded-full border-2 transition-transform",
              color === c ? "scale-110 border-ring" : "border-transparent"
            )}
            style={{ backgroundColor: NOTE_COLORS[c].swatch }}
          />
        ))}
      </div>
      <div className="flex justify-end gap-1.5">
        <Button size="xs" variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="xs" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function GuideCard({
  guide,
  onEdit,
  onDelete,
}: {
  guide: Guide
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{guide.title}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Updated {formatDate(guide.updatedAt)}
          </p>
        </div>
        <div className="flex shrink-0 gap-0.5">
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label="Edit guide"
            onClick={onEdit}
          >
            <Pencil />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            aria-label="Delete guide"
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
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
      <p className="text-[11px] text-muted-foreground">
        Updated {formatDate(note.updatedAt)}
      </p>
      <p className="mt-1 text-sm whitespace-pre-wrap">{note.content}</p>
    </div>
  )
}
