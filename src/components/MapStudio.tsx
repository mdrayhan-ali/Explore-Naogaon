import { useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties } from 'react'
import type { Attraction } from '../types/geography'
import { THEMES } from '../features/themes/themes'
import type { MapTheme } from '../features/themes/themes'
import { TravelPoster } from '../features/export/PosterPreview'
import type { PosterData, PosterSettings } from '../features/export/posterTypes'
import { UNIQUE_ATTRACTIONS, UPAZILAS, UPAZILA_ID, VERIFIED_ATTRACTIONS } from '../data/naogaon/model'
import { getJourneyProgress } from '../domain/progress'
import { useLang } from '../i18n/LanguageContext'
import { readableOn } from '../lib/color'
import { useReveal } from '../lib/useReveal'
import { IconCheck, IconDownload, IconSearch, IconUpload } from './Icons'

type Filter = 'all' | 'visited' | 'unvisited'

/** Shrinks a chosen photo to a small square so it stays light inside the poster. */
function squarePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const size = 320
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const context = canvas.getContext('2d')
      if (!context) { URL.revokeObjectURL(url); reject(new Error('canvas unavailable')); return }
      const side = Math.min(image.naturalWidth, image.naturalHeight)
      context.drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.88))
    }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image failed')) }
    image.src = url
  })
}

export function MapStudio({
  data, themeId, onTheme, visited, onToggle, onMarkAll, onClearAll, onSettings,
  onDownload, downloadState, downloadMessage, loading, error, flashId,
}: {
  data: PosterData
  themeId: MapTheme['id']
  onTheme: (id: MapTheme['id']) => void
  visited: Record<string, true>
  onToggle: (attraction: Attraction) => void
  onMarkAll: () => void
  onClearAll: () => void
  onSettings: (patch: Partial<PosterSettings>) => void
  onDownload: () => void
  downloadState: 'idle' | 'working' | 'success' | 'error'
  downloadMessage: string
  loading: boolean
  error: string | null
  flashId: string | null
}) {
  const { t, num, placeName, upazilaName } = useLang()
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)
  const [photoNote, setPhotoNote] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const [ref, shown] = useReveal<HTMLElement>(0.05)
  const theme = data.theme
  const settings = data.settings
  const ids = Object.keys(visited)

  const styleVars = {
    '--t-bg': theme.background,
    '--t-map-bg': theme.mapBackground,
    '--t-visited': theme.visited,
    '--t-visited-ink': readableOn(theme.visited),
    '--t-unvisited': theme.unvisited,
    '--t-unvisited-ink': readableOn(theme.unvisited, '#ffffff', theme.ink),
    '--t-ink': theme.ink,
    '--t-muted': theme.muted,
    '--t-accent': theme.accent,
    '--t-decor': theme.decoration,
  } as CSSProperties

  function matches(attraction: Attraction) {
    const q = search.trim().normalize('NFC').toLocaleLowerCase()
    if (!q) return true
    return `${attraction.nameBn} ${(attraction.aliasesBn ?? []).join(' ')} ${attraction.nameEn} ${attraction.unionNameBn ?? ''} ${attraction.upazilaNameBn} ${attraction.upazilaId}`
      .normalize('NFC').toLocaleLowerCase().includes(q)
  }

  async function pickPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      onSettings({ photoUrl: await squarePhoto(file), includePhoto: true })
      setPhotoNote('')
    } catch {
      setPhotoNote(t('studio.photoFail'))
    }
  }

  const progress = getJourneyProgress(VERIFIED_ATTRACTIONS, ids)
  const highlight = hovered ?? flashId

  return (
    <section className={`section studio reveal${shown ? ' is-shown' : ''}`} id="map" ref={ref} aria-labelledby="map-title" style={styleVars}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">{t('map.kicker')}</span>
            <h2 id="map-title">{t('map.title')}</h2>
            <p>{t('map.lead')}</p>
          </div>
        </div>

        <div className="studio-grid">
          <aside className="list-panel" aria-label={t('list.aria')}>
            <div className="panel-tools">
              <label className="search-box search-box-sm">
                <IconSearch width={16} height={16} />
                <span className="sr-only">{t('list.search')}</span>
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('list.search')} />
              </label>
              <div className="segmented segmented-sm" role="group" aria-label={t('list.filter.aria')}>
                {([['all', 'list.filter.all'], ['visited', 'list.filter.seen'], ['unvisited', 'list.filter.todo']] as const).map(([value, key]) => (
                  <button type="button" key={value} className={filter === value ? 'is-on' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{t(key)}</button>
                ))}
              </div>
              <div className="bulk">
                <button type="button" onClick={onMarkAll}>{t('list.markAll')}</button>
                <button type="button" onClick={onClearAll}>{t('list.clearAll')}</button>
              </div>
            </div>
            <div className="places-scroll">
              {UPAZILAS.map((upazila) => {
                const id = UPAZILA_ID(upazila.properties.shapeName)
                const places = UNIQUE_ATTRACTIONS.filter((attraction) => {
                  const inUpazila = UPAZILA_ID(attraction.upazilaId) === id || (attraction.alsoUpazilaIds ?? []).includes(id)
                  const done = Boolean(visited[attraction.id])
                  return inUpazila && matches(attraction) && (filter === 'all' || (filter === 'visited' ? done : !done))
                })
                if (places.length === 0) return null
                const p = getJourneyProgress(VERIFIED_ATTRACTIONS, ids, id)
                return (
                  <div className="pill-group" key={id}>
                    <div className="pill-group-head">
                      <strong>{upazilaName(upazila.properties.shapeName)}</strong>
                      <span>{num(p.visited)}/{num(p.total)}</span>
                    </div>
                    <div className="pill-list">
                      {places.map((attraction) => {
                        const done = Boolean(visited[attraction.id])
                        return (
                          <button
                            key={attraction.id}
                            type="button"
                            className={`place-pill${done ? ' is-visited' : ''}${highlight === attraction.id ? ' is-hover' : ''}`}
                            aria-pressed={done}
                            aria-label={done ? t('list.seenAria', { name: placeName(attraction) }) : t('list.todoAria', { name: placeName(attraction) })}
                            onClick={() => onToggle(attraction)}
                            onMouseEnter={() => setHovered(attraction.id)}
                            onMouseLeave={() => setHovered(null)}
                            onFocus={() => setHovered(attraction.id)}
                            onBlur={() => setHovered(null)}
                          >
                            {done && <IconCheck width={13} height={13} />}
                            {placeName(attraction)}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </aside>

          <div className="studio-card">
            <div className="studio-row">
              <span className="studio-label">{t('studio.theme')}</span>
              <div className="theme-swatches" role="group" aria-label={t('studio.theme')}>
                {THEMES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`theme-swatch${themeId === item.id ? ' is-on' : ''}`}
                    onClick={() => onTheme(item.id)}
                    aria-pressed={themeId === item.id}
                    aria-label={t(`theme.${item.id}`)}
                    title={t(`theme.${item.id}`)}
                  >
                    <span style={{ background: `linear-gradient(135deg, ${item.background} 48%, ${item.visited} 49%)` }} />
                  </button>
                ))}
              </div>
            </div>

            <div className="studio-row studio-row-wrap">
              <button type="button" className="photo-btn" onClick={() => fileInput.current?.click()}>
                {settings.photoUrl
                  ? <img src={settings.photoUrl} alt={t('studio.photoAlt')} />
                  : <span className="photo-btn-icon"><IconUpload width={16} height={16} /></span>}
                {settings.photoUrl ? t('studio.changePhoto') : t('studio.addPhoto')}
              </button>
              {settings.photoUrl && (
                <button type="button" className="link-btn" onClick={() => onSettings({ photoUrl: null, includePhoto: false })}>{t('studio.removePhoto')}</button>
              )}
              <input ref={fileInput} type="file" accept="image/*" hidden onChange={pickPhoto} />
              <input
                className="name-input"
                type="text"
                maxLength={28}
                value={settings.displayName}
                placeholder={t('studio.name')}
                aria-label={t('studio.name')}
                onChange={(event) => onSettings({ displayName: event.target.value, includeDisplayName: event.target.value.trim().length > 0 })}
              />
              <label className="check">
                <input type="checkbox" checked={settings.showPlaceNames} onChange={(event) => onSettings({ showPlaceNames: event.target.checked })} />
                <span className="check-box" aria-hidden="true"><IconCheck width={13} height={13} /></span>
                {t('studio.placeNames')}
              </label>
            </div>
            <p className="studio-note">{photoNote || t('studio.photoNote')}</p>

            <div className="poster-frame">
              {loading ? <div className="map-state-note">{t('map.loading')}</div>
                : error ? <div className="map-state-note map-state-error" role="alert">{error}</div>
                : (
                  <TravelPoster
                    data={data}
                    preview
                    highlightId={highlight}
                    onAttractionClick={onToggle}
                    onAttractionHover={setHovered}
                  />
                )}
            </div>
            <p className="studio-note studio-tip">{t('map.tip')}</p>
            <p className="studio-note">{t('map.note')}</p>

            <div className="download-area">
              <button type="button" className="btn btn-download" onClick={onDownload} disabled={loading || Boolean(error) || downloadState === 'working'}>
                <IconDownload width={18} height={18} /> {downloadState === 'working' ? t('studio.downloading') : t('studio.download')}
              </button>
              {downloadMessage && (
                <p className={`status-line status-${downloadState}`} role={downloadState === 'error' ? 'alert' : 'status'}>{downloadMessage}</p>
              )}
              <span className="sr-only">{num(progress.visited)}/{num(progress.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
