import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import {
  ADMIN_BOUNDARIES,
  SOURCE_VERIFIED_ATTRACTIONS,
  UNIONS,
  VERIFIED_ATTRACTIONS,
  VERIFIED_ATTRACTION_IDS,
} from './data/naogaon/model'
import type { Attraction, AttractionRegion } from './types/geography'
import { DEFAULT_POSTER_SETTINGS } from './features/export/posterTypes'
import type { PosterData, PosterSettings } from './features/export/posterTypes'
import { THEMES } from './features/themes/themes'
import type { MapTheme } from './features/themes/themes'
import { TravelPoster } from './features/export/PosterPreview'
import { downloadPoster } from './features/export/posterExport'
import { getJourneyProgress } from './domain/progress'
import { readVisitedIds, writeVisitedIds } from './state/journeyStorage'
import { useLang } from './i18n/LanguageContext'
import { Hero } from './components/Hero'
import { MapStudio } from './components/MapStudio'
import { SiteFooter } from './components/SiteFooter'
import { SiteHeader, scrollToSection } from './components/SiteHeader'
import { StatsStrip } from './components/StatsStrip'

type ThemeId = MapTheme['id']
type VisitedState = Record<string, true>

const VISITED_STORAGE_KEY = 'naogaon-tourism-visited-v1'
const THEME_STORAGE_KEY = 'naogaon-tourism-map-theme-v1'

function loadAppSettings() {
  try {
    const storage = window.localStorage
    return {
      visited: Object.fromEntries(
        readVisitedIds(storage, VISITED_STORAGE_KEY, VERIFIED_ATTRACTION_IDS).map((id) => [id, true]),
      ) as VisitedState,
      theme: THEMES.find((item) => item.id === storage.getItem(THEME_STORAGE_KEY))?.id ?? 'nature',
      storageOff: false,
    }
  } catch (error) {
    console.warn('Could not load saved journey and customization settings from this browser.', error)
    return { visited: {} as VisitedState, theme: 'nature' as ThemeId, storageOff: true }
  }
}

function App() {
  const { t, num, placeName } = useLang()
  const [initial] = useState(loadAppSettings)
  const [visited, setVisited] = useState<VisitedState>(initial.visited)
  const [theme, setTheme] = useState<ThemeId>(initial.theme)
  const [regions, setRegions] = useState<AttractionRegion[]>([])
  const [mapLoading, setMapLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)
  const [storageOff, setStorageOff] = useState(initial.storageOff)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [posterSettings, setPosterSettings] = useState<PosterSettings>({
    ...DEFAULT_POSTER_SETTINGS,
    showPlaceNames: false,
    showUpazilaNames: false,
    includePhoto: false,
  })
  const [downloadState, setDownloadState] = useState<'idle' | 'working' | 'success' | 'error'>('idle')
  const [downloadMessage, setDownloadMessage] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const posterStageRef = useRef<HTMLDivElement>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const flashTimer = useRef<number | undefined>(undefined)
  const selectedTheme = THEMES.find((item) => item.id === theme) ?? THEMES[0]

  useEffect(() => {
    let cancelled = false
    import('./gis/attractionRegions')
      .then(({ generateAttractionRegions }) => generateAttractionRegions(UNIONS, SOURCE_VERIFIED_ATTRACTIONS))
      .then((result) => {
        if (cancelled) return
        setRegions(result.regions)
        setMapLoading(false)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        console.error('Could not generate attraction map regions.', error)
        setMapError(t('map.error'))
        setMapLoading(false)
      })
    return () => { cancelled = true }
    // The regions depend only on the data; the error text is looked up again when shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visitedIds = Object.keys(visited)
  const progress = getJourneyProgress(VERIFIED_ATTRACTIONS, visitedIds)

  const posterData = useMemo<PosterData>(() => ({
    boundaries: ADMIN_BOUNDARIES,
    regions,
    attractions: VERIFIED_ATTRACTIONS,
    visitedIds: Object.keys(visited),
    selectedId: null,
    settings: posterSettings,
    theme: selectedTheme,
  }), [regions, selectedTheme, visited, posterSettings])

  function showToast(message: string) {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2800)
  }

  function updateTheme(next: ThemeId) {
    setTheme(next)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch (error) {
      console.warn('Could not save the map theme in this browser.', error)
    }
  }

  function updateVisited(next: VisitedState) {
    setVisited(next)
    try {
      writeVisitedIds(window.localStorage, VISITED_STORAGE_KEY, Object.keys(next))
      setStorageOff(false)
    } catch (error) {
      console.warn('Could not save journey progress in this browser.', error)
      setStorageOff(true)
    }
  }

  function toggleVisited(attraction: Attraction) {
    if (!VERIFIED_ATTRACTION_IDS.has(attraction.id)) return
    const next = { ...visited }
    if (next[attraction.id]) {
      delete next[attraction.id]
    } else {
      next[attraction.id] = true
      showToast(t('toast.seen', { name: placeName(attraction), n: num(Object.keys(next).length), total: num(progress.total) }))
    }
    updateVisited(next)
  }

  /** From a hero pin: scroll to the map and make that place's region glow for a moment. */
  function showOnMap(id: string) {
    scrollToSection('map')
    setFlashId(id)
    window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setFlashId(null), 2400)
  }

  async function downloadMap() {
    if (!posterStageRef.current) {
      setDownloadState('error')
      setDownloadMessage(t('studio.downloadNotReady'))
      return
    }
    setDownloadState('working')
    setDownloadMessage(t('studio.downloading'))
    try {
      await downloadPoster(posterStageRef.current)
      setDownloadState('success')
      setDownloadMessage(t('studio.downloaded'))
    } catch (error) {
      console.error('Could not generate the map download.', error)
      setDownloadState('error')
      setDownloadMessage(t('studio.downloadFail'))
    }
  }

  return (
    <div className="site-shell" data-map-theme={theme}>
      <SiteHeader visited={progress.visited} total={progress.total} />
      <main>
        <Hero visitedIds={new Set(visitedIds)} visitedCount={progress.visited} total={progress.total} onPick={showOnMap} />
        <StatsStrip visitedCount={progress.visited} />
        <MapStudio
          data={posterData}
          themeId={theme}
          onTheme={updateTheme}
          visited={visited}
          onToggle={toggleVisited}
          onMarkAll={() => { const all: VisitedState = {}; VERIFIED_ATTRACTIONS.forEach((a) => { all[a.id] = true }); updateVisited(all) }}
          onClearAll={() => updateVisited({})}
          onSettings={(patch) => setPosterSettings((current) => ({ ...current, ...patch }))}
          onDownload={downloadMap}
          downloadState={downloadState}
          downloadMessage={downloadMessage}
          loading={mapLoading}
          error={mapError}
          flashId={flashId}
        />
      </main>
      <SiteFooter />
      {storageOff && <div className="storage-banner" role="alert">{t('storage.off')}</div>}
      {toast && <div className="toast" role="status">{toast}</div>}
      <div className="poster-export-host" aria-hidden="true">
        <TravelPoster data={posterData} stageRef={posterStageRef} />
      </div>
    </div>
  )
}

export default App
