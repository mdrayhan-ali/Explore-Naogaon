import type { Geometry } from 'geojson'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AttractionRegion } from '../types/geography'
import type { PosterData } from '../features/export/posterTypes'
import { useLang } from '../i18n/LanguageContext'
import { layoutLabels } from '../lib/labelLayout'
import { poleOfInaccessibility, signedRingArea } from '../gis/geometry'
import type { PolygonCoords } from '../gis/geometry'

type XY = [number, number]
type LocatedAttraction = PosterData['attractions'][number]
type HoveredAttraction = { name: string; x: number; y: number }

function tooltipPosition(clientX: number, clientY: number) {
  return {
    x: Math.max(8, Math.min(clientX + 12, window.innerWidth - 280)),
    y: Math.max(8, Math.min(clientY + 12, window.innerHeight - 72)),
  }
}

export function geometryPaths(geometry: Geometry, project: (coordinate: number[]) => XY) {
  const ringPath = (coordinates: number[][]) => coordinates
    .map((coordinate, index) => {
      const [x, y] = project(coordinate)
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ') + ' Z'

  if (geometry.type === 'Polygon') return geometry.coordinates.map(ringPath).join(' ')
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flatMap((polygon) => polygon.map(ringPath)).join(' ')
  return ''
}

function collectCoordinates(geometry: Geometry): number[][] {
  if (geometry.type === 'Point') return [geometry.coordinates]
  if (geometry.type === 'MultiPoint' || geometry.type === 'LineString') return geometry.coordinates
  if (geometry.type === 'MultiLineString' || geometry.type === 'Polygon') return geometry.coordinates.flat()
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat(2)
  if (geometry.type === 'GeometryCollection') return geometry.geometries.flatMap(collectCoordinates)
  return []
}

export function makeProjector(data: Pick<PosterData, 'boundaries'>, width: number, height: number, paddingRatio = 0.065) {
  const district = data.boundaries.features.find((feature) => feature.properties.shapeType === 'ADM2')
  if (!district) return { project: (_coordinate: number[]) => [0, 0] as XY }

  const coordinates = collectCoordinates(district.geometry)
  const referenceLatitude = coordinates.reduce((sum, coordinate) => sum + coordinate[1], 0) / coordinates.length
  const longitudeScale = Math.cos(referenceLatitude * Math.PI / 180)
  const projected = coordinates.map(([longitude, latitude]) => [longitude * longitudeScale, -latitude] as XY)
  const minX = Math.min(...projected.map(([x]) => x))
  const maxX = Math.max(...projected.map(([x]) => x))
  const minY = Math.min(...projected.map(([, y]) => y))
  const maxY = Math.max(...projected.map(([, y]) => y))
  const padding = Math.min(width, height) * paddingRatio
  const scale = Math.min((width - padding * 2) / (maxX - minX), (height - padding * 2) / (maxY - minY))
  const offsetX = (width - (maxX - minX) * scale) / 2
  const offsetY = (height - (maxY - minY) * scale) / 2

  return {
    project: (coordinate: number[]): XY => {
      const x = coordinate[0] * longitudeScale
      const y = -coordinate[1]
      return [offsetX + (x - minX) * scale, offsetY + (y - minY) * scale]
    },
  }
}

function upazilaCenter(feature: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>) {
  const coordinates = collectCoordinates(feature.geometry)
  const longitudes = coordinates.map(([longitude]) => longitude)
  const latitudes = coordinates.map(([, latitude]) => latitude)
  return [
    (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
  ]
}

function regionColors(region: AttractionRegion, data: PosterData) {
  const visited = data.visitedIds.includes(region.properties.attractionId)
  return {
    fill: data.settings.mapStyle === 'outline'
      ? 'transparent'
      : visited ? data.theme.visited : data.theme.unvisited,
    opacity: data.settings.mapStyle === 'outline' ? 0.9 : 0.84,
  }
}

export function GeographicMapSvg({
  data,
  width,
  height,
  interactive = false,
  showMarkers = true,
  transparentBackground = false,
  paddingRatio,
  className = 'poster-map-artwork',
  highlightId = null,
  onAttractionClick,
  onAttractionHover,
}: {
  data: PosterData
  width: number
  height: number
  interactive?: boolean
  showMarkers?: boolean
  transparentBackground?: boolean
  paddingRatio?: number
  className?: string
  /** A place to emphasise from outside the map, e.g. while its name is hovered in the list. */
  highlightId?: string | null
  onAttractionClick?: (attraction: LocatedAttraction) => void
  onAttractionHover?: (attractionId: string | null) => void
}) {
  const { t, upazilaName, placeName } = useLang()
  const [hoveredAttraction, setHoveredAttraction] = useState<HoveredAttraction | null>(null)
  const effectivePadding = paddingRatio ?? (transparentBackground ? 0.02 : 0.065)
  const { project } = makeProjector(data, width, height, effectivePadding)
  const district = data.boundaries.features.find((feature) => feature.properties.shapeType === 'ADM2')
  const upazilas = data.boundaries.features.filter((feature) => feature.properties.shapeType === 'ADM3')
  const attractionById = new Map(data.attractions.map((attraction) => [attraction.id, attraction]))
  const drawRegions = data.regions.filter((region) => attractionById.has(region.properties.attractionId))

  // Each place gets one dot in the middle of its coloured area (not at its exact GPS pin),
  // so the dot always sits inside the area the visitor can see and click.
  const centers = useMemo(() => {
    const result = new Map<string, XY>()
    const bestArea = new Map<string, number>()
    for (const region of data.regions) {
      if (region.properties.regionType === 'mapped-attraction-footprint') continue
      const geometry = region.geometry
      const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : []
      for (const polygon of polygons) {
        const projected = polygon.map((ring) => ring.map((coordinate) => project(coordinate))) as PolygonCoords
        const area = Math.abs(signedRingArea(projected[0] ?? []))
        const id = region.properties.attractionId
        if (area <= (bestArea.get(id) ?? 0)) continue
        bestArea.set(id, area)
        result.set(id, poleOfInaccessibility(projected, 0.5) as XY)
      }
    }
    return result
    // `project` is rebuilt every render from the same boundaries, so only its inputs matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.regions, data.boundaries, width, height, effectivePadding])
  const centerOf = (attraction: LocatedAttraction): XY => centers.get(attraction.id) ?? project(attraction.coordinates)

  // Names are written only for the places the visitor has marked as seen.
  const labelFontSize = Math.max(20, width * 0.026)
  const dotRadius = Math.max(5, width * 0.0055)
  const visitedAttractions = data.attractions.filter((attraction) => data.visitedIds.includes(attraction.id))
  const labelPlacements = data.settings.showPlaceNames
    ? layoutLabels(
      visitedAttractions.map((attraction) => {
        const [x, y] = centerOf(attraction)
        return { id: attraction.id, x, y, text: placeName(attraction), priority: attraction.importance ?? 1 }
      }),
      { fontSize: labelFontSize, dotRadius, width, height },
    )
    : new Map()

  return (
    <div
      className={interactive ? 'geographic-map-interactive' : 'poster-map-svg-wrap'}
      onMouseLeave={interactive ? () => { setHoveredAttraction(null); onAttractionHover?.(null) } : undefined}
      style={interactive ? undefined : { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        className={className}
        viewBox={`0 0 ${width} ${height}`}
        role={interactive ? 'group' : 'img'}
        aria-label={t('map.aria')}
      >
      {!transparentBackground && (
        <>
          <defs>
            <pattern id="poster-map-paper" width="34" height="34" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.1" fill={data.theme.accent} opacity="0.11" />
            </pattern>
          </defs>
          <rect width={width} height={height} rx={30} fill={data.theme.mapBackground} />
          <rect width={width} height={height} rx={30} fill="url(#poster-map-paper)" />
        </>
      )}
      {drawRegions.map((region) => {
        const attraction = attractionById.get(region.properties.attractionId)
        if (!attraction) return null
        const colors = regionColors(region, data)
        const visited = data.visitedIds.includes(attraction.id)
        const highlighted = highlightId === attraction.id
        const name = placeName(attraction)
        return (
          <path
            key={region.id}
            d={geometryPaths(region.geometry, project)}
            fill={colors.fill}
            fillOpacity={data.settings.mapStyle === 'outline' ? 0 : colors.opacity}
            stroke={data.settings.mapStyle === 'outline'
              ? visited ? data.theme.visited : data.theme.muted
              :'#ffffff'}
            strokeOpacity={visited ? 0.9 : 0.95}
            strokeWidth={highlighted ? Math.max(4, width * 0.005) : Math.max(2.5, width * 0.0035)}
            strokeLinejoin="round"
            className={interactive ? `geographic-map-region${visited ? ' is-visited' : ''}${highlighted ? ' is-highlight' : ''}` : undefined}
            style={{ outline: 'none' }}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? name : undefined}
            aria-pressed={interactive ? visited : undefined}
            onClick={interactive ? () => onAttractionClick?.(attraction) : undefined}
            onMouseEnter={interactive ? (event) => {
              onAttractionHover?.(attraction.id)
              setHoveredAttraction({ name, ...tooltipPosition(event.clientX, event.clientY) })
            } : undefined}
            onMouseMove={interactive ? (event) => setHoveredAttraction({
              name,
              ...tooltipPosition(event.clientX, event.clientY),
            }) : undefined}
            onKeyDown={interactive ? (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              onAttractionClick?.(attraction)
            } : undefined}
            onFocus={interactive ? () => setHoveredAttraction({ name, ...tooltipPosition(0, 0) }) : undefined}
            onBlur={interactive ? () => { setHoveredAttraction(null); onAttractionHover?.(null) } : undefined}
          />
        )
      })}
      {upazilas.map((feature) => (
        <g key={feature.properties.shapeID} pointerEvents="none">
          <path
            d={geometryPaths(feature.geometry, project)}
            fill="none"
            stroke="#ffffff"
            strokeWidth={Math.max(1.4, width * 0.0017)}
            strokeOpacity="0.95"
            strokeLinejoin="round"
          />
          {data.settings.showUpazilaNames && (
            <text
              x={project(upazilaCenter(feature))[0]}
              y={project(upazilaCenter(feature))[1]}
              textAnchor="middle"
              className="poster-upazila-label"
              fill={data.theme.ink}
              fontSize={Math.max(15, width * 0.019)}
            >
              {upazilaName(feature.properties.shapeName)}
            </text>
          )}
        </g>
      ))}
      {district && (
        <path
          d={geometryPaths(district.geometry, project)}
          fill="none"
          stroke={data.theme.accent}
          strokeWidth={Math.max(3, width * 0.004)}
          strokeLinejoin="round"
          pointerEvents="none"
        />
      )}
      {showMarkers && data.attractions.map((attraction) => {
        const [x, y] = project(attraction.coordinates)
        const visited = data.visitedIds.includes(attraction.id)
        return (
          <circle key={attraction.id} cx={x} cy={y} r={Math.max(7, width * 0.009)} fill={visited ? data.theme.visited : data.theme.unvisited} stroke="#fff" strokeWidth={Math.max(2, width * 0.002)} />
        )
      })}
      {data.settings.showPlaceNames && visitedAttractions.map((attraction) => {
        const [x, y] = centerOf(attraction)
        const label = labelPlacements.get(attraction.id)
        return (
          <g key={`label-${attraction.id}`} pointerEvents="none" className="map-place-label">
            <circle cx={x} cy={y} r={dotRadius} fill="#d64545" stroke="#fff" strokeWidth={Math.max(1.5, width * 0.0018)} />
            {label && (
              <text
                x={label.x}
                y={label.y}
                textAnchor={label.anchor}
                className="poster-place-label"
                fill={data.theme.ink}
                fontSize={labelFontSize}
                fontWeight={700}
                stroke={data.theme.background}
                strokeWidth={Math.max(4, width * 0.0045)}
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {placeName(attraction)}
              </text>
            )}
          </g>
        )
      })}
      </svg>
      {interactive && hoveredAttraction && createPortal(
        <div
          className="geographic-map-tooltip"
          role="tooltip"
          style={{ left: hoveredAttraction.x, top: hoveredAttraction.y }}
        >
          {hoveredAttraction.name}
        </div>,
        document.body,
      )}
    </div>
  )
}
