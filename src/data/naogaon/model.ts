import unionData from './unions.geojson?raw'
import { attractions } from './attractions'
import type { LocatedAttraction, UnionCollection, UpazilaBoundaryProperties } from '../../types/geography'
import { buildAdminBoundaries } from '../../gis/boundaries'
import { pointInMultiPolygon, toMultiPolygon } from '../../gis/geometry'

/** Everything the site needs to know about Naogaon, computed once when the page loads. */
export const UNIONS = JSON.parse(unionData) as UnionCollection
export const ADMIN_BOUNDARIES = buildAdminBoundaries(UNIONS)
export const UPAZILAS = ADMIN_BOUNDARIES.features.filter(
  (feature) => feature.properties.shapeType === 'ADM3',
) as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon, UpazilaBoundaryProperties>[]

export const UPAZILA_ID = (name: string) => name.toLocaleLowerCase()
export const UPAZILA_NAME_BN: Record<string, string> = {
  Atrai: 'আত্রাই',
  Badalgachhi: 'বদলগাছী',
  Dhamoirhat: 'ধামইরহাট',
  Mahadebpur: 'মহাদেবপুর',
  Manda: 'মান্দা',
  'Naogaon Sadar': 'নওগাঁ সদর',
  Niamatpur: 'নিয়ামতপুর',
  Patnitala: 'পত্নীতলা',
  Porsha: 'পোরশা',
  Raninagar: 'রাণীনগর',
  Sapahar: 'সাপাহার',
}

export const UNIQUE_ATTRACTIONS = [...new Map(attractions.map((attraction) => [attraction.id, attraction])).values()]
export const SOURCE_VERIFIED_ATTRACTIONS = UNIQUE_ATTRACTIONS.filter(
  (attraction) => attraction.verificationStatus === 'verified',
)
export const VERIFIED_ATTRACTIONS = SOURCE_VERIFIED_ATTRACTIONS.filter(
  (attraction): attraction is LocatedAttraction => {
    if (!attraction.coordinates) return false
    const parent = UPAZILAS.find(
      (feature) => UPAZILA_ID(feature.properties.shapeName) === UPAZILA_ID(attraction.upazilaId),
    )
    return parent ? pointInMultiPolygon(attraction.coordinates, toMultiPolygon(parent.geometry)) : false
  },
)
export const VERIFIED_ATTRACTION_IDS = new Set(VERIFIED_ATTRACTIONS.map((attraction) => attraction.id))
export const ATTRACTION_BY_ID = new Map(UNIQUE_ATTRACTIONS.map((attraction) => [attraction.id, attraction]))
export const UNION_COUNT = UNIONS.features.length
export const HERO_ATTRACTION = attractions[0]
