import { describe, expect, it } from 'vitest'
import {
  areaKm2,
  clipToCloserSide,
  dissolve,
  normalizeMultiPolygon,
  pointInMultiPolygon,
  poleOfInaccessibility,
  sharedBoundaryLengths,
} from './geometry'
import type { MultiPolygonCoords } from './geometry'

function square(x: number, y: number, size = 0.1): MultiPolygonCoords {
  return [[[[x, y], [x + size, y], [x + size, y + size], [x, y + size], [x, y]]]]
}

describe('planar geometry helpers', () => {
  it('computes realistic areas for a one-tenth degree square near Naogaon', () => {
    const km2 = areaKm2(square(88.5, 24.8))
    expect(km2).toBeGreaterThan(105)
    expect(km2).toBeLessThan(118)
  })

  it('finds shared borders between neighbours but not between distant squares', () => {
    const shared = sharedBoundaryLengths([square(0, 0), square(0.1, 0), square(0.5, 0.5)])
    expect(shared.get('0|1')).toBeGreaterThan(10)
    expect(shared.has('0|2')).toBe(false)
    expect(shared.has('1|2')).toBe(false)
  })

  it('dissolves two neighbouring squares into one outline with the same total area', () => {
    const merged = dissolve([square(0, 0), square(0.1, 0)])
    expect(merged).toHaveLength(1)
    expect(merged[0]).toHaveLength(1)
    expect(areaKm2(merged)).toBeCloseTo(areaKm2(square(0, 0)) * 2, 3)
    expect(pointInMultiPolygon([0.15, 0.05], merged)).toBe(true)
    expect(pointInMultiPolygon([0.3, 0.05], merged)).toBe(false)
  })

  it('keeps a hole when four squares surround an empty one', () => {
    const ring = [
      square(0, 0), square(0.1, 0), square(0.2, 0),
      square(0, 0.1), square(0.2, 0.1),
      square(0, 0.2), square(0.1, 0.2), square(0.2, 0.2),
    ]
    const merged = dissolve(ring)
    expect(merged).toHaveLength(1)
    expect(merged[0]).toHaveLength(2)
    expect(pointInMultiPolygon([0.15, 0.15], merged)).toBe(false)
    expect(pointInMultiPolygon([0.05, 0.05], merged)).toBe(true)
  })

  it('does not mind ring orientation when dissolving', () => {
    const clockwise: MultiPolygonCoords = [[[[0.1, 0], [0.1, 0.1], [0.2, 0.1], [0.2, 0], [0.1, 0]]]]
    const merged = dissolve([square(0, 0), clockwise])
    expect(merged).toHaveLength(1)
    expect(normalizeMultiPolygon(merged)[0]).toHaveLength(1)
  })

  it('splits a square along the midline between two pins', () => {
    const whole = square(0, 0, 1)
    const west = clipToCloserSide(whole, [0.25, 0.5], [0.75, 0.5])
    const east = clipToCloserSide(whole, [0.75, 0.5], [0.25, 0.5])
    expect(pointInMultiPolygon([0.1, 0.5], west)).toBe(true)
    expect(pointInMultiPolygon([0.9, 0.5], west)).toBe(false)
    expect(pointInMultiPolygon([0.9, 0.5], east)).toBe(true)
    expect(areaKm2(west) + areaKm2(east)).toBeCloseTo(areaKm2(whole), 0)
  })
})

describe('pole of inaccessibility', () => {
  it('finds the middle of a square', () => {
    const [x, y] = poleOfInaccessibility(square(0, 0, 10)[0], 0.01)
    expect(x).toBeCloseTo(5, 1)
    expect(y).toBeCloseTo(5, 1)
  })

  it('stays inside an L shape, in the thick part, where a centroid could fall outside', () => {
    const lShape = [[[0, 0], [10, 0], [10, 2], [2, 2], [2, 10], [0, 10], [0, 0]]] as [number, number][][]
    const point = poleOfInaccessibility(lShape, 0.01)
    expect(pointInMultiPolygon(point, [lShape])).toBe(true)
    expect(Math.min(point[0], point[1])).toBeLessThan(2)
  })

  it('avoids a hole', () => {
    const outer = [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]] as [number, number][]
    const hole = [[3, 3], [3, 7], [7, 7], [7, 3], [3, 3]] as [number, number][]
    const point = poleOfInaccessibility([outer, hole], 0.01)
    expect(pointInMultiPolygon(point, [[outer, hole]])).toBe(true)
  })
})
