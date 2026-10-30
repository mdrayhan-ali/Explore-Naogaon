import { useRef } from 'react'
import { AnimatedSky, AnimatedSun, AnimatedWater, FlyingBirds, MovingClouds, MovingRickshaw, PalmTree, Reeds, RoundTree, rnd } from './Elements'
import { Altadighi, DiborDighi, Ghughudanga, Hasaigari, Kusumba, Paharpur, Patisar } from './Landmarks'
import { useParallax } from './useParallax'
import './landscape.css'

const TREELINE = Array.from({ length: 26 }, (_, i) => ({ x: 20 + i * 62 + rnd(i) * 30, s: 0.4 + rnd(i + 5) * 0.25 }))

/**
 * The animated hero backdrop. It is a replacement for the old photo and gradient: the sky, sun, clouds
 * and birds fill the whole hero, and the ground (with all seven Naogaon landmarks) sits along the bottom.
 */
export function NaogaonHeritageLandscape() {
  const ref = useRef<HTMLDivElement>(null)
  useParallax(ref)
  return (
    <div className="ls ls-hero" ref={ref} aria-hidden="true">
      <div className="ls-layer ls-sky">
        <AnimatedSky id="ls-hero-sky" stops={[[0, '#9fd8ee'], [0.55, '#d3eef2'], [1, '#f3f7e6']]} />
      </div>
      <div className="ls-layer ls-sun-wrap"><AnimatedSun id="ls-hero-sun" /></div>
      <div className="ls-layer ls-sky-art">
        <svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMin slice" focusable="false">
          <MovingClouds />
          <FlyingBirds />
        </svg>
      </div>
      <div className="ls-layer ls-ground">
        <svg viewBox="0 0 1600 420" preserveAspectRatio="xMidYMax slice" focusable="false">
          <path d="M0 190C120 140 260 150 380 175C520 200 620 140 760 150C900 160 1000 200 1150 170C1290 140 1420 150 1600 185V420H0Z" fill="#cfe8dc" />
          <path d="M0 225C160 190 300 200 440 220C600 240 700 200 860 205C1020 210 1120 235 1260 215C1400 195 1500 205 1600 225V420H0Z" fill="#b5ddc3" />
          {TREELINE.map((t, i) => <RoundTree key={i} x={t.x} y={226 + rnd(i + 2) * 6} s={t.s} c1="#9ccfae" c2="#aedcbd" trunk="#9ccfae" delay={-i * 0.3} />)}
          <path d="M0 262C200 248 400 262 640 258S1100 248 1300 258S1500 262 1600 256V420H0Z" fill="#9fd3ae" />
          <path d="M0 318C250 305 520 322 800 312S1350 304 1600 316V420H0Z" fill="#86c79a" />
          <path d="M20 345C160 332 300 350 430 340L400 372C260 380 120 372 0 380Z" fill="#cfe59a" opacity=".7" />
          <path d="M1130 352C1260 340 1400 352 1600 340V380C1440 384 1280 376 1150 384Z" fill="#cfe59a" opacity=".7" />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M0 ${336 + i * 11}C400 ${328 + i * 11} 900 ${346 + i * 11} 1600 ${334 + i * 11}`} stroke="#78bb8e" strokeWidth="1.6" fill="none" opacity=".5" />)}

          <path d="M740 328C830 346 900 334 990 348S1190 362 1290 334" stroke="#8fd0e6" strokeWidth="13" strokeLinecap="round" fill="none" opacity=".9" />
          <path className="ls-flow" d="M740 328C830 346 900 334 990 348S1190 362 1290 334" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".7" />

          <g transform="translate(870 275)"><Paharpur /></g>
          <g transform="translate(1090 285)"><Kusumba /></g>
          <g transform="translate(345 288)"><Patisar /></g>
          <g transform="translate(1500 290)"><Altadighi /></g>
          <g transform="translate(125 292)"><Ghughudanga /></g>
          <g transform="translate(1290 296)"><DiborDighi /></g>
          <g transform="translate(610 322)"><Hasaigari /></g>

          <path d="M0 356C400 346 900 362 1600 350V372C900 384 400 366 0 376Z" fill="#e8d7ae" />
          <path d="M0 358C400 348 900 364 1600 352" stroke="#f3e6c3" strokeWidth="1.6" strokeDasharray="22 26" fill="none" />
          <MovingRickshaw y={364} />
          <path d="M0 374C400 366 900 382 1600 372V420H0Z" fill="#6fb888" />
          <AnimatedWater id="ls-w-front" cx={1040} cy={402} rx={110} ry={9} strips={6} />
          <Reeds x={930} y={408} n={5} /><Reeds x={1150} y={410} n={4} s={0.9} />
          <PalmTree x={26} y={420} s={1.15} h={130} lean={10} delay={-1} />
          <PalmTree x={1578} y={420} s={1.1} h={124} lean={-10} delay={-2} />
          <RoundTree x={300} y={422} s={0.9} delay={-.7} />
          <RoundTree x={720} y={424} s={0.75} c1="#4f9f6f" delay={-1.7} />
        </svg>
      </div>
    </div>
  )
}
