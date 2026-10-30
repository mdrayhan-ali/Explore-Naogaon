import { dissolve, toMultiPolygon } from './geometry.ts'
import type { MultiPolygonCoords } from './geometry.ts'
import type { AdminBoundaries, UnionCollection } from '../types/geography'

/**
 * Builds the district (ADM2) and upazila (ADM3) outlines by dissolving union areas.
 * Using one source for outlines and territories means region edges and upazila
 * outlines always line up exactly.
 */
export function buildAdminBoundaries(unions: UnionCollection): AdminBoundaries {
  const byUpazila = new Map<string, { code: string; parts: MultiPolygonCoords[] }>()
  for (const feature of unions.features) {
    const { upazila, upazilaCode } = feature.properties
    const entry = byUpazila.get(upazila) ?? { code: upazilaCode, parts: [] }
    entry.parts.push(toMultiPolygon(feature.geometry))
    byUpazila.set(upazila, entry)
  }

  const features: AdminBoundaries['features'] = []
  const upazilaOutlines: MultiPolygonCoords[] = []
  for (const [name, { code, parts }] of [...byUpazila].sort(([a], [b]) => a.localeCompare(b))) {
    const outline = dissolve(parts)
    upazilaOutlines.push(outline)
    features.push({
      type: 'Feature',
      properties: { shapeName: name, shapeID: code, shapeType: 'ADM3' },
      geometry: { type: 'MultiPolygon', coordinates: outline },
    })
  }

  const district = dissolve(upazilaOutlines)
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { shapeName: 'Naogaon', shapeID: 'BD5064', shapeType: 'ADM2' },
        geometry: { type: 'MultiPolygon', coordinates: district },
      },
      ...features,
    ],
  }
}
