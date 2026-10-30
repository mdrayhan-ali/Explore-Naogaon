import type { LocatedAttraction, AttractionRegion, AdminBoundaries } from '../../types/geography'
import type { MapTheme } from '../themes/themes'

export type { MapTheme } from '../themes/themes'

export type PosterLayout = 'portrait' | 'story' | 'a4'
export type MapVisualStyle = 'regions' | 'outline'

export type PosterSettings = {
  layout: PosterLayout
  title: string
  displayName: string
  caption: string
  showPlaceNames: boolean
  showUpazilaNames: boolean
  showCounts: boolean
  showPercentage: boolean
  includeDisplayName: boolean
  includePhoto: boolean
  /** A small square photo (data URL) chosen by the visitor; it never leaves their device. */
  photoUrl: string | null
  mapStyle: MapVisualStyle
}

export type PosterData = {
  boundaries: AdminBoundaries
  regions: AttractionRegion[]
  attractions: LocatedAttraction[]
  visitedIds: string[]
  selectedId: string | null
  settings: PosterSettings
  theme: MapTheme
}

export const DEFAULT_POSTER_SETTINGS: PosterSettings = {
  layout: 'portrait',
  title: 'হামাকে নওগাঁ',
  displayName: '',
  caption: '',
  showPlaceNames: true,
  showUpazilaNames: true,
  showCounts: true,
  showPercentage: true,
  includeDisplayName: false,
  includePhoto: true,
  photoUrl: null,
  mapStyle: 'regions',
}

export const POSTER_LAYOUTS: Record<PosterLayout, { label: string; width: number; height: number; description: string }> = {
  portrait: { label: 'সোশ্যাল পোস্ট', width: 1200, height: 1500, description: '1200 × 1500 px' },
  story: { label: 'স্টোরি', width: 1080, height: 1920, description: '1080 × 1920 px' },
  a4: { label: 'A4 প্রিন্ট', width: 2480, height: 3508, description: '2480 × 3508 px · 300 dpi' },
}
