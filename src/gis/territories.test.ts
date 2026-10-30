import { describe, expect, it } from 'vitest'
import { areaKm2, sharedBoundaryLengths } from './geometry'
import type { MultiPolygonCoords } from './geometry'
import { partitionTerritories } from './territories'

// A 4 x 4 grid of union-sized squares that share exact edges, like real union data.
const SIZE = 0.05
const units = Array.from({ length: 16 }, (_, index) => {
  const x = 88 + (index % 4) * SIZE
  const y = 24 + Math.floor(index / 4) * SIZE
  const geometry: MultiPolygonCoords = [[[[x, y], [x + SIZE, y], [x + SIZE, y + SIZE], [x, y + SIZE], [x, y]]]]
  return { id: `u${index}`, geometry }
})
const centre = (index: number): [number, number] => [88 + (index % 4) * SIZE + SIZE / 2, 24 + Math.floor(index / 4) * SIZE + SIZE / 2]

function isConnected(ids: string[]) {
  const index = new Map(units.map((unit, i) => [unit.id, i]))
  const shared = sharedBoundaryLengths(units.map((unit) => unit.geometry))
  const adjacent = (a: string, b: string) => {
    const i = index.get(a)!
    const j = index.get(b)!
    return shared.has(`${Math.min(i, j)}|${Math.max(i, j)}`)
  }
  const seen = new Set([ids[0]])
  const stack = [ids[0]]
  while (stack.length > 0) {
    const current = stack.pop()!
    for (const other of ids) {
      if (!seen.has(other) && adjacent(current, other)) {
        seen.add(other)
        stack.push(other)
      }
    }
  }
  return seen.size === ids.length
}

describe('union territory partition', () => {
  it('assigns every union exactly once and keeps every territory in one piece', () => {
    const result = partitionTerritories(units, [
      { id: 'a', anchors: [centre(0)], weight: 1 },
      { id: 'b', anchors: [centre(15)], weight: 1 },
      { id: 'c', anchors: [centre(3)], weight: 1 },
    ])
    const all = [...result.pieces.values()].flat().map((piece) => piece.unitId)
    expect(all).toHaveLength(16)
    expect(new Set(all).size).toBe(16)
    for (const pieces of result.pieces.values()) {
      expect(pieces.length).toBeGreaterThan(0)
      expect(isConnected(pieces.map((piece) => piece.unitId))).toBe(true)
    }
    expect(result.warnings).toEqual([])
  })

  it('keeps each pin inside the territory of its own attraction', () => {
    const result = partitionTerritories(units, [
      { id: 'a', anchors: [centre(5)], weight: 1 },
      { id: 'b', anchors: [centre(10)], weight: 1 },
    ])
    expect(result.pieces.get('a')?.some((piece) => piece.unitId === 'u5')).toBe(true)
    expect(result.pieces.get('b')?.some((piece) => piece.unitId === 'u10')).toBe(true)
  })

  it('gives a more important attraction a larger territory', () => {
    const result = partitionTerritories(units, [
      { id: 'big', anchors: [centre(0)], weight: 3 },
      { id: 'small', anchors: [centre(15)], weight: 1 },
    ])
    const size = (id: string) => (result.pieces.get(id) ?? []).reduce((sum, piece) => sum + areaKm2(piece.geometry), 0)
    expect(size('big')).toBeGreaterThan(size('small'))
  })

  it('is deterministic', () => {
    const seeds = [
      { id: 'a', anchors: [centre(1)], weight: 1.6 },
      { id: 'b', anchors: [centre(14)], weight: 1 },
    ]
    const first = partitionTerritories(units, seeds)
    const second = partitionTerritories(units, seeds)
    const flat = (r: typeof first) => [...r.pieces].map(([id, p]) => `${id}:${p.map((x) => x.unitId).sort().join(',')}`)
    expect(flat(first)).toEqual(flat(second))
  })

  it('supports one attraction with pins in two separate unions', () => {
    const result = partitionTerritories(units, [
      { id: 'beel', anchors: [centre(0), centre(1)], weight: 1 },
      { id: 'other', anchors: [centre(15)], weight: 1 },
    ])
    const ids = (result.pieces.get('beel') ?? []).map((piece) => piece.unitId)
    expect(ids).toContain('u0')
    expect(ids).toContain('u1')
    expect(isConnected(ids)).toBe(true)
  })

  it('splits only the shared union when two pins fall in the same union', () => {
    const result = partitionTerritories(units, [
      { id: 'west', anchors: [[88.01, 24.025]], weight: 1 },
      { id: 'east', anchors: [[88.04, 24.025]], weight: 1 },
    ])
    const west = result.pieces.get('west') ?? []
    const east = result.pieces.get('east') ?? []
    expect(west.some((piece) => piece.isSplit)).toBe(true)
    expect(east.some((piece) => piece.isSplit)).toBe(true)
    const plain = [...west, ...east].filter((piece) => !piece.isSplit)
    expect(plain).toHaveLength(15)
    expect(result.warnings.join(' ')).toContain('share one union')
  })

  it('skips pins outside every union and reports them', () => {
    const result = partitionTerritories(units, [{ id: 'lost', anchors: [[10, 10]], weight: 1 }])
    expect(result.pieces.get('lost')).toEqual([])
    expect(result.warnings.join(' ')).toContain('not inside any union')
  })
})
