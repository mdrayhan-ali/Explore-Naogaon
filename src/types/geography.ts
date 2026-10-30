import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'

export type GeoPolygon = Feature<Polygon | MultiPolygon>

export type UpazilaBoundaryProperties = {
  shapeName: string
  shapeID: string
  shapeType: 'ADM3'
}

export type AdminFeatureProperties = UpazilaBoundaryProperties | {
  shapeName: 'Naogaon'
  shapeID: string
  shapeType: 'ADM2'
}

export type AdminBoundaries = FeatureCollection<Polygon | MultiPolygon, AdminFeatureProperties>

/** One union parishad (or paurashava) area of Naogaon district: the smallest territory unit. */
export type UnionProperties = {
  id: string
  nameEn: string
  nameBn: string
  /** English upazila name, e.g. "Naogaon Sadar". */
  upazila: string
  upazilaCode: string
  kind: 'union' | 'paurashava'
}

export type UnionCollection = FeatureCollection<Polygon | MultiPolygon, UnionProperties>

export type Attraction = {
  id: string
  nameBn: string
  nameEn: string
  /** Lower-case upazila name that matches `UpazilaBoundaryProperties.shapeName`. */
  upazilaId: string
  upazilaNameBn: string
  unionNameBn: string | null
  coordinates: [longitude: number, latitude: number] | null
  actualGeometry: GeoPolygon | null
  descriptionBn: string
  imageUrl: string
  imageAttribution: string
  imageSourceUrl: string
  dataSources: { label: string; url: string }[]
  verificationStatus: 'verified' | 'provisional' | 'unverified'
  category?: string
  pinAccuracy?: string
  accessStatus?: 'reported-open' | 'ticket-required' | 'booking-required' | 'private' | 'unknown'
  selfVerified?: boolean
  contributorNotes?: string
  /** 1 (default) to 3. More important places receive proportionally larger territories. */
  importance?: 1 | 2 | 3
  /** Extra pins for a place that spans several unions or upazilas (e.g. a large beel). */
  territoryAnchors?: [longitude: number, latitude: number][]
  /** Other upazilas this place also belongs to, as lower-case upazila names. */
  alsoUpazilaIds?: string[]
  /** Alternative local names, searchable but not shown as the title. */
  aliasesBn?: string[]
}

export type LocatedAttraction = Attraction & {
  coordinates: [longitude: number, latitude: number]
}

export type AttractionRegionProperties = {
  attractionId: string
  regionType: 'mapped-attraction-footprint' | 'generated-union-territory' | 'generated-split-union-territory'
  visualOnly: boolean
  /** Lower-case upazila name the territory belongs to. */
  upazilaId?: string
  /** Union areas that make up the territory (a split union is listed with its parent id). */
  unionIds?: string[]
}

export type AttractionRegion = GeoPolygon & {
  id: string
  properties: AttractionRegionProperties
}
