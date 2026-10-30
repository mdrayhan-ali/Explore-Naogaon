import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, Ref } from 'react'
import type { PosterData } from './posterTypes'
import type { LocatedAttraction } from '../../types/geography'
import { GeographicMapSvg } from '../../components/GeographicMapSvg'
import { useLang } from '../../i18n/LanguageContext'
import { SITE } from '../../config/site'
import './poster.css'

const POSTER_SIZE = { width: 1200, height: 1600 }

/**
 * The map poster. With `preview` it is shown scaled to fit its container (this is the card
 * people interact with); without it, it is the full-size, hidden copy that gets downloaded.
 */
export function TravelPoster({
  data,
  preview = false,
  stageRef,
  highlightId,
  onAttractionClick,
  onAttractionHover,
}: {
  data: PosterData
  preview?: boolean
  stageRef?: Ref<HTMLDivElement>
  highlightId?: string | null
  onAttractionClick?: (attraction: LocatedAttraction) => void
  onAttractionHover?: (attractionId: string | null) => void
}) {
  const { t, num, lang } = useLang()
  const { width, height } = POSTER_SIZE
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0.5)
  const total = new Set(data.attractions.map((attraction) => attraction.id)).size
  const visited = new Set(data.visitedIds.filter((id) => data.attractions.some((item) => item.id === id))).size
  const percentage = total ? Math.round((visited / total) * 100) : 0
  const visitedUpazilasCount = new Set(
    data.attractions
      .filter((attraction) => data.visitedIds.includes(attraction.id))
      .map((attraction) => attraction.upazilaId.toLowerCase()),
  ).size
  const name = data.settings.displayName.trim()
  const showName = data.settings.includeDisplayName && name.length > 0

  const posterStyle = {
    '--poster-background': data.theme.background,
    '--poster-ink': data.theme.ink,
    '--poster-muted': data.theme.muted,
    '--poster-accent': data.theme.visited,
    '--poster-font': `'Inter', ${data.theme.fontFamily}`,
    width,
    height,
    transform: preview ? `scale(${previewScale})` : undefined,
  } as CSSProperties

  useEffect(() => {
    if (!preview || !previewRef.current) return
    const node = previewRef.current
    const apply = () => setPreviewScale(node.clientWidth / width)
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(node)
    return () => observer.disconnect()
  }, [preview, width])

  return (
    <div
      ref={preview ? previewRef : stageRef}
      className={preview ? 'poster-preview-viewport' : 'poster-export-stage'}
      style={preview ? { aspectRatio: `${width} / ${height}` } : { width, height }}
    >
      <article className={`travel-poster ${preview ? 'travel-poster-preview' : ''}`} style={posterStyle} lang={lang}>
        <header className="poster-header">
          <div className="poster-header-text">
            <span className="poster-eyebrow">
              {showName ? t('poster.eyebrowNamed', { name }) : t('poster.eyebrow')}
            </span>
            <h1 className="poster-title">{t('poster.title')}</h1>
          </div>
          {data.settings.includePhoto && data.settings.photoUrl && (
            <img className="poster-avatar" src={data.settings.photoUrl} alt="" />
          )}
          <div className="poster-ratio" style={{ color: data.theme.visited }}>
            <strong className="poster-ratio-visited">{num(visited)}</strong>
            <span className="poster-ratio-slash">/</span>
            <span className="poster-ratio-total">{num(total)}</span>
          </div>
        </header>

        <div className="poster-map-container">
          <GeographicMapSvg
            data={data}
            width={1100}
            height={1100}
            interactive={Boolean(onAttractionClick)}
            showMarkers={false}
            transparentBackground
            paddingRatio={0.02}
            className="poster-map-svg"
            highlightId={highlightId}
            onAttractionClick={onAttractionClick}
            onAttractionHover={onAttractionHover}
          />
        </div>

        <section className="poster-footer-section">
          <div className="poster-progress-track">
            <div
              className="poster-progress-fill"
              style={{
                width: `${Math.max(percentage, percentage > 0 ? 3 : 0)}%`,
                backgroundColor: data.theme.visited,
              }}
            />
          </div>
          <div className="poster-progress-info">
            <strong className="poster-progress-pct">{t('poster.percent', { n: num(percentage) })}</strong>
            <span className="poster-progress-counts">{t('poster.counts', { n: num(visited), u: num(visitedUpazilasCount) })}</span>
          </div>
          <div className="poster-callout">
            <span className="poster-callout-sub">{t('poster.calloutSub')}</span>
            <strong className="poster-callout-main">{t('poster.calloutMain')}</strong>
          </div>
          <footer className="poster-brand-footer">
            <img className="poster-brand-logo" src={`${import.meta.env.BASE_URL}logo.png`} alt="" width={48} height={48} />
            <span className="poster-brand-name">{SITE.posterHandle.split(' ').map((word) => <strong key={word}>{word}</strong>)}</span>
          </footer>
        </section>
      </article>
    </div>
  )
}
