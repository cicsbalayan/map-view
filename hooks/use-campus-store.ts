"use client"

import { useCallback, useEffect, useSyncExternalStore } from "react"

import { officesFor } from "@/lib/offices"
import type { CampusStoreData, Office, Stats } from "@/lib/types"

const STORAGE_KEY = "campus-map-data-v1"

function emptyStats(): Stats {
  return { queries: {}, views: {} }
}

function emptyStoreData(): CampusStoreData {
  return { stats: emptyStats() }
}

function normalizeData(raw: unknown): CampusStoreData {
  const parsed = raw as Partial<CampusStoreData> | null | undefined
  return {
    stats: parsed?.stats ?? emptyStats(),
  }
}

const EMPTY_DATA = emptyStoreData()
let currentData: CampusStoreData = EMPTY_DATA
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return currentData
}

function getServerSnapshot() {
  return EMPTY_DATA
}

function commit(update: (prev: CampusStoreData) => CampusStoreData) {
  currentData = update(currentData)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData))
  } catch {
    // storage may be unavailable (private mode, quota) - ignore
  }
  listeners.forEach((listener) => listener())
}

function loadFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return
    }
    currentData = normalizeData(JSON.parse(raw))
    listeners.forEach((listener) => listener())
  } catch {
    // storage may be unavailable (private mode, quota) - ignore
  }
}

export function useCampusStore() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  useEffect(() => {
    loadFromStorage()
  }, [])

  const getOffices = useCallback(
    (buildingId: string): Office[] => officesFor(buildingId),
    []
  )

  const registerQuery = useCallback(
    (buildingId: string, officeId?: string) => {
      const key = officeId ?? buildingId
      commit((prev) => ({
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
    commit((prev) => ({
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
    registerQuery,
    registerView,
    getStats: () => data.stats,
  }
}

export type CampusStore = ReturnType<typeof useCampusStore>
