import { bboxOf, dissolve, pointInMultiPolygon, toMultiPolygon } from './geometry.ts'
import type { BBox, MultiPolygonCoords, Position } from './geometry.ts'
import { partitionTerritories } from './territories.ts'
import type { TerritorySeed } from './territories.ts'
import type { Attraction, AttractionRegion, LocatedAttraction, UnionCollection } from '../types/geography'

export type RegionGeneration = {
  regions: AttractionRegion[]
  warnings: string[]
}

/** How much more land an important attraction should receive than a default one. */
export const TERRITORY_WEIGHT: Record<1 | 2 | 3, number> = { 1: 1, 2: 1.6, 3: 2.4 }

type UnionRecord = {
  id: string
  upazila: string
  box: BBox
  geometry: MultiPolygonCoords
}

function upazilaKey(name: string) {
  return name.toLocaleLowerCase()
}

function isLocated(attraction: Attraction): attraction is LocatedAttraction {
  return attraction.verificationStatus === 'verified' && attraction.coordinates !== null
}

export function generateAttractionRegions(unions: UnionCollection, attractions: Attraction[]): RegionGeneration {
  const warnings: string[] = []
  const regions: AttractionRegion[] = []

  const records: UnionRecord[] = unions.features.map((feature) => {
    const geometry = toMultiPolygon(feature.geometry)
    return { id: feature.properties.id, upazila: feature.properties.upazila, box: bboxOf(geometry), geometry }
  })
  const unitsByUpazila = new Map<string, UnionRecord[]>()
  for (const record of records) {
    const list = unitsByUpazila.get(record.upazila) ?? []
    list.push(record)
    unitsByUpazila.set(record.upazila, list)
  }

  function locate(position: Position): UnionRecord | null {
    return records.find(({ box, geometry }) =>
      position[0] >= box[0] && position[0] <= box[2] && position[1] >= box[1] && position[1] <= box[3] &&
      pointInMultiPolygon(position, geometry),
    ) ?? null
  }

  // Group every pin of every attraction by the upazila it falls in.
  const anchorsByUpazila = new Map<string, Map<string, Position[]>>()
  for (const attraction of attractions.filter(isLocated)) {
    const pins: Position[] = [attraction.coordinates, ...(attraction.territoryAnchors ?? [])]
    pins.forEach((pin, index) => {
      const union = locate(pin)
      if (!union) {
        warnings.push(`${attraction.nameEn}: ${index === 0 ? 'coordinate' : 'extra pin'} is outside Naogaon district; it was skipped.`)
        return
      }
      if (index === 0 && upazilaKey(union.upazila) !== upazilaKey(attraction.upazilaId)) {
        warnings.push(`${attraction.nameEn}: coordinate falls in ${union.upazila}, but the record says ${attraction.upazilaId}.`)
      }
      const group = anchorsByUpazila.get(union.upazila) ?? new Map<string, Position[]>()
      group.set(attraction.id, [...(group.get(attraction.id) ?? []), pin])
      anchorsByUpazila.set(union.upazila, group)
    })
  }

  const upazilaCountByAttraction = new Map<string, number>()
  for (const group of anchorsByUpazila.values()) {
    for (const id of group.keys()) upazilaCountByAttraction.set(id, (upazilaCountByAttraction.get(id) ?? 0) + 1)
  }
  const attractionById = new Map(attractions.map((attraction) => [attraction.id, attraction]))

  for (const [upazila, group] of [...anchorsByUpazila].sort(([a], [b]) => a.localeCompare(b))) {
    const units = unitsByUpazila.get(upazila) ?? []
    const seeds: TerritorySeed[] = [...group]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, anchors]) => ({
        id,
        anchors,
        weight: TERRITORY_WEIGHT[attractionById.get(id)?.importance ?? 1],
      }))

    const result = partitionTerritories(units.map(({ id, geometry }) => ({ id, geometry })), seeds)
    warnings.push(...result.warnings.map((message) => `${upazila}: ${message}`))

    for (const seed of seeds) {
      const pieces = result.pieces.get(seed.id) ?? []
      if (pieces.length === 0) continue
      const hasSplit = pieces.some((piece) => piece.isSplit)
      // Split cells do not share exact edges with their neighbours, so they are kept as
      // separate polygons instead of being dissolved.
      const geometry = hasSplit
        ? pieces.flatMap((piece) => piece.geometry)
        : dissolve(pieces.map((piece) => piece.geometry))
      if (geometry.length === 0) continue
      const multiUpazila = (upazilaCountByAttraction.get(seed.id) ?? 1) > 1
      regions.push({
        type: 'Feature',
        id: multiUpazila ? `region-${seed.id}-${upazilaKey(upazila).replace(/\s+/g, '-')}` : `region-${seed.id}`,
        properties: {
          attractionId: seed.id,
          regionType: hasSplit ? 'generated-split-union-territory' : 'generated-union-territory',
          visualOnly: true,
          upazilaId: upazilaKey(upazila),
          unionIds: pieces.map((piece) => piece.unitId.split('::')[0]),
        },
        geometry: { type: 'MultiPolygon', coordinates: geometry },
      })
    }
  }

  // Sourced footprints (for example Somapura Mahavihara) are drawn on top of the territory.
  for (const attraction of attractions.filter(isLocated)) {
    if (!attraction.actualGeometry) continue
    const union = locate(attraction.coordinates)
    const outline = union ? dissolve((unitsByUpazila.get(union.upazila) ?? []).map((unit) => unit.geometry)) : []
    const footprint = toMultiPolygon(attraction.actualGeometry.geometry)
    const contained = outline.length > 0 &&
      footprint.every((polygon) => polygon[0].every((vertex) => pointInMultiPolygon(vertex as Position, outline)))
    if (!contained) {
      warnings.push(`${attraction.nameEn}: actual attraction polygon is not contained by its upazila; the footprint was skipped.`)
      continue
    }
    regions.push({
      type: 'Feature',
      id: `footprint-${attraction.id}`,
      properties: {
        attractionId: attraction.id,
        regionType: 'mapped-attraction-footprint',
        visualOnly: false,
        upazilaId: union ? upazilaKey(union.upazila) : undefined,
      },
      geometry: attraction.actualGeometry.geometry,
    })
  }

  return { regions, warnings }
}
