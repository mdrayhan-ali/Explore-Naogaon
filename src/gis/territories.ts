import {
  areaKm2,
  bboxOf,
  centroidOf,
  clipToCloserSide,
  distanceKm,
  pointInMultiPolygon,
  sharedBoundaryLengths,
  vertexKeys,
} from './geometry.ts'
import type { BBox, MultiPolygonCoords, Position } from './geometry.ts'

/**
 * Splits one upazila into visual territories made of whole union (and paurashava)
 * areas, so every border follows a real administrative boundary.
 *
 *  1. Each attraction claims the union its pin falls in.
 *  2. Free unions are then claimed one at a time by the attraction that is currently
 *     the "smallest for its weight" and touches a free union, picking the free union
 *     that shares the longest border with it. Regions therefore stay contiguous and
 *     more important attractions end up with proportionally more land.
 *  3. If two attractions sit in the same union, only that union is split along the
 *     perpendicular bisector of the two pins. This is the one place a straight line
 *     can appear.
 */

export type TerritoryUnit = {
  id: string
  geometry: MultiPolygonCoords
}

export type TerritorySeed = {
  id: string
  anchors: Position[]
  weight: number
}

export type TerritoryPiece = {
  unitId: string
  geometry: MultiPolygonCoords
  isSplit: boolean
}

export type TerritoryResult = {
  pieces: Map<string, TerritoryPiece[]>
  warnings: string[]
}

type Node = {
  unitId: string
  geometry: MultiPolygonCoords
  area: number
  centroid: Position
  owner: number | null
  isSplit: boolean
  parentIndex: number
}

const SPLIT_ADJACENCY_LENGTH_KM = 0.0005

function pairKey(a: number, b: number) {
  return a < b ? `${a}|${b}` : `${b}|${a}`
}

export function partitionTerritories(units: TerritoryUnit[], seeds: TerritorySeed[]): TerritoryResult {
  const warnings: string[] = []
  const pieces = new Map<string, TerritoryPiece[]>(seeds.map((seed) => [seed.id, []]))
  if (units.length === 0 || seeds.length === 0) return { pieces, warnings }

  const boxes: BBox[] = units.map((unit) => bboxOf(unit.geometry))

  // 1. Locate the union that contains each attraction pin.
  const seedUnits: Map<number, Position>[] = seeds.map(() => new Map())
  const activeSeeds: number[] = []
  seeds.forEach((seed, seedIndex) => {
    for (const anchor of seed.anchors) {
      const unitIndex = units.findIndex((unit, index) => {
        const [minX, minY, maxX, maxY] = boxes[index]
        return anchor[0] >= minX && anchor[0] <= maxX && anchor[1] >= minY && anchor[1] <= maxY &&
          pointInMultiPolygon(anchor, unit.geometry)
      })
      if (unitIndex < 0) {
        warnings.push(`${seed.id}: a pin is not inside any union of this upazila and was ignored.`)
        continue
      }
      if (!seedUnits[seedIndex].has(unitIndex)) seedUnits[seedIndex].set(unitIndex, anchor)
    }
    if (seedUnits[seedIndex].size > 0) activeSeeds.push(seedIndex)
    else warnings.push(`${seed.id}: no usable pin, so no territory was generated.`)
  })
  if (activeSeeds.length === 0) return { pieces, warnings }

  const seedsByUnit = new Map<number, { seedIndex: number; anchor: Position }[]>()
  for (const seedIndex of activeSeeds) {
    for (const [unitIndex, anchor] of seedUnits[seedIndex]) {
      const list = seedsByUnit.get(unitIndex) ?? []
      list.push({ seedIndex, anchor })
      seedsByUnit.set(unitIndex, list)
    }
  }

  // 2. Build working nodes. A union holding several pins is replaced by split cells.
  const nodes: Node[] = []
  units.forEach((unit, unitIndex) => {
    const holders = seedsByUnit.get(unitIndex) ?? []
    if (holders.length <= 1) {
      nodes.push({
        unitId: unit.id,
        geometry: unit.geometry,
        area: areaKm2(unit.geometry),
        centroid: centroidOf(unit.geometry),
        owner: holders.length === 1 ? holders[0].seedIndex : null,
        isSplit: false,
        parentIndex: unitIndex,
      })
      return
    }
    warnings.push(
      `${unit.id}: ${holders.map((holder) => seeds[holder.seedIndex].id).join(', ')} share one union, so it was split along the midline between their pins.`,
    )
    for (const holder of holders) {
      let cell = unit.geometry
      for (const other of holders) {
        if (other !== holder) cell = clipToCloserSide(cell, holder.anchor, other.anchor)
      }
      nodes.push({
        unitId: `${unit.id}::${seeds[holder.seedIndex].id}`,
        geometry: cell,
        area: areaKm2(cell),
        centroid: centroidOf(cell),
        owner: holder.seedIndex,
        isSplit: true,
        parentIndex: unitIndex,
      })
    }
  })

  // 3. Neighbour graph from shared border length.
  const shared = sharedBoundaryLengths(nodes.map((node) => node.geometry))
  const cellKeys = new Map<number, Set<string>>()
  nodes.forEach((node, index) => {
    if (node.isSplit) cellKeys.set(index, vertexKeys(node.geometry))
  })
  if (cellKeys.size > 0) {
    // A split cell only touches its neighbours along original (unsplit) vertices.
    const plainKeys = new Map<number, Set<string>>()
    nodes.forEach((node, index) => plainKeys.set(index, cellKeys.get(index) ?? vertexKeys(node.geometry)))
    for (const index of cellKeys.keys()) {
      nodes.forEach((other, otherIndex) => {
        if (otherIndex === index || other.parentIndex === nodes[index].parentIndex) return
        const key = pairKey(index, otherIndex)
        if (shared.has(key)) return
        const otherKeys = plainKeys.get(otherIndex) ?? new Set<string>()
        for (const vertex of cellKeys.get(index) ?? []) {
          if (otherKeys.has(vertex)) {
            shared.set(key, SPLIT_ADJACENCY_LENGTH_KM)
            break
          }
        }
      })
    }
  }
  const neighbours: Map<number, number>[] = nodes.map(() => new Map())
  for (const [key, length] of shared) {
    const [a, b] = key.split('|').map(Number)
    neighbours[a].set(b, length)
    neighbours[b].set(a, length)
  }

  // 4. Weighted contiguous growth.
  const claimedArea = seeds.map(() => 0)
  nodes.forEach((node) => {
    if (node.owner !== null) claimedArea[node.owner] += node.area
  })

  function frontier(seedIndex: number) {
    const candidates = new Map<number, number>()
    nodes.forEach((node, index) => {
      if (node.owner !== seedIndex) return
      for (const [neighbour, length] of neighbours[index]) {
        if (nodes[neighbour].owner === null) candidates.set(neighbour, (candidates.get(neighbour) ?? 0) + length)
      }
    })
    return candidates
  }

  function nearestAnchorDistance(node: Node, seedIndex: number) {
    let best = Infinity
    for (const anchor of seeds[seedIndex].anchors) best = Math.min(best, distanceKm(node.centroid, anchor))
    return best
  }

  for (;;) {
    let chosenSeed = -1
    let chosenRatio = Infinity
    let chosenFrontier: Map<number, number> | null = null
    for (const seedIndex of activeSeeds) {
      const candidates = frontier(seedIndex)
      if (candidates.size === 0) continue
      const ratio = claimedArea[seedIndex] / Math.max(seeds[seedIndex].weight, 0.01)
      const better = ratio < chosenRatio - 1e-9 ||
        (Math.abs(ratio - chosenRatio) <= 1e-9 && chosenSeed >= 0 && seeds[seedIndex].id < seeds[chosenSeed].id)
      if (better) {
        chosenSeed = seedIndex
        chosenRatio = ratio
        chosenFrontier = candidates
      }
    }
    if (chosenSeed < 0 || !chosenFrontier) break

    let pick = -1
    let pickLength = -1
    let pickDistance = Infinity
    for (const [index, length] of chosenFrontier) {
      const distance = nearestAnchorDistance(nodes[index], chosenSeed)
      const better = length > pickLength + 1e-9 ||
        (Math.abs(length - pickLength) <= 1e-9 &&
          (distance < pickDistance - 1e-9 || (Math.abs(distance - pickDistance) <= 1e-9 && nodes[index].unitId < nodes[pick].unitId)))
      if (better) {
        pick = index
        pickLength = length
        pickDistance = distance
      }
    }
    nodes[pick].owner = chosenSeed
    claimedArea[chosenSeed] += nodes[pick].area
  }

  // Safety net: any area unreachable through shared borders goes to the nearest pin.
  nodes.forEach((node) => {
    if (node.owner !== null) return
    let best = activeSeeds[0]
    let bestDistance = Infinity
    for (const seedIndex of activeSeeds) {
      const distance = nearestAnchorDistance(node, seedIndex)
      if (distance < bestDistance) {
        best = seedIndex
        bestDistance = distance
      }
    }
    node.owner = best
    warnings.push(`${node.unitId}: not connected to any territory through a shared border; assigned to the nearest pin.`)
  })

  for (const node of nodes) {
    if (node.owner === null) continue
    pieces.get(seeds[node.owner].id)?.push({ unitId: node.unitId, geometry: node.geometry, isSplit: node.isSplit })
  }
  return { pieces, warnings }
}
