"use client"

import { useCallback, useEffect, useState } from "react"

import { CAMPUS } from "@/lib/campus-data"
import type {
  CampusStoreData,
  Guide,
  Note,
  NoteColor,
  Office,
  OfficeContent,
  Stats,
} from "@/lib/types"

const STORAGE_KEY = "campus-map-data-v1"

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function emptyStats(): Stats {
  return { queries: {}, views: {} }
}

function loadData(): CampusStoreData {
  if (typeof window === "undefined") {
    return { offices: {}, content: {}, stats: emptyStats() }
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { offices: {}, content: {}, stats: emptyStats() }
    }
    const parsed = JSON.parse(raw) as CampusStoreData
    return {
      offices: parsed.offices ?? {},
      content: parsed.content ?? {},
      stats: parsed.stats ?? emptyStats(),
    }
  } catch {
    return { offices: {}, content: {}, stats: emptyStats() }
  }
}

function seedOfficesFor(buildingId: string): Office[] {
  return CAMPUS.buildings.find((b) => b.id === buildingId)?.seedOffices ?? []
}

function emptyContent(): OfficeContent {
  return { guides: [], notes: [] }
}

export function useCampusStore() {
  const [data, setData] = useState<CampusStoreData>(() => loadData())

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // storage may be unavailable (private mode, quota) - ignore
    }
  }, [data])

  const getOffices = useCallback(
    (buildingId: string): Office[] =>
      data.offices[buildingId] ?? seedOfficesFor(buildingId),
    [data]
  )

  const getContent = useCallback(
    (officeId: string): OfficeContent =>
      data.content[officeId] ?? emptyContent(),
    [data]
  )

  const addOffice = useCallback(
    (buildingId: string, name: string, room?: string) => {
      const office: Office = {
        id: createId("office"),
        name,
        room: room?.trim() || undefined,
      }
      setData((prev) => {
        const current = prev.offices[buildingId] ?? seedOfficesFor(buildingId)
        return {
          ...prev,
          offices: { ...prev.offices, [buildingId]: [...current, office] },
        }
      })
      return office.id
    },
    []
  )

  const updateOffice = useCallback(
    (
      buildingId: string,
      officeId: string,
      patch: Partial<Pick<Office, "name" | "room">>
    ) => {
      setData((prev) => {
        const current = prev.offices[buildingId] ?? seedOfficesFor(buildingId)
        return {
          ...prev,
          offices: {
            ...prev.offices,
            [buildingId]: current.map((o) =>
              o.id === officeId ? { ...o, ...patch } : o
            ),
          },
        }
      })
    },
    []
  )

  const removeOffice = useCallback((buildingId: string, officeId: string) => {
    setData((prev) => {
      const current = prev.offices[buildingId] ?? seedOfficesFor(buildingId)
      const content = { ...prev.content }
      delete content[officeId]
      return {
        ...prev,
        offices: {
          ...prev.offices,
          [buildingId]: current.filter((o) => o.id !== officeId),
        },
        content,
      }
    })
  }, [])

  const addGuide = useCallback(
    (officeId: string, title: string, content: string) => {
      const guide: Guide = {
        id: createId("guide"),
        title,
        content,
        updatedAt: Date.now(),
      }
      setData((prev) => {
        const existing = prev.content[officeId] ?? emptyContent()
        return {
          ...prev,
          content: {
            ...prev.content,
            [officeId]: { ...existing, guides: [guide, ...existing.guides] },
          },
        }
      })
    },
    []
  )

  const updateGuide = useCallback(
    (
      officeId: string,
      guideId: string,
      patch: Partial<Pick<Guide, "title" | "content">>
    ) => {
      setData((prev) => {
        const existing = prev.content[officeId] ?? emptyContent()
        return {
          ...prev,
          content: {
            ...prev.content,
            [officeId]: {
              ...existing,
              guides: existing.guides.map((g) =>
                g.id === guideId ? { ...g, ...patch, updatedAt: Date.now() } : g
              ),
            },
          },
        }
      })
    },
    []
  )

  const removeGuide = useCallback((officeId: string, guideId: string) => {
    setData((prev) => {
      const existing = prev.content[officeId] ?? emptyContent()
      return {
        ...prev,
        content: {
          ...prev.content,
          [officeId]: {
            ...existing,
            guides: existing.guides.filter((g) => g.id !== guideId),
          },
        },
      }
    })
  }, [])

  const addNote = useCallback(
    (officeId: string, content: string, color: NoteColor) => {
      const note: Note = {
        id: createId("note"),
        content,
        color,
        updatedAt: Date.now(),
      }
      setData((prev) => {
        const existing = prev.content[officeId] ?? emptyContent()
        return {
          ...prev,
          content: {
            ...prev.content,
            [officeId]: { ...existing, notes: [note, ...existing.notes] },
          },
        }
      })
    },
    []
  )

  const registerQuery = useCallback(
    (buildingId: string, officeId?: string) => {
      const key = officeId ?? buildingId
      setData((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          queries: {
            ...prev.stats.queries,
            [key]: (prev.stats.queries[key] ?? 0) + 1,
          },
        },
      }))
    },
    []
  )

  const registerView = useCallback((buildingId: string, officeId?: string) => {
    const key = officeId ?? buildingId
    setData((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        views: {
          ...prev.stats.views,
          [key]: (prev.stats.views[key] ?? 0) + 1,
        },
      },
    }))
  }, [])

  return {
    getOffices,
    getContent,
    addOffice,
    updateOffice,
    removeOffice,
    addGuide,
    updateGuide,
    removeGuide,
    addNote,
    registerQuery,
    registerView,
    getStats: () => data.stats,
  }
}

export type CampusStore = ReturnType<typeof useCampusStore>
