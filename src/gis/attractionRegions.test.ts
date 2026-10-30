import { describe, expect, it } from 'vitest'
import unionData from '../data/naogaon/unions.geojson?raw'
import { attractions } from '../data/naogaon/attractions'
import { buildAdminBoundaries } from './boundaries'
import { generateAttractionRegions } from './attractionRegions'
import { areaKm2, pointInMultiPolygon, sharedBoundaryLengths, toMultiPolygon } from './geometry'
import type { UnionCollection } from '../types/geography'

const unions = JSON.parse(unionData) as UnionCollection
const result = generateAttractionRegions(unions, attractions)
const territories = result.regions.filter((region) => region.properties.regionType !== 'mapped-attraction-footprint')

describe('union data', () => {
  it('has 99 unions and 3 paurashavas across 11 upazilas, each with a Bengali name', () => {
    expect(unions.features).toHaveLength(102)
    expect(unions.features.filter((feature) => feature.properties.kind === 'union')).toHaveLength(99)
    expect(unions.features.filter((feature) => feature.properties.kind === 'paurashava')).toHaveLength(3)
    expect(new Set(unions.features.map((feature) => feature.properties.upazila)).size).toBe(11)
    expect(new Set(unions.features.map((feature) => feature.properties.id)).size).toBe(102)
    unions.features.forEach((feature) => expect(feature.properties.nameBn, feature.properties.id).toMatch(/[ঀ-৿]/))
  })

  it('dissolves into one district outline and 11 upazila outlines of the same total area', () => {
    const boundaries = buildAdminBoundaries(unions)
    const district = boundaries.features.filter((feature) => feature.properties.shapeType === 'ADM2')
    const upazilas = boundaries.features.filter((feature) => feature.properties.shapeType === 'ADM3')
    expect(district).toHaveLength(1)
    expect(upazilas).toHaveLength(11)
    const unionArea = unions.features.reduce((sum, feature) => sum + areaKm2(toMultiPolygon(feature.geometry)), 0)
    const upazilaArea = upazilas.reduce((sum, feature) => sum + areaKm2(toMultiPolygon(feature.geometry)), 0)
    expect(upazilaArea / unionArea).toBeGreaterThan(0.999)
    expect(upazilaArea / unionArea).toBeLessThan(1.001)
    expect(areaKm2(toMultiPolygon(district[0].geometry)) / unionArea).toBeGreaterThan(0.999)
  })
})

describe('attraction territories', () => {
  it('generates territories without warnings, apart from the oversized Somapura footprint', () => {
    expect(result.warnings.filter((warning) => !warning.startsWith('Somapura Mahavihara: actual attraction polygon'))).toEqual([])
  })

  it('gives every attraction a territory, with one extra piece for the two-upazila beel', () => {
    const ids = new Set(territories.map((region) => region.properties.attractionId))
    expect(ids).toEqual(new Set(attractions.map((attraction) => attraction.id)))
    expect(territories).toHaveLength(30)
    const ghuksir = territories.filter((region) => region.properties.attractionId === 'dhamoirhat-ghuksir-beel')
    expect(ghuksir.map((region) => region.properties.upazilaId).sort()).toEqual(['dhamoirhat', 'patnitala'])
    expect(new Set(territories.map((region) => region.id)).size).toBe(territories.length)
  })

  it('covers every union and paurashava exactly once, so territories never overlap', () => {
    const owner = new Map<string, string>()
    for (const region of territories) {
      for (const unionId of region.properties.unionIds ?? []) {
        expect(owner.has(unionId), `${unionId} claimed twice`).toBe(false)
        owner.set(unionId, region.properties.attractionId)
      }
    }
    expect(owner.size).toBe(102)
  })

  it('keeps each territory inside its upazila and every pin inside its own territory', () => {
    const upazilaOf = new Map(unions.features.map((feature) => [feature.properties.id, feature.properties.upazila]))
    for (const region of territories) {
      const upazilas = new Set((region.properties.unionIds ?? []).map((id) => upazilaOf.get(id)))
      expect(upazilas.size, region.id).toBe(1)
    }
    for (const attraction of attractions) {
      const own = territories.filter((region) => region.properties.attractionId === attraction.id)
      const geometry = own.flatMap((region) => toMultiPolygon(region.geometry))
      expect(pointInMultiPolygon(attraction.coordinates!, geometry), attraction.id).toBe(true)
    }
  })

  it('keeps every territory made of neighbouring unions', () => {
    const index = new Map(unions.features.map((feature, i) => [feature.properties.id, i]))
    const shared = sharedBoundaryLengths(unions.features.map((feature) => toMultiPolygon(feature.geometry)))
    const adjacent = (a: string, b: string) => {
      const i = index.get(a)!
      const j = index.get(b)!
      return shared.has(`${Math.min(i, j)}|${Math.max(i, j)}`)
    }
    for (const region of territories) {
      const ids = [...new Set(region.properties.unionIds ?? [])]
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
      expect(seen.size, `${region.id} must be one connected piece`).toBe(ids.length)
    }
  })

  it('gives tier-1 places more land than ordinary places in the same upazila', () => {
    const area = (id: string) => territories
      .filter((region) => region.properties.attractionId === id)
      .reduce((sum, region) => sum + areaKm2(toMultiPolygon(region.geometry)), 0)
    expect(area('manda-kusumba-mosque')).toBeGreaterThan(area('manda-boilshing-banyan'))
    expect(area('manda-kusumba-mosque')).toBeGreaterThan(area('manda-raghunath-temple'))
    expect(area('atrai-patisar-kachari-bari')).toBeGreaterThan(area('atrai-islamgathi-mosque'))
    expect(area('atrai-patisar-kachari-bari')).toBeGreaterThan(area('atrai-bangiya-relief-committee'))
  })

  it('marks exactly the twelve chosen heritage, religious and nature places as tier 1', () => {
    const tierOne = attractions.filter((attraction) => attraction.importance === 3).map((attraction) => attraction.id).sort()
    expect(tierOne).toEqual([
      'atrai-patisar-kachari-bari', 'badalgachhi-halud-vihara', 'dhamoirhat-altadighi', 'dhamoirhat-bhimer-panti',
      'dhamoirhat-jagaddal', 'dhamoirhat-mahisantosh-mosque', 'manda-kusumba-mosque', 'patnitala-dibor-dighi',
      'raninagar-raktadaha-beel', 'sadar-balihar-rajbari', 'sapahar-jobai-beel', 'somapura-mahavihara',
    ])
    attractions.filter((attraction) => attraction.importance !== 3).forEach((attraction) => expect(attraction.importance).toBe(1))
  })

  it('skips a mapped footprint that is not contained by its upazila', () => {
    // The bundled OpenStreetMap polygon for Somapura Mahavihara covers about 70 km2 and
    // crosses into other upazilas, so it is reported and not drawn as a site boundary.
    expect(result.warnings.join(' ')).toContain('Somapura Mahavihara: actual attraction polygon')
    expect(result.regions.some((region) => region.properties.regionType === 'mapped-attraction-footprint')).toBe(false)
  })

  it('draws a mapped footprint on top of its territory when it fits inside the upazila', () => {
    const upazilaUnits = unions.features.filter((feature) => feature.properties.upazila === 'Badalgachhi')
    const [x, y] = [88.97, 25.03]
    const tiny = { type: 'Feature' as const, properties: {}, geometry: {
      type: 'Polygon' as const,
      coordinates: [[[x, y], [x + 0.002, y], [x + 0.002, y + 0.002], [x, y + 0.002], [x, y]]],
    } }
    expect(upazilaUnits.length).toBe(8)
    const withFootprint = attractions.map((attraction) =>
      attraction.id === 'somapura-mahavihara' ? { ...attraction, actualGeometry: tiny } : attraction)
    const regions = generateAttractionRegions(unions, withFootprint).regions
    const footprintIndex = regions.findIndex((region) => region.properties.regionType === 'mapped-attraction-footprint')
    const territoryIndex = regions.findIndex((region) => region.properties.attractionId === 'somapura-mahavihara' &&
      region.properties.regionType !== 'mapped-attraction-footprint')
    expect(footprintIndex).toBeGreaterThan(territoryIndex)
    expect(regions[footprintIndex].properties.visualOnly).toBe(false)
  })
})
