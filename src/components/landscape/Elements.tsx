import type { CSSProperties } from 'react'

/** Typed helper for CSS custom properties in style props. */
export const vars = (values: Record<string, string | number>) => values as unknown as CSSProperties

/** Deterministic pseudo random number in [0,1) so the artwork is identical on every render. */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/* ---------------------------------------------------------------- sky */

export function AnimatedSky({ id, stops }: { id: string; stops: Array<[number, string]> }) {
  return (
    <svg className="ls-sky-gradient" viewBox="0 0 10 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {stops.map(([offset, color]) => <stop key={offset} offset={offset} stopColor={color} />)}
        </linearGradient>
      </defs>
      <rect width="10" height="10" fill={`url(#${id})`} />
    </svg>
  )
}

const SUN = {
  day: { glow: '#fff3b8', rayA: '#ffe38a', rayB: '#ffd15c', outer: '#ffd45e', inner: '#ffe99a' },
  sunset: { glow: '#ffd3a0', rayA: '#ffc48a', rayB: '#ffa87a', outer: '#ffab6e', inner: '#ffd09a' },
}

export function AnimatedSun({ id, tone = 'day', className, x, y, size }: {
  id: string
  tone?: 'day' | 'sunset'
  className?: string
  x?: number
  y?: number
  size?: number
}) {
  const c = SUN[tone]
  const box = size ? { x, y, width: size, height: size } : {}
  return (
    <svg className={`ls-sun${className ? ` ${className}` : ''}`} viewBox="-100 -100 200 200" aria-hidden="true" focusable="false" {...box}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0.3" stopColor={c.glow} stopOpacity=".85" />
          <stop offset="1" stopColor={c.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="98" fill={`url(#${id})`} />
      <g className="ls-sun-rays">
        {Array.from({ length: 16 }, (_, i) => (
          <path key={i} d="M-4.5 -50 L0 -92 L4.5 -50 Z" fill={i % 2 ? c.rayB : c.rayA} transform={`rotate(${i * 22.5})`} />
        ))}
      </g>
      <circle r="38" fill={c.outer} />
      <circle r="30" fill={c.inner} />
    </svg>
  )
}

export interface CloudSpec { y: number; s: number; dur: number; delay: number; o: number; x: number }
export const DAY_CLOUDS: CloudSpec[] = [
  { y: 70, s: 1, dur: 110, delay: -30, o: 0.95, x: 120 },
  { y: 150, s: 0.7, dur: 140, delay: -90, o: 0.8, x: 700 },
  { y: 36, s: 0.55, dur: 170, delay: -120, o: 0.75, x: 1100 },
  { y: 205, s: 0.85, dur: 125, delay: -60, o: 0.7, x: 1400 },
  { y: 112, s: 0.6, dur: 150, delay: -8, o: 0.8, x: 420 },
]
export const SUNSET_CLOUDS: CloudSpec[] = [
  { y: 22, s: 0.7, dur: 130, delay: -20, o: 0.9, x: 260 },
  { y: 62, s: 0.5, dur: 160, delay: -100, o: 0.8, x: 800 },
  { y: 30, s: 0.6, dur: 145, delay: -60, o: 0.85, x: 1250 },
]

export function MovingClouds({ clouds = DAY_CLOUDS, fill = '#ffffff', shade = '#dcedf2' }: { clouds?: CloudSpec[]; fill?: string; shade?: string }) {
  return (
    <g className="ls-clouds">
      {clouds.map((c, i) => (
        <g key={i} transform={`translate(0 ${c.y})`}>
          <g className="ls-cloud" style={vars({ '--dur': `${c.dur}s`, '--delay': `${c.delay}s`, '--x': `${c.x}px` })} opacity={c.o}>
            <g transform={`scale(${c.s})`}>
              <ellipse cx="70" cy="50" rx="72" ry="14" fill={shade} />
              <ellipse cx="70" cy="44" rx="70" ry="16" fill={fill} />
              <circle cx="40" cy="30" r="20" fill={fill} />
              <circle cx="72" cy="20" r="26" fill={fill} />
              <circle cx="106" cy="32" r="18" fill={fill} />
            </g>
          </g>
        </g>
      ))}
    </g>
  )
}

export interface BirdSpec { y: number; s: number; dur: number; delay: number }
export const BIRDS: BirdSpec[] = [
  { y: 90, s: 1, dur: 46, delay: -10 },
  { y: 118, s: 0.8, dur: 52, delay: -17 },
  { y: 70, s: 0.7, dur: 60, delay: -38 },
  { y: 150, s: 0.9, dur: 70, delay: -50 },
]

export function FlyingBirds({ birds = BIRDS, color = '#35574b' }: { birds?: BirdSpec[]; color?: string }) {
  return (
    <g className="ls-birds">
      {birds.map((b, i) => (
        <g key={i} transform={`translate(0 ${b.y})`}>
          <g className="ls-bird-flight" style={vars({ '--dur': `${b.dur}s`, '--delay': `${b.delay}s` })}>
            <g transform={`scale(${b.s})`}>
              <g className="ls-bird" style={vars({ '--flap-delay': `${-i * 0.23}s` })}>
                <path d="M-10 0 Q-5 -8 0 0 Q5 -8 10 0" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          </g>
        </g>
      ))}
    </g>
  )
}

/** A few birds that circle in place (forest, wetland) instead of crossing the whole scene. */
export function HoveringBirds({ spots, color = '#35574b' }: { spots: Array<[number, number, number]>; color?: string }) {
  return (
    <g>
      {spots.map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <g className="ls-bird-hover" style={vars({ '--delay': `${-i * 3.1}s`, '--dur': `${8 + i * 1.7}s` })}>
            <g className="ls-bird" style={vars({ '--flap-delay': `${-i * 0.3}s` })}>
              <path d="M-9 0 Q-4.5 -7 0 0 Q4.5 -7 9 0" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
            </g>
          </g>
        </g>
      ))}
    </g>
  )
}

/* -------------------------------------------------------------- water */

export function AnimatedWater({ id, cx, cy, rx, ry, fill = '#8fd0e6', shine = '#ffffff', edge, strips = 9 }: {
  id: string; cx: number; cy: number; rx: number; ry: number; fill?: string; shine?: string; edge?: string; strips?: number
}) {
  return (
    <g className="ls-water">
      <defs><clipPath id={id}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath></defs>
      <ellipse cx={cx} cy={cy} rx={rx + 3} ry={ry + 2.5} fill={edge ?? '#7fc196'} opacity=".7" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} />
      <g clipPath={`url(#${id})`}>
        {Array.from({ length: strips }, (_, i) => {
          const w = 14 + rnd(i + rx) * 30
          const px = cx - rx * 0.8 + rnd(i * 3 + ry) * rx * 1.6
          const py = cy - ry * 0.7 + (i / strips) * ry * 1.4
          return (
            <rect key={i} className="ls-shimmer" x={px - w / 2} y={py} width={w} height="2.4" rx="1.2" fill={shine}
              style={vars({ '--dur': `${3 + rnd(i) * 3}s`, '--delay': `${-rnd(i + 9) * 5}s` })} />
          )
        })}
      </g>
    </g>
  )
}

export function FloatingBoat({ x, y, s = 1, hull = '#b9663f', trim = '#f4d7a4', canopy = true, fisher = true, dur = 16, delay = 0, flip = false }: {
  x: number; y: number; s?: number; hull?: string; trim?: string; canopy?: boolean; fisher?: boolean; dur?: number; delay?: number; flip?: boolean
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g className="ls-boat-drift" style={vars({ '--dur': `${dur}s`, '--delay': `${delay}s` })}>
        <g className="ls-boat-bob">
          {fisher && (
            <g>
              <path d="M-4 -4 Q-4 -18 2 -20 Q8 -18 8 -4Z" fill="#5a7ba6" />
              <circle cx="2" cy="-24" r="4" fill="#d8a47a" />
              <path d="M-5 -26 L2 -36 L9 -26Z" fill="#e7c26a" />
              <path d="M8 -14 L26 -30" stroke="#7a5a3a" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M26 -30 Q30 -18 24 -8" stroke="#7a5a3a" strokeWidth=".8" fill="none" />
            </g>
          )}
          {canopy && <path d="M-26 -2 Q-18 -16 -6 -2Z" fill={trim} opacity={fisher ? 0 : 1} />}
          <path d="M-34 -2 Q-28 12 -8 12 H12 Q30 12 36 -2 Z" fill={hull} />
          <path d="M-33 -2 H35" stroke={trim} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M-20 4 H24" stroke={trim} strokeWidth="1.2" opacity=".6" />
          <path d="M-34 14 Q0 20 36 14" stroke="#ffffff" strokeWidth="1.4" fill="none" opacity=".5" />
        </g>
      </g>
    </g>
  )
}

/* ------------------------------------------------------------- rickshaw */

function Wheel({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g className="ls-wheel">
        <circle r={r} fill="none" stroke="#3b3b3b" strokeWidth="2" />
        <circle r={r - 2.5} fill="none" stroke="#ffffff" strokeWidth=".6" opacity=".5" />
        <path d={`M${-r} 0H${r}M0 ${-r}V${r}M${-r * 0.7} ${-r * 0.7}L${r * 0.7} ${r * 0.7}M${-r * 0.7} ${r * 0.7}L${r * 0.7} ${-r * 0.7}`} stroke="#6b6b6b" strokeWidth=".9" />
        <circle r="1.6" fill="#3b3b3b" />
      </g>
    </g>
  )
}

/** A Bengali cycle rickshaw that crosses the road now and then. y is the road line. */
export function MovingRickshaw({ y, dur = 44, delay = -4 }: { y: number; dur?: number; delay?: number }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <g className="ls-rickshaw" style={vars({ '--dur': `${dur}s`, '--delay': `${delay}s` })}>
        <g className="ls-boat-bob">
          <path d="M-14 -10 H34" stroke="#3b3b3b" strokeWidth="2" />
          <path d="M34 -10 L40 -24" stroke="#3b3b3b" strokeWidth="2" />
          <path d="M-26 -12 H-6 V-26 H-26Z" fill="#f2c14e" />
          <path d="M-28 -26 Q-16 -52 -2 -26Z" fill="#e8567a" />
          <path d="M-28 -26 Q-16 -52 -2 -26" stroke="#b83a5c" strokeWidth="1.4" fill="none" />
          <path d="M-26 -12 H-6" stroke="#8f5a1f" strokeWidth="2" />
          <circle cx="-16" cy="-30" r="3.4" fill="#d8a47a" />
          <path d="M-20 -26 Q-16 -36 -12 -26Z" fill="#6aa6a0" />
          <path d="M6 -36 L12 -24 L30 -24" stroke="#4a6c8f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="8" cy="-44" r="4.2" fill="#d8a47a" />
          <path d="M3 -46 Q8 -52 13 -46Z" fill="#f5f5f5" />
          <path d="M30 -24 L34 -6" stroke="#4a6c8f" strokeWidth="4" strokeLinecap="round" />
        </g>
        <Wheel cx={-12} cy={-9} r={9} />
        <Wheel cx={38} cy={-9} r={9} />
      </g>
    </g>
  )
}

/* ---------------------------------------------------------------- deer */

export function WalkingDeer({ x, y, s = 1, color = '#c98b56', walk = 34 }: { x: number; y: number; s?: number; color?: string; walk?: number }) {
  const leg = (lx: number, back: boolean) => (
    <g transform={`translate(${lx} -12)`}>
      <rect className={`ls-leg${back ? ' b' : ''}`} x="-1.3" y="0" width="2.6" height="13" rx="1.3" fill="#8f5d36" />
    </g>
  )
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="ls-deer-walk" style={vars({ '--dur': `${walk}s` })}>
        {leg(-11, true)}{leg(9, false)}
        <ellipse cx="-1" cy="-17" rx="17" ry="8" fill={color} />
        {leg(-6, false)}{leg(13, true)}
        <path d="M10 -20 Q18 -26 20 -34 L25 -33 Q24 -22 17 -15Z" fill={color} />
        <ellipse cx="25" cy="-34" rx="6" ry="3.8" fill={color} transform="rotate(-12 25 -34)" />
        <circle cx="29" cy="-34" r="1.3" fill="#3b2a1a" />
        <path d="M22 -37 L19 -42 L24 -39Z" fill="#a8703f" />
        <path d="M23 -38 L21 -48 M21 -48 L17 -50 M21 -48 L22 -53 M26 -38 L27 -48 M27 -48 L31 -50" stroke="#7a5a3a" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <circle cx="-8" cy="-20" r="1.3" fill="#f7e4c4" /><circle cx="-1" cy="-22" r="1.3" fill="#f7e4c4" />
        <circle cx="5" cy="-19" r="1.3" fill="#f7e4c4" /><circle cx="-4" cy="-15" r="1.1" fill="#f7e4c4" />
        <path d="M-17 -19 Q-21 -22 -20 -16Z" fill="#f7e4c4" />
      </g>
    </g>
  )
}

/* --------------------------------------------------------------- trees */

export function RoundTree({ x, y, s = 1, c1 = '#5fae80', c2 = '#7fc196', trunk = '#8b5e3c', delay = 0 }: {
  x: number; y: number; s?: number; c1?: string; c2?: string; trunk?: string; delay?: number
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="ls-sway" style={vars({ '--delay': `${delay}s`, '--dur': `${4.5 + rnd(x) * 2}s` })}>
        <rect x="-2.5" y="-18" width="5" height="18" rx="2" fill={trunk} />
        <circle cx="0" cy="-30" r="16" fill={c1} />
        <circle cx="-11" cy="-23" r="11" fill={c1} />
        <circle cx="11" cy="-23" r="11" fill={c1} />
        <circle cx="-3" cy="-35" r="9" fill={c2} />
        <circle cx="8" cy="-28" r="6" fill={c2} opacity=".8" />
      </g>
    </g>
  )
}

export function SalTree({ x, y, s = 1, c1 = '#3f8f63', c2 = '#58a877', delay = 0 }: { x: number; y: number; s?: number; c1?: string; c2?: string; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="ls-sway" style={vars({ '--delay': `${delay}s`, '--dur': `${5.5 + rnd(x + 4) * 2}s`, '--amp': '1deg' })}>
        <rect x="-2" y="-20" width="4" height="20" fill="#7a5233" />
        <path d="M0 -96 C-24 -74 -30 -26 -6 -14 H6 C30 -26 24 -74 0 -96Z" fill={c1} />
        <path d="M0 -90 C-10 -72 -14 -40 -3 -22 C10 -38 12 -70 0 -90Z" fill={c2} opacity=".7" />
      </g>
    </g>
  )
}

export function PalmTree({ x, y, s = 1, h = 100, lean = 8, trunk = '#8b6a45', leaf = '#4f9f6f', leaf2 = '#6bb585', delay = 0 }: {
  x: number; y: number; s?: number; h?: number; lean?: number; trunk?: string; leaf?: string; leaf2?: string; delay?: number
}) {
  const angles = [-165, -130, -95, -60, -25, 10, 45]
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="ls-sway" style={vars({ '--delay': `${delay}s`, '--dur': `${5 + rnd(x + 2) * 2.5}s` })}>
        <path d={`M0 0 Q${lean * 0.2} ${-h / 2} ${lean} ${-h}`} stroke={trunk} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d={`M0 0 Q${lean * 0.2} ${-h / 2} ${lean} ${-h}`} stroke="#00000022" strokeWidth="1.2" strokeDasharray="2 5" fill="none" />
        <g transform={`translate(${lean} ${-h})`}>
          <g className="ls-frond-sway" style={vars({ '--delay': `${delay * 0.7}s` })}>
            {angles.map((a, i) => (
              <path key={a} d="M0 0 C6 -16 26 -22 42 -8 C28 -12 12 -8 0 0Z" fill={i % 2 ? leaf2 : leaf} transform={`rotate(${a})`} />
            ))}
            <circle cx="0" cy="2" r="3" fill="#7a5a35" />
          </g>
        </g>
      </g>
    </g>
  )
}

export function Reeds({ x, y, s = 1, color = '#4f9f6f', n = 5 }: { x: number; y: number; s?: number; color?: string; n?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="ls-sway" style={vars({ '--amp': '3deg', '--dur': `${3.2 + rnd(x) * 2}s`, '--delay': `${-rnd(x + 1) * 3}s` })}>
        {Array.from({ length: n }, (_, i) => {
          const dx = (i - n / 2) * 4
          const hh = 22 + rnd(i + x) * 14
          return (
            <g key={i}>
              <path d={`M${dx} 0 Q${dx + (i % 2 ? 4 : -4)} ${-hh / 2} ${dx + (i - 2)} ${-hh}`} stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
              {i % 2 === 0 && <ellipse cx={dx + (i - 2)} cy={-hh - 3} rx="1.8" ry="5" fill="#8b6a45" />}
            </g>
          )
        })}
      </g>
    </g>
  )
}
