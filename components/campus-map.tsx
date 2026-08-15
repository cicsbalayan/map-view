"use client"

import * as React from "react"
import { Locate, Minus, Plus } from "lucide-react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js"

import { Button } from "@/components/ui/button"
import {
  buildingCenter,
  BUILDINGS,
  GATE_COLOR,
  GATES,
  WORLD_DEPTH,
  WORLD_WIDTH,
} from "@/lib/campus-data"
import {
  benchAreaCenter,
  buildCampusScene,
  parkingLotCenter,
  type CampusScene3D,
} from "@/lib/three/campus-scene"
import type { Building, Gate, MapSelection, Point3 } from "@/lib/types"
import { cn } from "@/lib/utils"

const WORLD_CENTER = new THREE.Vector3(WORLD_WIDTH / 2, 0, -WORLD_DEPTH / 2)
const OVERVIEW_POS = new THREE.Vector3(800, 1150, 300)
const OVERVIEW_DIST = OVERVIEW_POS.distanceTo(WORLD_CENTER)
const MIN_DIST = 140
const MAX_DIST = 4200

const HIGHLIGHT_INTENSITY = 0.55
const NORMAL_INTENSITY = 0.08

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export interface CampusMapHandle {
  flyTo: (point: Point3, distance?: number) => void
  focus: (selection: MapSelection) => void
  resetView: () => void
}

interface CampusMapProps {
  selected: MapSelection
  onSelect: (selection: MapSelection) => void
  ref?: React.Ref<CampusMapHandle>
}

export const CampusMap = React.forwardRef<CampusMapHandle, CampusMapProps>(
  function CampusMap({ selected, onSelect }, ref) {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null)
    const css2dRef = React.useRef<CSS2DRenderer | null>(null)
    const campusRef = React.useRef<CampusScene3D | null>(null)
    const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null)
    const controlsRef = React.useRef<OrbitControls | null>(null)
    const rafRef = React.useRef<number>(0)
    const animRef = React.useRef<{
      fromPos: THREE.Vector3
      toPos: THREE.Vector3
      fromTarget: THREE.Vector3
      toTarget: THREE.Vector3
      start: number
      duration: number
    } | null>(null)

    const [zoom, setZoom] = React.useState(100)

    const flyToTarget = React.useCallback(
      (target: THREE.Vector3, distance?: number) => {
        const camera = cameraRef.current
        const controls = controlsRef.current
        if (!camera || !controls) return
        const dir = camera.position
          .clone()
          .sub(controls.target)
          .setY(Math.abs(camera.position.y - controls.target.y) * 0.9)
          .normalize()
        const dist = THREE.MathUtils.clamp(
          distance ?? OVERVIEW_DIST,
          MIN_DIST,
          MAX_DIST
        )
        animRef.current = {
          fromPos: camera.position.clone(),
          fromTarget: controls.target.clone(),
          toPos: target.clone().add(dir.multiplyScalar(dist)),
          toTarget: target.clone(),
          start: performance.now(),
          duration: 650,
        }
      },
      []
    )

    const flyTo = React.useCallback(
      (point: Point3, distance?: number) =>
        flyToTarget(new THREE.Vector3(point.x, 0, -point.z), distance),
      [flyToTarget]
    )

    const flyToBuilding = React.useCallback(
      (building: Building) => {
        const center = buildingCenter(building)
        const footprint = Math.hypot(building.foot.width, building.foot.depth)
        flyTo(center, Math.max(260, footprint * 1.7 + building.height * 2.6))
      },
      [flyTo]
    )

    const flyToGate = React.useCallback(
      (gate: Gate) => flyTo(gate.position, 260),
      [flyTo]
    )

    const applyHighlight = React.useCallback((selection: MapSelection) => {
      const campus = campusRef.current
      if (!campus) return
      const isSelected = (kind: string, id: string) =>
        selection?.kind === kind && selection.id === id
      campus.buildingMeshes.forEach((mesh, id) => {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach((mat) => {
          ;(mat as THREE.MeshLambertMaterial).emissiveIntensity = isSelected(
            "building",
            id
          )
            ? HIGHLIGHT_INTENSITY
            : NORMAL_INTENSITY
        })
      })
      campus.gateMeshes.forEach((mesh, id) => {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach((mat) => {
          ;(mat as THREE.MeshLambertMaterial).emissiveIntensity = isSelected("gate", id)
            ? HIGHLIGHT_INTENSITY
            : NORMAL_INTENSITY
        })
      })
    }, [])

    const focus = React.useCallback(
      (selection: MapSelection) => {
        if (!selection) return
        applyHighlight(selection)
        if (selection.kind === "building") {
          const building = BUILDINGS.find((b) => b.id === selection.id)
          if (building) flyToBuilding(building)
        } else {
          const gate = GATES.find((g) => g.id === selection.id)
          if (gate) flyToGate(gate)
        }
      },
      [applyHighlight, flyToBuilding, flyToGate]
    )

    const focusAndSelect = React.useCallback(
      (selection: MapSelection) => {
        focus(selection)
        onSelect(selection)
      },
      [focus, onSelect]
    )

    React.useImperativeHandle(
      ref,
      () => ({
        flyTo,
        focus,
        resetView: () => flyToTarget(WORLD_CENTER, OVERVIEW_DIST),
      }),
      [flyTo, focus, flyToTarget]
    )

    React.useEffect(() => {
      const container = containerRef.current
      if (!container) return

      const campus = buildCampusScene()
      const { scene } = campus
      const camera = new THREE.PerspectiveCamera(45, 1, 1, 12000)
      camera.position.copy(OVERVIEW_POS)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.domElement.style.position = "absolute"
      renderer.domElement.style.inset = "0"
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      container.appendChild(renderer.domElement)

      const css2d = new CSS2DRenderer()
      css2d.domElement.style.position = "absolute"
      css2d.domElement.style.inset = "0"
      css2d.domElement.style.pointerEvents = "none"
      container.appendChild(css2d.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.target.copy(WORLD_CENTER)
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.minDistance = MIN_DIST
      controls.maxDistance = MAX_DIST
      controls.maxPolarAngle = Math.PI / 2.35

      campusRef.current = campus
      cameraRef.current = camera
      rendererRef.current = renderer
      css2dRef.current = css2d
      controlsRef.current = controls
      applyHighlight(null)

      const resize = () => {
        const rect = container.getBoundingClientRect()
        const width = rect.width || 1
        const height = rect.height || 1
        renderer.setSize(width, height, false)
        css2d.setSize(width, height)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(container)

      const loop = () => {
        const anim = animRef.current
        if (anim) {
          const t = Math.min(
            1,
            (performance.now() - anim.start) / anim.duration
          )
          const k = easeInOut(t)
          camera.position.lerpVectors(anim.fromPos, anim.toPos, k)
          controls.target.lerpVectors(anim.fromTarget, anim.toTarget, k)
          if (t >= 1) animRef.current = null
        }
        controls.update()
        const next = Math.round(
          (OVERVIEW_DIST / camera.position.distanceTo(controls.target)) * 100
        )
        setZoom((prev) => (prev === next ? prev : next))
        renderer.render(scene, camera)
        css2d.render(scene, camera)
        rafRef.current = requestAnimationFrame(loop)
      }
      rafRef.current = requestAnimationFrame(loop)

      const raycaster = new THREE.Raycaster()
      const ndc = new THREE.Vector2()
      let downAt = { x: 0, y: 0, time: 0, active: false }
      const onPointerDown = (e: PointerEvent) => {
        downAt = { x: e.clientX, y: e.clientY, time: performance.now(), active: true }
      }
      const onPointerUp = (e: PointerEvent) => {
        if (!downAt.active) return
        const moved =
          Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 6 ||
          performance.now() - downAt.time > 500
        downAt.active = false
        if (moved) return
        const rect = renderer.domElement.getBoundingClientRect()
        ndc.set(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        )
        raycaster.setFromCamera(ndc, camera)
        const hits = raycaster.intersectObjects(campus.interactive, false)
        if (hits.length === 0) {
          onSelect(null)
          applyHighlight(null)
          return
        }
        const data = hits[0].object.userData as { kind: string; id: string }
        const building =
          data.kind === "building"
            ? BUILDINGS.find((b) => b.id === data.id)
            : null
        const gate = data.kind === "gate" ? GATES.find((g) => g.id === data.id) : null
        if (building) {
          flyToBuilding(building)
          onSelect({ kind: "building", id: building.id })
        } else if (gate) {
          flyToGate(gate)
          onSelect({ kind: "gate", id: gate.id })
        }
      }
      renderer.domElement.addEventListener("pointerdown", onPointerDown)
      renderer.domElement.addEventListener("pointerup", onPointerUp)

      return () => {
        cancelAnimationFrame(rafRef.current)
        ro.disconnect()
        renderer.domElement.removeEventListener("pointerdown", onPointerDown)
        renderer.domElement.removeEventListener("pointerup", onPointerUp)
        controls.dispose()
        renderer.dispose()
        scene.traverse((obj) => {
          const mesh = obj as THREE.Mesh
          if (mesh.geometry) mesh.geometry.dispose()
          const material = mesh.material as
            | THREE.Material
            | THREE.Material[]
            | undefined
          if (Array.isArray(material)) {
            material.forEach((m) => m.dispose())
          } else if (material) {
            material.dispose()
          }
        })
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement)
        }
        if (css2d.domElement.parentNode === container) {
          container.removeChild(css2d.domElement)
        }
      }
    }, [applyHighlight, flyToBuilding, flyToGate, onSelect])

    React.useEffect(() => {
      applyHighlight(selected)
    }, [selected, applyHighlight])

    const zoomIn = React.useCallback(() => {
      const camera = cameraRef.current
      const controls = controlsRef.current
      if (!camera || !controls) return
      flyToTarget(controls.target, camera.position.distanceTo(controls.target) / 1.45)
    }, [flyToTarget])

    const zoomOut = React.useCallback(() => {
      const camera = cameraRef.current
      const controls = controlsRef.current
      if (!camera || !controls) return
      flyToTarget(controls.target, camera.position.distanceTo(controls.target) * 1.45)
    }, [flyToTarget])

    const selectedId = selected?.id ?? null

    return (
      <div className="relative h-full w-full touch-none overflow-hidden select-none">
        <div ref={containerRef} className="absolute inset-0" />
        <div className="pointer-events-none absolute top-4 left-1/2 z-10 -translate-x-1/2">
          <p className="rounded-full border bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
            Drag to rotate · Scroll or pinch to zoom · Right-drag to pan
          </p>
        </div>

        <CompassRose />

        <div className="absolute bottom-4 left-4 z-10 w-56 rounded-xl border bg-background/90 p-3 shadow-md backdrop-blur">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Legend
          </p>
          <ul className="space-y-0.5">
            {BUILDINGS.map((building) => (
              <li key={building.id}>
                <button
                  type="button"
                  onClick={() =>
                    focusAndSelect({ kind: "building", id: building.id })
                  }
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-muted",
                    selectedId === building.id && "bg-muted"
                  )}
                >
                  <span
                    className="size-3 shrink-0 rounded-sm border border-black/10"
                    style={{ backgroundColor: building.color }}
                  />
                  <span className="truncate">
                    {building.shortName} <span className="text-muted-foreground">·</span>{" "}
                    {building.name}
                  </span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => focusAndSelect({ kind: "gate", id: "gate-1" })}
                className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-muted"
              >
                <span
                  className="size-3 shrink-0 rounded-sm border border-black/10"
                  style={{ backgroundColor: GATE_COLOR }}
                />
                <span>Entrance gates</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => flyTo(parkingLotCenter(), 420)}
                className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-muted"
              >
                <span
                  className="size-3 shrink-0 rounded-sm border border-black/10"
                  style={{ backgroundColor: "#5b626a" }}
                />
                <span>Parking lot</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => flyTo(benchAreaCenter(), 380)}
                className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-muted"
              >
                <span
                  className="size-3 shrink-0 rounded-sm border border-black/10"
                  style={{ backgroundColor: "#d43b3b" }}
                />
                <span>Bench area</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="absolute right-4 bottom-4 z-10 flex flex-col items-center gap-1 rounded-xl border bg-background/90 p-1.5 shadow-md backdrop-blur">
          <Button size="icon-sm" variant="outline" aria-label="Zoom in" onClick={zoomIn}>
            <Plus />
          </Button>
          <div className="px-1 text-center text-[11px] text-muted-foreground tabular-nums">
            {zoom}%
          </div>
          <Button size="icon-sm" variant="outline" aria-label="Zoom out" onClick={zoomOut}>
            <Minus />
          </Button>
          <div className="my-0.5 h-px w-6 bg-border" />
          <Button
            size="icon-sm"
            variant="outline"
            aria-label="Reset view"
            onClick={() => flyToTarget(WORLD_CENTER, OVERVIEW_DIST)}
          >
            <Locate />
          </Button>
        </div>
      </div>
    )
  }
)

function CompassRose() {
  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-xl border bg-background/90 p-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
      <svg viewBox="0 0 40 40" className="size-9" aria-label="North indicator">
        <circle cx={20} cy={20} r={17} className="fill-background stroke-border" strokeWidth={2} />
        <polygon points="20,5 23.5,20 16.5,20" fill="#f43f5e" />
        <polygon points="20,35 16.5,20 23.5,20" fill="currentColor" opacity={0.3} />
        <text x={20} y={26} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-muted-foreground">
          N
        </text>
      </svg>
    </div>
  )
}
