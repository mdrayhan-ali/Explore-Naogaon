// Small, dependency-free planar geometry helpers used by the territory engine.
// Coordinates are WGS84 [longitude, latitude]. Areas and distances use a local
// equirectangular projection, which is accurate enough at the scale of one district.

export type Position = [number, number]
export type Ring = Position[]
export type PolygonCoords = Ring[]
export type MultiPolygonCoords = PolygonCoords[]

export type BBox = [minX: number, minY: number, maxX: number, maxY: number]

const KM_PER_DEGREE_LAT = 110.574
const KM_PER_DEGREE_LON_EQUATOR = 111.32
const DEFAULT_LATITUDE = 24.8

export function toMultiPolygon(geometry: {
  type: string
  coordinates: unknown
}): MultiPolygonCoords {
  if (geometry.type === 'Polygon') return [geometry.coordinates as PolygonCoords]
  if (geometry.type === 'MultiPolygon') return geometry.coordinates as MultiPolygonCoords
  return []
}

/** Signed shoelace area in raw degree space. Positive means counter-clockwise. */
export function signedRingArea(ring: Ring): number {
  let sum = 0
  for (let i = 0; i < ring.length - 1; i += 1) {
    sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
  }
  return sum / 2
}

function closedRing(ring: Ring): Ring {
  if (ring.length === 0) return ring
  const first = ring[0]
  const last = ring[ring.length - 1]
  return first[0] === last[0] && first[1] === last[1] ? ring : [...ring, first]
}

/** Outer rings counter-clockwise, holes clockwise, every ring explicitly closed. */
export function normalizeMultiPolygon(multi: MultiPolygonCoords): MultiPolygonCoords {
  return multi
    .map((polygon) => polygon.map(closedRing).filter((ring) => ring.length >= 4))
    .filter((polygon) => polygon.length > 0)
    .map((polygon) => polygon.map((ring, index) => {
      const isCounterClockwise = signedRingArea(ring) > 0
      const wantCounterClockwise = index === 0
      return isCounterClockwise === wantCounterClockwise ? ring : [...ring].reverse()
    }))
}

export function bboxOf(multi: MultiPolygonCoords): BBox {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const polygon of multi) {
    for (const [x, y] of polygon[0] ?? []) {
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }
  return [minX, minY, maxX, maxY]
}

function pointInRing([x, y]: Position, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export function pointInPolygon(position: Position, polygon: PolygonCoords): boolean {
  if (!pointInRing(position, polygon[0])) return false
  for (let i = 1; i < polygon.length; i += 1) {
    if (pointInRing(position, polygon[i])) return false
  }
  return true
}

export function pointInMultiPolygon(position: Position, multi: MultiPolygonCoords): boolean {
  return multi.some((polygon) => pointInPolygon(position, polygon))
}

/** Area in square kilometres (outer rings minus holes). */
export function areaKm2(multi: MultiPolygonCoords): number {
  let total = 0
  for (const polygon of multi) {
    polygon.forEach((ring, index) => {
      if (ring.length < 4) return
      const meanLat = ring.reduce((sum, [, y]) => sum + y, 0) / ring.length || DEFAULT_LATITUDE
      const scale = KM_PER_DEGREE_LON_EQUATOR * Math.cos((meanLat * Math.PI) / 180) * KM_PER_DEGREE_LAT
      const area = Math.abs(signedRingArea(ring)) * scale
      total += index === 0 ? area : -area
    })
  }
  return Math.max(total, 0)
}

export function centroidOf(multi: MultiPolygonCoords): Position {
  let bestArea = -1
  let best: Position = [0, 0]
  for (const polygon of multi) {
    const ring = polygon[0]
    if (!ring || ring.length < 4) continue
    let a = 0
    let cx = 0
    let cy = 0
    for (let i = 0; i < ring.length - 1; i += 1) {
      const cross = ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
      a += cross
      cx += (ring[i][0] + ring[i + 1][0]) * cross
      cy += (ring[i][1] + ring[i + 1][1]) * cross
    }
    if (a === 0) continue
    const area = Math.abs(a / 2)
    if (area > bestArea) {
      bestArea = area
      best = [cx / (3 * a), cy / (3 * a)]
    }
  }
  return best
}

export function distanceKm(a: Position, b: Position): number {
  const meanLat = (a[1] + b[1]) / 2
  const dx = (a[0] - b[0]) * KM_PER_DEGREE_LON_EQUATOR * Math.cos((meanLat * Math.PI) / 180)
  const dy = (a[1] - b[1]) * KM_PER_DEGREE_LAT
  return Math.hypot(dx, dy)
}

// ---------------------------------------------------------------------------
// Edge utilities and dissolve
// ---------------------------------------------------------------------------

const KEY_DECIMALS = 6

export function vertexKey([x, y]: Position): string {
  return `${x.toFixed(KEY_DECIMALS)},${y.toFixed(KEY_DECIMALS)}`
}

function eachEdge(multi: MultiPolygonCoords, visit: (a: Position, b: Position) => void) {
  for (const polygon of multi) {
    for (const ring of polygon) {
      for (let i = 0; i < ring.length - 1; i += 1) {
        if (vertexKey(ring[i]) !== vertexKey(ring[i + 1])) visit(ring[i], ring[i + 1])
      }
    }
  }
}

/** Every distinct vertex key of the geometry (used for neighbour detection). */
export function vertexKeys(multi: MultiPolygonCoords): Set<string> {
  const keys = new Set<string>()
  for (const polygon of multi) {
    for (const ring of polygon) ring.forEach((position) => keys.add(vertexKey(position)))
  }
  return keys
}

/**
 * Length (km) of boundary shared between pairs of parts, keyed by part index pair
 * `${low}|${high}`. Parts must come from one topologically consistent dataset so
 * that neighbouring polygons carry identical vertices along their common border.
 */
export function sharedBoundaryLengths(parts: MultiPolygonCoords[]): Map<string, number> {
  const owners = new Map<string, { part: number; length: number }[]>()
  parts.forEach((multi, part) => {
    eachEdge(multi, (a, b) => {
      const ka = vertexKey(a)
      const kb = vertexKey(b)
      const key = ka < kb ? `${ka}>${kb}` : `${kb}>${ka}`
      const list = owners.get(key) ?? []
      if (!list.some((item) => item.part === part)) list.push({ part, length: distanceKm(a, b) })
      owners.set(key, list)
    })
  })
  const shared = new Map<string, number>()
  for (const list of owners.values()) {
    if (list.length < 2) continue
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        const low = Math.min(list[i].part, list[j].part)
        const high = Math.max(list[i].part, list[j].part)
        const key = `${low}|${high}`
        shared.set(key, (shared.get(key) ?? 0) + list[i].length)
      }
    }
  }
  return shared
}

/**
 * Merges polygons that share exact boundary edges into the outline of their union.
 * Shared interior edges cancel out; what remains is chained into closed rings.
 */
export function dissolve(parts: MultiPolygonCoords[]): MultiPolygonCoords {
  const live = new Map<string, { a: Position; b: Position }>()
  for (const part of parts) {
    for (const polygon of normalizeMultiPolygon(part)) {
      for (const ring of polygon) {
        for (let i = 0; i < ring.length - 1; i += 1) {
          const a = ring[i]
          const b = ring[i + 1]
          const ka = vertexKey(a)
          const kb = vertexKey(b)
          if (ka === kb) continue
          const reverse = `${kb}>${ka}`
          if (live.has(reverse)) live.delete(reverse)
          else live.set(`${ka}>${kb}`, { a, b })
        }
      }
    }
  }

  const outgoing = new Map<string, { a: Position; b: Position; used: boolean }[]>()
  for (const edge of live.values()) {
    const key = vertexKey(edge.a)
    const list = outgoing.get(key) ?? []
    list.push({ ...edge, used: false })
    outgoing.set(key, list)
  }

  const loops: Ring[] = []
  for (const list of outgoing.values()) {
    for (const first of list) {
      if (first.used) continue
      const ring: Ring = [first.a]
      let edge: { a: Position; b: Position; used: boolean } | undefined = first
      const startKey = vertexKey(first.a)
      while (edge && !edge.used) {
        edge.used = true
        ring.push(edge.b)
        const nextKey = vertexKey(edge.b)
        if (nextKey === startKey) break
        edge = outgoing.get(nextKey)?.find((candidate) => !candidate.used)
      }
      if (ring.length >= 4 && vertexKey(ring[0]) === vertexKey(ring[ring.length - 1])) loops.push(ring)
    }
  }

  const outers: { ring: Ring; area: number }[] = []
  const holes: Ring[] = []
  for (const ring of loops) {
    const area = signedRingArea(ring)
    if (area > 0) outers.push({ ring, area })
    else if (area < 0) holes.push(ring)
  }
  const polygons: MultiPolygonCoords = outers.map((outer) => [outer.ring])
  for (const hole of holes) {
    let owner = -1
    let ownerArea = Infinity
    outers.forEach((outer, index) => {
      if (outer.area < ownerArea && pointInRing(hole[0], outer.ring)) {
        owner = index
        ownerArea = outer.area
      }
    })
    if (owner >= 0) polygons[owner].push(hole)
  }
  return polygons
}

// ---------------------------------------------------------------------------
// Half-plane clipping (used only to split a single union between two attractions)
// ---------------------------------------------------------------------------

/**
 * Keeps the part of the geometry closer to `keep` than to `other`.
 * Works in a locally scaled plane so the bisector is a straight line on screen.
 * Holes are dropped: the result is a visual territory, not a survey boundary.
 */
export function clipToCloserSide(multi: MultiPolygonCoords, keep: Position, other: Position): MultiPolygonCoords {
  const scale = Math.cos((keep[1] * Math.PI) / 180)
  const px = keep[0] * scale
  const py = keep[1]
  const qx = other[0] * scale
  const qy = other[1]
  // A point (x, y) is on the keep side when nx * x + ny * y <= limit.
  const nx = qx - px
  const ny = qy - py
  const limit = (qx * qx + qy * qy - px * px - py * py) / 2
  const inside = ([x, y]: Position) => nx * x * scale + ny * y <= limit + 1e-15

  const result: MultiPolygonCoords = []
  for (const polygon of multi) {
    const ring = polygon[0]
    if (!ring || ring.length < 4) continue
    const open = ring.slice(0, -1)
    const clipped: Ring = []
    for (let i = 0; i < open.length; i += 1) {
      const current = open[i]
      const previous = open[(i + open.length - 1) % open.length]
      const currentInside = inside(current)
      const previousInside = inside(previous)
      if (currentInside !== previousInside) {
        const dCurrent = nx * current[0] * scale + ny * current[1] - limit
        const dPrevious = nx * previous[0] * scale + ny * previous[1] - limit
        const t = dPrevious / (dPrevious - dCurrent)
        clipped.push([
          previous[0] + (current[0] - previous[0]) * t,
          previous[1] + (current[1] - previous[1]) * t,
        ])
      }
      if (currentInside) clipped.push(current)
    }
    if (clipped.length >= 3) result.push([[...clipped, clipped[0]]])
  }
  return result
}

/** Distance from a point to a segment, squared. */
function segmentDistanceSq(px: number, py: number, a: Position, b: Position): number {
  let x = a[0]
  let y = a[1]
  let dx = b[0] - x
  let dy = b[1] - y
  if (dx !== 0 || dy !== 0) {
    const t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy)
    if (t > 1) {
      x = b[0]
      y = b[1]
    } else if (t > 0) {
      x += dx * t
      y += dy * t
    }
  }
  dx = px - x
  dy = py - y
  return dx * dx + dy * dy
}

/** Signed distance from a point to a polygon's outline: positive inside, negative outside. */
function signedDistanceToPolygon(px: number, py: number, polygon: PolygonCoords): number {
  let inside = false
  let minDistSq = Infinity
  for (const ring of polygon) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i]
      const b = ring[j]
      if ((a[1] > py) !== (b[1] > py) && px < ((b[0] - a[0]) * (py - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside
      minDistSq = Math.min(minDistSq, segmentDistanceSq(px, py, a, b))
    }
  }
  return (inside ? 1 : -1) * Math.sqrt(minDistSq)
}

/**
 * The most "inside" point of a polygon: the point farthest from every edge (the pole of
 * inaccessibility). Unlike a centroid it always lies inside, even for crescent or L shapes,
 * so it is a good place for a map pin or label. Works on any planar coordinates.
 */
export function poleOfInaccessibility(polygon: PolygonCoords, precision = 1): Position {
  const outer = polygon[0] ?? []
  if (outer.length === 0) return [0, 0]
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of outer) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  const width = maxX - minX
  const height = maxY - minY
  const cellSize = Math.min(width, height)
  if (cellSize === 0) return [minX, minY]

  type Cell = { x: number; y: number; h: number; d: number; max: number }
  const makeCell = (x: number, y: number, h: number): Cell => {
    const d = signedDistanceToPolygon(x, y, polygon)
    return { x, y, h, d, max: d + h * Math.SQRT2 }
  }

  const queue: Cell[] = []
  let h = cellSize / 2
  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) queue.push(makeCell(x + h, y + h, h))
  }

  // Start from the middle of the box, so simple shapes settle on their true middle.
  let best = makeCell(minX + width / 2, minY + height / 2, 0)
  for (const cell of queue) if (cell.d > best.d) best = cell

  while (queue.length > 0) {
    queue.sort((a, b) => a.max - b.max)
    const cell = queue.pop()!
    if (cell.d > best.d) best = cell
    if (cell.max - best.d <= precision) continue
    h = cell.h / 2
    queue.push(
      makeCell(cell.x - h, cell.y - h, h),
      makeCell(cell.x + h, cell.y - h, h),
      makeCell(cell.x - h, cell.y + h, h),
      makeCell(cell.x + h, cell.y + h, h),
    )
  }
  return [best.x, best.y]
}
