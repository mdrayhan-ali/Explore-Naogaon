import { AnimatedSky, AnimatedSun, AnimatedWater, FloatingBoat, FlyingBirds, MovingClouds, PalmTree, Reeds, SUNSET_CLOUDS, rnd } from './Elements'
import './landscape.css'

const SUNSET_BIRDS = [
  { y: 50, s: 0.8, dur: 55, delay: -12 },
  { y: 80, s: 0.65, dur: 70, delay: -40 },
]

function Hut({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-9" y="-11" width="18" height="11" fill="#2d1f45" />
      <path d="M-13 -10L0 -24L13 -10Z" fill="#221736" />
      <rect x="-2" y="-8" width="4" height="5" fill="#ffd27a" />
    </g>
  )
}

/** The footer backdrop: the same illustration style as the hero, at sunset. */
export function FooterLandscape() {
  return (
    <div className="ls ls-footer" aria-hidden="true">
      <div className="ls-foot-sky">
        <AnimatedSky id="ls-foot-sky-full" stops={[[0, '#2b2757'], [0.4, '#5d3a78'], [0.75, '#b5527a'], [1, '#f08f7a']]} />
        <svg className="ls-foot-sky-art" viewBox="0 0 1600 220" preserveAspectRatio="xMidYMin slice" focusable="false">
          {Array.from({ length: 22 }, (_, i) => <circle key={i} className="ls-shimmer" cx={30 + rnd(i + 40) * 1540} cy={8 + rnd(i + 80) * 90} r={0.9 + rnd(i) * 1.1} fill="#fff6dd" style={{ animationDuration: `${2.5 + rnd(i) * 3}s`, animationDelay: `${-rnd(i + 5) * 4}s` }} />)}
          <MovingClouds clouds={SUNSET_CLOUDS} fill="#e9b7d0" shade="#c07fa8" />
          <FlyingBirds birds={SUNSET_BIRDS} color="#f3d9e6" />
        </svg>
      </div>
      <svg className="ls-foot-scene" viewBox="0 0 1600 220" preserveAspectRatio="xMidYMax slice" focusable="false">
        <defs>
          <linearGradient id="ls-foot-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbd9b8" /><stop offset=".5" stopColor="#f9b99b" /><stop offset=".8" stopColor="#f19c8c" />
          </linearGradient>
          <linearGradient id="ls-foot-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f08f7e" /><stop offset="1" stopColor="#8f4f7a" />
          </linearGradient>
        </defs>
        <rect width="1600" height="220" fill="url(#ls-foot-sky)" opacity="0" />
        <AnimatedSun id="ls-foot-sun" tone="sunset" x={925} y={50} size={150} />
        <path d="M0 140C200 110 380 120 560 138S900 110 1100 130S1450 112 1600 135V220H0Z" fill="#a35f86" />
        <path d="M0 160C220 140 420 150 620 160S1000 145 1200 158S1500 148 1600 160V220H0Z" fill="#74476f" />
        {[250, 300, 350, 560, 610, 1180, 1240].map((x, i) => <Hut key={x} x={x} y={162 + (i % 2) * 2} s={0.8 + rnd(i) * 0.4} />)}
        {[120, 160, 440, 520, 700, 1100, 1330, 1400, 1470, 1540].map((x, i) => (
          <PalmTree key={x} x={x} y={176} s={0.55 + rnd(i + 3) * 0.3} h={96} lean={(i % 2 ? -1 : 1) * 7} trunk="#2b2a45" leaf="#1f4f48" leaf2="#2a6055" delay={-i * 0.8} />
        ))}
        <path d="M0 172Q200 166 400 172T800 172T1200 172T1600 172V214H0Z" fill="url(#ls-foot-water)" />
        <AnimatedWater id="ls-w-foot" cx={800} cy={190} rx={780} ry={16} fill="#e07f7e" shine="#ffe6b0" edge="#e07f7e" strips={22} />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} className="ls-shimmer" x={970 - (30 - i * 4)} y={176 + i * 5} width={(30 - i * 4) * 2} height="2.4" rx="1.2" fill="#ffe3a6" style={{ animationDelay: `${-i * 0.6}s` }} />)}
        <FloatingBoat x={700} y={188} s={0.85} hull="#2a1b3d" trim="#6a4a80" dur={20} />
        <FloatingBoat x={470} y={184} s={0.55} hull="#2a1b3d" trim="#6a4a80" canopy={false} fisher={false} dur={26} delay={-8} flip />
        <path d="M0 207C300 198 500 212 800 206S1300 198 1600 208V220H0Z" fill="#352450" />
        <Reeds x={90} y={212} color="#4b3566" n={6} /><Reeds x={1510} y={212} color="#4b3566" n={6} /><Reeds x={760} y={214} color="#4b3566" n={4} s={.8} />
        <rect y="214" width="1600" height="6" fill="#352450" />
      </svg>
    </div>
  )
}
