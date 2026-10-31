import { useMemo, useState } from 'react'
import { ADMIN_BOUNDARIES, VERIFIED_ATTRACTIONS } from '../data/naogaon/model'
import { SITE } from '../config/site'
import { useLang } from '../i18n/LanguageContext'
import { geometryPaths, makeProjector } from './GeographicMapSvg'
import { NaogaonHeritageLandscape } from './landscape/NaogaonHeritageLandscape'
import { scrollToSection } from './SiteHeader'
import { IconArrow, IconPin } from './Icons'

const SIZE = 520

/** A decorative, live version of the district: every pin is one of the real places. */
function HeroMap({ visitedIds, onPick }: { visitedIds: Set<string>; onPick: (id: string) => void }) {
  const { t, placeName, upazilaName } = useLang()
  const [hover, setHover] = useState<string | null>(null)
  const { project } = useMemo(() => makeProjector({ boundaries: ADMIN_BOUNDARIES }, SIZE, SIZE, 0.04), [])
  const district = ADMIN_BOUNDARIES.features.find((feature) => feature.properties.shapeType === 'ADM2')
  const upazilas = ADMIN_BOUNDARIES.features.filter((feature) => feature.properties.shapeType === 'ADM3')
  const outline = useMemo(() => (district ? geometryPaths(district.geometry, project) : ''), [district, project])
  const inner = useMemo(() => upazilas.map((feature) => geometryPaths(feature.geometry, project)), [upazilas, project])
  const hovered = VERIFIED_ATTRACTIONS.find((attraction) => attraction.id === hover)

  return (
    <div className="hero-map" aria-label={t('hero.mapAria')}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="group">
        <path d={outline} className="hero-map-shape" pathLength={1} />
        {inner.map((d, index) => <path key={index} d={d} className="hero-map-upazila" />)}
        <path d={outline} className="hero-map-edge" />
        {VERIFIED_ATTRACTIONS.map((attraction, index) => {
          const [x, y] = project(attraction.coordinates)
          const done = visitedIds.has(attraction.id)
          return (
            <g
              key={attraction.id}
              className={`hero-pin${done ? ' is-visited' : ''}${hover === attraction.id ? ' is-hover' : ''}`}
              transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}
              tabIndex={0}
              role="button"
              aria-label={placeName(attraction)}
              onMouseEnter={() => setHover(attraction.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(attraction.id)}
              onBlur={() => setHover(null)}
              onClick={() => onPick(attraction.id)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onPick(attraction.id) } }}
            >
              <g className="hero-pin-inner" style={{ animationDelay: `${300 + index * 45}ms` }}>
                <circle className="hero-pin-pulse" r="9" />
                <circle className="hero-pin-dot" r="5.2" />
              </g>
            </g>
          )
        })}
      </svg>
      <div className={`hero-map-caption${hovered ? ' has-hover' : ''}`} aria-live="polite">
        {hovered
          ? (<><IconPin width={16} height={16} /> {placeName(hovered)} <small>· {upazilaName(hovered.upazilaId)}</small></>)
          : t('hero.pinHint')}
      </div>
    </div>
  )
}

export function Hero({ visitedIds, visitedCount, total, onPick }: {
  visitedIds: Set<string>
  visitedCount: number
  total: number
  onPick: (id: string) => void
}) {
  const { t, num } = useLang()
  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <NaogaonHeritageLandscape />
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> {SITE.name}</span>
          <h1 id="hero-title">
            {t('hero.line1')}<br /><em>{t('hero.line2')}</em>
          </h1>
          <p className="hero-lead">{t('hero.lead')}</p>
          <div className="hero-buttons">
            <button type="button" className="btn btn-gold" onClick={() => scrollToSection('map')}>
              {t('hero.cta')} <IconArrow width={18} height={18} />
            </button>
          </div>
          <div className="hero-progress">
            <div className="hero-progress-track"><span style={{ width: `${total ? (visitedCount / total) * 100 : 0}%` }} /></div>
            <span>{visitedCount === 0 ? t('hero.progress.none') : t('hero.progress.some', { n: num(visitedCount) })}</span>
          </div>
        </div>
        <HeroMap visitedIds={visitedIds} onPick={onPick} />
      </div>
    </section>
  )
}
