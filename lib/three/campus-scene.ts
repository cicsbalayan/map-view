import * as THREE from "three"
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js"

import {
  BENCH_AREA,
  BUILDINGS,
  GATE_COLOR,
  GATES,
  GREENS,
  GUARD_HOUSES,
  PARKING_LOT,
  TREES,
  WALL,
  WORLD_DEPTH,
  WORLD_WIDTH,
} from "@/lib/campus-data"
import type { Building, Gate, Point3 } from "@/lib/types"

export interface CampusScene3D {
  scene: THREE.Scene
  buildingMeshes: Map<string, THREE.Mesh>
  gateMeshes: Map<string, THREE.Mesh>
  interactive: THREE.Object3D[]
}

const GROUND = {
  base: 0x7d9c7f,
  grass: 0xa7d3aa,
  green: 0x8ed095,
  road: 0xd4d2cf,
  wall: 0xc2c4c6,
  wallPost: 0x9aa0a5,
  trunk: 0x8a5a2b,
  leaf: 0x2f9e44,
  lotPad: 0x5b626a,
  lotLine: 0xe8eaec,
  benchPad: 0x9aa4a8,
  bench: 0xd43b3b,
  benchLeg: 0x374151,
}

const CAR_COLORS = [
  0xdc2626, 0x2563eb, 0x16a34a, 0xf59e0b, 0x64748b, 0x7c3aed, 0x0ea5e9,
  0x334155,
]

function plane(w: number, d: number, color: number, y: number, x: number, z: number) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshLambertMaterial({ color })
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.set(x, y, z)
  return mesh
}

function lambertBox(
  width: number,
  height: number,
  depth: number,
  color: number
) {
  return new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    new THREE.MeshLambertMaterial({ color })
  )
}

function addGround(scene: THREE.Scene) {
  scene.add(
    plane(
      WORLD_WIDTH + 24,
      WORLD_DEPTH + 24,
      GROUND.base,
      -0.15,
      WORLD_WIDTH / 2,
      -WORLD_DEPTH / 2
    )
  )
  const grass = plane(
    WORLD_WIDTH,
    WORLD_DEPTH,
    GROUND.grass,
    0,
    WORLD_WIDTH / 2,
    -WORLD_DEPTH / 2
  )
  grass.receiveShadow = true
  scene.add(grass)

  const borderGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0.2, 0),
    new THREE.Vector3(WORLD_WIDTH, 0.2, 0),
    new THREE.Vector3(WORLD_WIDTH, 0.2, -WORLD_DEPTH),
    new THREE.Vector3(0, 0.2, -WORLD_DEPTH),
  ])
  scene.add(new THREE.LineLoop(borderGeo, new THREE.LineBasicMaterial({ color: 0x5b7c5d })))
}

function addGreens(scene: THREE.Scene) {
  GREENS.forEach((g) => {
    const mesh = lambertBox(g.width, 0.08, g.depth, GROUND.green)
    mesh.position.set(g.x + g.width / 2, 0.04, -(g.z + g.depth / 2))
    mesh.receiveShadow = true
    scene.add(mesh)
  })
}

function wallIntervals(min: number, max: number, gateCoord: number | null): [number, number][] {
  if (gateCoord === null || gateCoord <= min || gateCoord >= max) return [[min, max]]
  const half = WALL.gap / 2
  const intervals: [number, number][] = []
  if (min < gateCoord - half) intervals.push([min, gateCoord - half])
  if (gateCoord + half < max) intervals.push([gateCoord + half, max])
  return intervals
}

function addPerimeterWalls(scene: THREE.Scene) {
  const { height, thickness } = WALL
  const material = new THREE.MeshLambertMaterial({ color: GROUND.wall })

  const addWallSide = (
    alongX: boolean,
    fixed: number,
    from: number,
    to: number,
    gateCoord: number | null
  ) => {
    wallIntervals(from, to, gateCoord).forEach(([start, end]) => {
      const length = end - start
      const mesh = new THREE.Mesh(
        alongX
          ? new THREE.BoxGeometry(length, height, thickness)
          : new THREE.BoxGeometry(thickness, height, length),
        material
      )
      mesh.position.set(
        alongX ? (start + end) / 2 : fixed,
        height / 2,
        alongX ? -fixed : -((start + end) / 2)
      )
      mesh.castShadow = true
      mesh.receiveShadow = true
      scene.add(mesh)
    })
  }

  const gate1 = GATES.find((g) => g.id === "gate-1")!
  const gate2 = GATES.find((g) => g.id === "gate-2")!
  addWallSide(true, 0, 0, WORLD_WIDTH, gate1.position.x)
  addWallSide(true, WORLD_DEPTH, 0, WORLD_WIDTH, null)
  addWallSide(false, 0, 0, WORLD_DEPTH, null)
  addWallSide(false, WORLD_WIDTH, 0, WORLD_DEPTH, gate2.position.z)

  const postMat = new THREE.MeshLambertMaterial({ color: GROUND.wallPost })
  ;[
    [0, 0],
    [WORLD_WIDTH, 0],
    [0, WORLD_DEPTH],
    [WORLD_WIDTH, WORLD_DEPTH],
  ].forEach(([x, z]) => {
    const post = new THREE.Mesh(
      new THREE.BoxGeometry(thickness + 2, height, thickness + 2),
      postMat
    )
    post.position.set(x, height / 2, -z)
    scene.add(post)
  })
}

function addTrees(scene: THREE.Scene) {
  const trunkMat = new THREE.MeshLambertMaterial({ color: GROUND.trunk })
  const leafMat = new THREE.MeshLambertMaterial({ color: GROUND.leaf })
  TREES.forEach((tree) => {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8 * tree.size, 2.4 * tree.size, 7 * tree.size, 8),
      trunkMat
    )
    trunk.position.set(tree.x, 3.5 * tree.size, -tree.z)
    trunk.castShadow = true
    scene.add(trunk)
    const leaves = new THREE.Mesh(
      new THREE.IcosahedronGeometry(8.5 * tree.size, 1),
      leafMat
    )
    leaves.position.set(tree.x, 11 * tree.size, -tree.z)
    leaves.castShadow = true
    scene.add(leaves)
  })
}

function addParkingLot(scene: THREE.Scene) {
  const { x, z, width, depth } = PARKING_LOT
  const cx = x + width / 2
  const cz = z + depth / 2

  const pad = lambertBox(width, 0.18, depth, GROUND.lotPad)
  pad.position.set(cx, 0.09, -cz)
  pad.receiveShadow = true
  scene.add(pad)

  const lineMat = new THREE.MeshLambertMaterial({ color: GROUND.lotLine })
  const stallWidth = 8
  const cols = Math.floor(width / stallWidth)
  for (let i = 0; i <= cols; i++) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, depth), lineMat)
    line.position.set(x + i * stallWidth, 0.24, -cz)
    scene.add(line)
  }

  CAR_COLORS.forEach((color, i) => {
    const col = (i * 2) % cols
    const rowTop = i % 2 === 0
    const car = lambertBox(4.6, 1.7, 9, color)
    car.position.set(
      x + col * stallWidth + stallWidth / 2,
      0.85,
      rowTop ? -(z + 10.5) : -(z + depth - 10.5)
    )
    car.castShadow = true
    scene.add(car)
  })
}

function addBenchArea(scene: THREE.Scene) {
  const { x, z, width, depth } = BENCH_AREA
  const cx = x + width / 2
  const cz = z + depth / 2

  const pad = lambertBox(width, 0.18, depth, GROUND.benchPad)
  pad.position.set(cx, 0.09, -cz)
  pad.receiveShadow = true
  scene.add(pad)

  const postMat = new THREE.MeshLambertMaterial({ color: GROUND.benchLeg })

  const ROOF_HEIGHT = 20.5
  const posts = [
    { x: x + 1.5, z: z + 1.5 },
    { x: x + width - 1.5, z: z + 1.5 },
    { x: x + 1.5, z: z + depth - 1.5 },
    { x: x + width - 1.5, z: z + depth - 1.5 },
  ]
  posts.forEach((p) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(1.2, ROOF_HEIGHT, 1.2), postMat)
    post.position.set(p.x, ROOF_HEIGHT / 2, -p.z)
    post.castShadow = true
    scene.add(post)
  })

  const fascia = lambertBox(width + 5, 0.5, depth + 5, 0xb02e2e)
  fascia.position.set(cx, ROOF_HEIGHT + 0.25, -cz)
  scene.add(fascia)

  const roof = lambertBox(width + 6, 1, depth + 6, 0xd43b3b)
  roof.position.set(cx, ROOF_HEIGHT + 0.75, -cz)
  roof.castShadow = true
  scene.add(roof)

  const benchMat = new THREE.MeshLambertMaterial({ color: GROUND.bench })
  const legMat = new THREE.MeshLambertMaterial({ color: GROUND.benchLeg })

  const positions = [
    { x: cx, z: cz - 13 },
    { x: cx, z: cz },
    { x: cx, z: cz + 13 },
  ]
  positions.forEach((p) => {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.55, 8.5), benchMat)
    seat.position.set(p.x, 1.15, -p.z)
    seat.castShadow = true
    scene.add(seat)

    const back = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.7, 0.35), benchMat)
    back.position.set(p.x - 1.5, 2.2, -p.z)
    scene.add(back)

    for (const legZ of [-3.5, 3.5]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.8, 0.35), legMat)
      leg.position.set(p.x, 0.4, -(p.z + legZ))
      scene.add(leg)
    }
  })
}

function createFacadeTexture(
  floors: number,
  cols: number,
  withDoor: boolean,
  wall: THREE.Color
): THREE.Texture {
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D context unavailable")

  const FRAME = "#d43b3b"
  const WIN = "#0b0f14"
  const DOOR = "#111827"

  ctx.fillStyle = wall.getStyle()
  ctx.fillRect(0, 0, 512, 256)
  ctx.lineWidth = 2

  const band = 256 / floors
  const colW = 512 / cols
  const winW = colW * 0.56
  const winH = band * 0.42

  for (let f = 0; f < floors; f++) {
    const yBottom = 256 - (f + 1) * band
    if (f > 0) {
      ctx.fillStyle = FRAME
      ctx.fillRect(0, yBottom - 3, 512, 5)
    }
    const isGround = f === 0
    const yWin = yBottom + (band - winH) / 2
    for (let c = 0; c < cols; c++) {
      const x = c * colW + (colW - winW) / 2
      if (isGround && withDoor && c === Math.floor(cols / 2)) {
        const dw = winW * 1.5
        const dh = band * 0.62
        ctx.fillStyle = DOOR
        ctx.fillRect(x + (winW - dw) / 2, yBottom + 3, dw, dh)
        ctx.strokeStyle = FRAME
        ctx.strokeRect(x + (winW - dw) / 2, yBottom + 3, dw, dh)
        continue
      }
      ctx.fillStyle = WIN
      ctx.fillRect(x, yWin, winW, winH)
      ctx.strokeStyle = FRAME
      ctx.strokeRect(x, yWin, winW, winH)
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

function addBuildings(scene: THREE.Scene): Map<string, THREE.Mesh> {
  const meshes = new Map<string, THREE.Mesh>()
  BUILDINGS.forEach((building) => {
    const { width, depth } = building.foot
    const cx = building.foot.x + width / 2
    const cz = building.foot.z + depth / 2
    const color = new THREE.Color(building.color)
    const emissive = color.clone().multiplyScalar(0.1)
    const wall = new THREE.Color(building.wallColor ?? "#ffffff")
    const roofColor = new THREE.Color(building.roofColor ?? "#d43b3b")

    const frontCols = THREE.MathUtils.clamp(Math.round(width / 70), 2, 9)
    const sideCols = THREE.MathUtils.clamp(Math.round(depth / 70), 1, 6)
    const frontTex = createFacadeTexture(building.floors, frontCols, true, wall)
    const sideTex = createFacadeTexture(building.floors, sideCols, false, wall)
    const topMat = new THREE.MeshLambertMaterial({
      color: roofColor.getHex(),
      emissive,
    })

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width, building.height, depth),
      [
        new THREE.MeshLambertMaterial({ map: sideTex, emissive: emissive.clone() }),
        new THREE.MeshLambertMaterial({ map: sideTex, emissive: emissive.clone() }),
        topMat,
        topMat,
        new THREE.MeshLambertMaterial({ map: frontTex, emissive: emissive.clone() }),
        new THREE.MeshLambertMaterial({ map: frontTex, emissive: emissive.clone() }),
      ]
    )
    body.position.set(cx, building.height / 2, -cz)
    body.castShadow = true
    body.receiveShadow = true
    body.userData = { kind: "building", id: building.id }
    scene.add(body)
    meshes.set(building.id, body)

    const base = lambertBox(
      width + 4,
      1.6,
      depth + 4,
      0xe9eaee
    )
    base.position.set(cx, 0.8, -cz)
    base.receiveShadow = true
    scene.add(base)

    const roof = lambertBox(width + 2, 1.2, depth + 2, roofColor.getHex())
    roof.position.set(cx, building.height + 0.6, -cz)
    roof.castShadow = true
    scene.add(roof)

    const acMat = new THREE.MeshLambertMaterial({ color: 0x9aa3ab })
    const acPositions: [number, number][] = [
      [-width / 4 + 12, -depth / 4 + 10],
      [width / 4 - 12, -depth / 4 + 10],
      [0, -depth / 4 + 12],
    ]
    acPositions.forEach(([ox, oz]) => {
      const ac = new THREE.Mesh(new THREE.BoxGeometry(7, 2.6, 6), acMat)
      ac.position.set(cx + ox, building.height + 1.3, -cz + oz)
      ac.castShadow = true
      scene.add(ac)
    })

    scene.add(createBuildingLabel(building, cx, building.height, cz))
  })
  return meshes
}

function addGates(scene: THREE.Scene): Map<string, THREE.Mesh> {
  const meshes = new Map<string, THREE.Mesh>()
  GATES.forEach((gate) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 4, 26, 12),
      new THREE.MeshLambertMaterial({ color: 0x334155 })
    )
    pole.position.set(gate.position.x, 13, -gate.position.z)
    pole.castShadow = true
    scene.add(pole)

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(11, 24, 16),
      new THREE.MeshLambertMaterial({ color: new THREE.Color(GATE_COLOR) })
    )
    sphere.position.set(gate.position.x, 30, -gate.position.z)
    sphere.userData = { kind: "gate", id: gate.id }
    scene.add(sphere)
    meshes.set(gate.id, sphere)

    scene.add(createGateLabel(gate))
  })
  return meshes
}

function addGuardHouses(scene: THREE.Scene) {
  const wall = new THREE.Color("#ffffff")
  const emissive = new THREE.Color(0xffffff).multiplyScalar(0.05)

  GUARD_HOUSES.forEach((house) => {
    const { width, depth, height, floors } = house

    const frontCols = THREE.MathUtils.clamp(Math.round(width / 70), 2, 9)
    const sideCols = THREE.MathUtils.clamp(Math.round(depth / 70), 1, 6)
    const frontTex = createFacadeTexture(floors, frontCols, true, wall)
    const sideTex = createFacadeTexture(floors, sideCols, false, wall)

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      [
        new THREE.MeshLambertMaterial({ map: sideTex, emissive: emissive.clone() }),
        new THREE.MeshLambertMaterial({ map: sideTex, emissive: emissive.clone() }),
        new THREE.MeshLambertMaterial({ color: 0xd43b3b, emissive: emissive.clone() }),
        new THREE.MeshLambertMaterial({ color: 0xd43b3b, emissive: emissive.clone() }),
        new THREE.MeshLambertMaterial({ map: frontTex, emissive: emissive.clone() }),
        new THREE.MeshLambertMaterial({ map: frontTex, emissive: emissive.clone() }),
      ]
    )
    body.position.set(house.position.x, height / 2, -house.position.z)
    body.castShadow = true
    body.receiveShadow = true
    scene.add(body)

    const base = lambertBox(width + 4, 1.6, depth + 4, 0xe9eaee)
    base.position.set(house.position.x, 0.8, -house.position.z)
    base.receiveShadow = true
    scene.add(base)

    const roof = lambertBox(width + 2, 1.2, depth + 2, 0xd43b3b)
    roof.position.set(house.position.x, height + 0.6, -house.position.z)
    roof.castShadow = true
    scene.add(roof)
  })
}

function createBuildingLabel(building: Building, cx: number, height: number, cz: number) {
  const box = document.createElement("div")
  box.style.cssText =
    "pointer-events:none;user-select:none;text-align:center;background:rgba(255,255,255,0.92);" +
    "border:1px solid rgba(15,23,42,0.12);border-radius:8px;padding:3px 9px;" +
    "box-shadow:0 1px 3px rgba(0,0,0,0.18);font-family:var(--font-sans),sans-serif;"
  const title = document.createElement("div")
  title.style.cssText = "font-size:11px;font-weight:700;line-height:1.2;color:#0f172a;"
  title.textContent = building.shortName
  const sub = document.createElement("div")
  sub.style.cssText = "font-size:9px;line-height:1.2;color:#475569;"
  sub.textContent = building.name
  box.appendChild(title)
  box.appendChild(sub)
  const obj = new CSS2DObject(box)
  obj.position.set(cx, height + 4, -cz)
  return obj
}

function createGateLabel(gate: Gate) {
  const box = document.createElement("div")
  box.style.cssText =
    "pointer-events:none;user-select:none;text-align:center;background:#f43f5e;color:#fff;" +
    "border-radius:9999px;padding:2px 10px;box-shadow:0 1px 3px rgba(0,0,0,0.25);" +
    "font-size:11px;font-weight:700;font-family:var(--font-sans),sans-serif;"
  box.textContent = gate.name
  const obj = new CSS2DObject(box)
  obj.position.set(gate.position.x, 46, -gate.position.z)
  return obj
}

export function buildCampusScene(): CampusScene3D {
  const scene = new THREE.Scene()

  scene.add(new THREE.AmbientLight(0xffffff, 0.6))
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6b7a5a, 0.5))
  const sun = new THREE.DirectionalLight(0xffffff, 1.15)
  sun.position.set(600, 950, 260)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  const shadowCam = sun.shadow.camera
  shadowCam.left = -900
  shadowCam.right = 900
  shadowCam.top = 900
  shadowCam.bottom = -900
  shadowCam.near = 200
  shadowCam.far = 2600
  scene.add(sun)

  addGround(scene)
  addGreens(scene)
  addPerimeterWalls(scene)
  addTrees(scene)
  addParkingLot(scene)
  addBenchArea(scene)
  const buildingMeshes = addBuildings(scene)
  const gateMeshes = addGates(scene)
  addGuardHouses(scene)

  return {
    scene,
    buildingMeshes,
    gateMeshes,
    interactive: [
      ...buildingMeshes.values(),
      ...gateMeshes.values(),
    ],
  }
}

export function parkingLotCenter(): Point3 {
  return {
    x: PARKING_LOT.x + PARKING_LOT.width / 2,
    z: PARKING_LOT.z + PARKING_LOT.depth / 2,
  }
}

export function benchAreaCenter(): Point3 {
  return {
    x: BENCH_AREA.x + BENCH_AREA.width / 2,
    z: BENCH_AREA.z + BENCH_AREA.depth / 2,
  }
}
