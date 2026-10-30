import { AnimatedWater, FloatingBoat, HoveringBirds, PalmTree, Reeds, RoundTree, SalTree, WalkingDeer, rnd } from './Elements'

/* Every landmark is drawn around its own origin: x = 0 is the centre, y = 0 is the ground. */

/** 1. Paharpur Buddhist Vihara (Somapura Mahavihara): a terraced, cross-shaped terracotta monastery. */
export function Paharpur() {
  const tiers = [
    { w: 112, b: 0, h: 22, c: '#b45f3b' },
    { w: 88, b: -22, h: 24, c: '#c56c46' },
    { w: 64, b: -46, h: 24, c: '#d57f59' },
    { w: 42, b: -70, h: 22, c: '#e0946e' },
  ]
  const cell = (side: number) => (
    <g transform={`scale(${side} 1)`}>
      <rect x="116" y="-15" width="44" height="15" fill="#c56c46" />
      <rect x="116" y="-17" width="44" height="3" fill="#e0946e" />
      {[124, 135, 146].map((nx) => <path key={nx} d={`M${nx - 3.5} 0V-7A3.5 3.5 0 0 1 ${nx + 3.5} -7V0Z`} fill="#7d3d22" opacity=".7" />)}
    </g>
  )
  return (
    <g data-landmark="paharpur">
      <ellipse cx="0" cy="5" rx="160" ry="13" fill="#7fc196" />
      <ellipse cx="0" cy="3" rx="128" ry="8" fill="#93d0a6" />
      {cell(1)}{cell(-1)}
      {[-1, 1].map((d) => (
        <g key={d} transform={`translate(${d * 176} 0)`}>
          <path d="M-7 0 Q-7 -16 0 -22 Q7 -16 7 0Z" fill="#e0946e" /><path d="M0 -22V-29" stroke="#b45f3b" strokeWidth="2" />
        </g>
      ))}
      {tiers.map((t) => (
        <g key={t.b}>
          <rect x={-t.w} y={t.b - t.h} width={t.w * 2} height={t.h} fill={t.c} />
          <rect x={-t.w} y={t.b - t.h} width={t.w * 2} height="2.4" fill="#f2b390" />
          {Array.from({ length: Math.floor((t.w * 2) / 12) }, (_, i) => {
            const nx = -t.w + 8 + i * 12
            return Math.abs(nx) < 14 ? null : <rect key={i} x={nx} y={t.b - t.h + 8} width="5" height="9" rx="2.5" fill="#7d3d22" opacity=".5" />
          })}
        </g>
      ))}
      <path d="M-16 0 H16 L9 -70 H-9Z" fill="#f0cfae" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${-15 + i * 0.8} ${-i * 8.5}H${15 - i * 0.8}`} stroke="#d4a77e" strokeWidth="1" />)}
      <rect x="-17" y="-112" width="34" height="20" fill="#e8a782" />
      <path d="M-5 -92V-102A5 5 0 0 1 5 -102V-92Z" fill="#7d3d22" opacity=".65" />
      <path d="M-22 -112 L0 -136 L22 -112Z" fill="#b45f3b" />
      <path d="M0 -136V-148" stroke="#8d4527" strokeWidth="2" /><circle cx="0" cy="-149" r="2.6" fill="#f0b429" />
    </g>
  )
}

/** 2. Kusumba Mosque: dark stone, rows of domes, corner turrets, a pond in front. */
export function Kusumba() {
  return (
    <g data-landmark="kusumba">
      <RoundTree x={-108} y={4} s={1.05} c1="#4f9f6f" c2="#6bb585" delay={-1} />
      <RoundTree x={112} y={4} s={0.9} c1="#5fae80" c2="#7fc196" delay={-2} />
      {[-1, 1].map((d) => (
        <g key={d} transform={`translate(${d * 76} 0)`}>
          <rect x="-6" y="-58" width="12" height="58" fill="#6a665e" />
          <path d="M-8 -58A8 8 0 0 1 8 -58Z" fill="#5a564f" /><path d="M0 -66V-72" stroke="#4a4640" strokeWidth="1.6" />
        </g>
      ))}
      <rect x="-72" y="-40" width="144" height="40" fill="#7b766d" />
      <rect x="-72" y="-14" width="144" height="14" fill="#6a665e" />
      <rect x="-72" y="-45" width="144" height="5" fill="#8e887d" />
      {[-48, -16, 16, 48].map((dx) => <rect key={dx} x={dx - 3} y="-45" width="6" height="8" fill="#8e887d" />)}
      {[-42, 0, 42].map((cx) => (
        <g key={cx}>
          <path d={`M${cx - 22} -45A22 22 0 0 1 ${cx + 22} -45Z`} fill="#5d5951" />
          <path d={`M${cx - 15} -49A17 17 0 0 1 ${cx + 2} -62`} stroke="#8a857a" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d={`M${cx} -67V-74`} stroke="#4a4640" strokeWidth="1.6" /><circle cx={cx} cy="-75" r="1.8" fill="#4a4640" />
          <path d={`M${cx - 10} 0V-24A10 10 0 0 1 ${cx + 10} -24V0Z`} fill="#34312d" />
          <path d={`M${cx - 6} 0V-22A6 6 0 0 1 ${cx + 6} -22V0Z`} fill="#4a4640" />
        </g>
      ))}
      <AnimatedWater id="ls-w-kusumba" cx={0} cy={15} rx={88} ry={11} strips={6} />
      <rect x="-56" y="6" width="112" height="7" rx="3.5" fill="#6a665e" opacity=".28" />
    </g>
  )
}

/** 3. Altadighi: wooden watch tower, big dighi (lake), dense Sal forest, deer and birds. */
export function Altadighi() {
  return (
    <g data-landmark="altadighi">
      {[-112, -96, -78, -62, 56, 70, 86, 102, 118].map((x, i) => (
        <SalTree key={x} x={x} y={2 + (i % 2) * 2} s={0.8 + rnd(i) * 0.5} delay={-i * 0.6} c1={i % 2 ? '#3a8a5e' : '#2f7d55'} />
      ))}
      <g>
        <path d="M-13 0L-8 -104M13 0L8 -104" stroke="#8c5a33" strokeWidth="3.6" strokeLinecap="round" />
        <path d="M-12 -2L9 -36M12 -2L-9 -36M-10 -34L8 -70M10 -34L-8 -70" stroke="#a67a4a" strokeWidth="1.6" />
        <path d="M-12 -4L8 -22L-8 -40L8 -58L-8 -76L8 -94" stroke="#6e4526" strokeWidth="2.4" fill="none" strokeLinejoin="round" />
        <rect x="-21" y="-109" width="42" height="5" rx="1" fill="#6e4526" />
        <rect x="-19" y="-119" width="38" height="2" fill="#8c5a33" />
        {[-17, -8, 1, 10, 17].map((px) => <rect key={px} x={px - 0.8} y="-119" width="1.6" height="10" fill="#8c5a33" />)}
        <rect x="-14" y="-130" width="28" height="21" fill="#b98b57" />
        <rect x="-8" y="-125" width="16" height="9" rx="1.5" fill="#5a3a22" />
        <path d="M-22 -130L0 -150L22 -130Z" fill="#7a4a2a" />
        <path d="M-22 -130L0 -150" stroke="#a46a3f" strokeWidth="1.2" />
      </g>
      <WalkingDeer x={-92} y={8} s={0.95} walk={36} />
      <WalkingDeer x={-48} y={9} s={0.72} walk={44} color="#b97d4c" />
      <AnimatedWater id="ls-w-altadighi" cx={8} cy={22} rx={96} ry={15} fill="#7ec7de" strips={8} />
      <HoveringBirds spots={[[-40, -118, 0.9], [38, -150, 0.8], [70, -112, 0.7]]} color="#2f5a47" />
    </g>
  )
}

/** 4. Dibor Dighi: a big historic pond with the Dibya Joyostambha stone pillar standing in the water. */
export function DiborDighi() {
  return (
    <g data-landmark="dibor-dighi">
      <RoundTree x={-130} y={4} s={1.1} delay={-1.5} />
      <PalmTree x={126} y={6} s={0.7} h={86} lean={-6} delay={-2} />
      <RoundTree x={142} y={4} s={0.85} c1="#4f9f6f" delay={-.5} />
      <AnimatedWater id="ls-w-dibor" cx={0} cy={8} rx={118} ry={19} strips={10} />
      <rect className="ls-shimmer" x="-4" y="8" width="8" height="14" rx="3" fill="#8d7f69" />
      <path d="M-13 -2 H13 L10 8 H-10Z" fill="#8d7f69" />
      <path d="M-5.6 -4L-4.2 -96H4.2L5.6 -4Z" fill="#b7a78e" />
      <path d="M-5.6 -4L-4.2 -96H-1.5L-2.6 -4Z" fill="#cdbfa8" />
      {[-26, -50, -72].map((ry) => <rect key={ry} x="-7" y={ry} width="14" height="2.6" rx="1" fill="#8d7f69" />)}
      <rect x="-8" y="-102" width="16" height="7" rx="1.5" fill="#a3937a" />
      <path d="M-6 -102Q0 -116 6 -102Z" fill="#8d7f69" />
      <path d="M0 -113V-121" stroke="#8d7f69" strokeWidth="1.6" /><circle cx="0" cy="-122" r="1.8" fill="#8d7f69" />
      <ellipse cx="-70" cy="12" rx="9" ry="3" fill="#6bb585" /><circle cx="-70" cy="10" r="2.2" fill="#f4a7c0" />
      <ellipse cx="74" cy="15" rx="8" ry="2.6" fill="#6bb585" /><circle cx="75" cy="13.6" r="2" fill="#f4a7c0" />
    </g>
  )
}

/** 5. Hasaigari Bill: a wide wetland with water plants, boats, fishermen and birds. */
export function Hasaigari() {
  return (
    <g data-landmark="hasaigari-bill">
      <AnimatedWater id="ls-w-hasaigari" cx={0} cy={6} rx={156} ry={23} fill="#86cde4" strips={16} />
      {Array.from({ length: 11 }, (_, i) => {
        const px = -120 + rnd(i + 3) * 240
        const py = -6 + rnd(i + 7) * 24
        return (
          <g key={i}>
            <ellipse cx={px} cy={py} rx="7" ry="2.4" fill="#5fae80" />
            {i % 3 === 0 && <circle cx={px + 1} cy={py - 2} r="2.2" fill="#f4a7c0" />}
          </g>
        )
      })}
      <FloatingBoat x={-62} y={8} s={0.85} dur={19} delay={-3} />
      <FloatingBoat x={52} y={14} s={0.7} hull="#a7552f" canopy={false} dur={23} delay={-9} flip />
      <Reeds x={-150} y={10} s={1.1} n={6} />
      <Reeds x={-136} y={14} s={0.8} n={5} />
      <Reeds x={150} y={10} s={1.1} n={6} />
      <Reeds x={134} y={15} s={0.85} n={5} />
      <g transform="translate(112 2)"><path d="M0 0V-12M0 -12Q4 -18 8 -18L13 -20L8 -16Q4 -12 3 -8" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" /><path d="M0 0V8" stroke="#8b6a45" strokeWidth="1.4" /></g>
      <HoveringBirds spots={[[-100, -52, 1], [20, -66, 0.85], [96, -46, 0.75], [-20, -38, 0.7]]} />
    </g>
  )
}

/** 6. Patisar Rabindra Kachharibari: a two-storey zamindar-era cutchery with arcades, garden and a book and quill. */
export function Patisar() {
  return (
    <g data-landmark="patisar-kachharibari">
      <ellipse cx="0" cy="6" rx="128" ry="12" fill="#86c79a" />
      <RoundTree x={-118} y={6} s={1.25} c1="#4f9f6f" delay={-1.2} />
      <RoundTree x={120} y={6} s={1.15} c1="#5fae80" delay={-2.4} />
      <rect x="-68" y="-58" width="136" height="58" fill="#f6e8c8" />
      <rect x="-68" y="-31" width="136" height="3.4" fill="#e2cfa6" />
      <rect x="-68" y="-4" width="136" height="4" fill="#e2cfa6" />
      {Array.from({ length: 7 }, (_, i) => {
        const cx = -51 + i * 17
        return (
          <g key={i}>
            <path d={`M${cx - 6} -4V-20A6 6 0 0 1 ${cx + 6} -20V-4Z`} fill="#8a5a3f" opacity=".85" />
            <rect x={cx - 3.5} y="-52" width="7" height="15" rx="3.5" fill="#5d8a7a" />
            <rect x={cx - 1} y="-52" width="2" height="15" fill="#f6e8c8" opacity=".6" />
          </g>
        )
      })}
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-60 + i * 17 - 1.8} y="-30" width="3.6" height="27" fill="#fff7e2" opacity=".9" />)}
      <path d="M-74 -58L-54 -78H54L74 -58Z" fill="#c0623d" />
      <path d="M-54 -78H54" stroke="#a24b2a" strokeWidth="3" />
      <path d="M-20 -58L0 -84L20 -58Z" fill="#f1ddb5" stroke="#d8c294" strokeWidth="1.2" />
      <circle cx="0" cy="-67" r="4.4" fill="#6aa6a0" /><circle cx="0" cy="-67" r="1.2" fill="#fff" />
      <path d="M0 -84V-98" stroke="#7a5a3a" strokeWidth="1.4" />
      <g transform="translate(0 -98)"><path className="ls-flag" d="M0 0H14L10 4L14 8H0Z" fill="#d94b4b" /></g>
      <path d="M-16 6H16L30 22H-30Z" fill="#ecdcb6" />
      <rect x="-14" y="0" width="28" height="4" fill="#d8c294" />
      {[-96, -80, 80, 96].map((hx, i) => <ellipse key={hx} cx={hx} cy={0} rx="10" ry="8" fill={i % 2 ? '#5fae80' : '#4f9f6f'} />)}
      {[-90, -76, 84, 98].map((fx, i) => <circle key={fx} cx={fx} cy={-3 - (i % 2) * 3} r="1.6" fill={i % 2 ? '#f4a7c0' : '#f7d56a'} />)}
      <g transform="translate(106 -64)">
        <g className="ls-float">
          <path d="M-13 1L0 5L13 1" stroke="#8b5a3c" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M-12 0L0 3V-11L-12 -14Z" fill="#fff" /><path d="M12 0L0 3V-11L12 -14Z" fill="#fdf3e0" />
          <path d="M-9 -9L-3 -7M-9 -5L-3 -3M3 -7L9 -9M3 -3L9 -5" stroke="#b9a98a" strokeWidth=".9" />
          <path d="M5 -13Q15 -30 24 -35Q20 -22 9 -12Z" fill="#f4c6d6" />
          <path d="M5 -13L9 -12" stroke="#7a5a3a" strokeWidth="1.2" />
        </g>
      </g>
    </g>
  )
}

/** 7. Ghughudanga Taltola: rows of palm trees, paddy fields, a village path and a hut. */
export function Ghughudanga() {
  const back = [-104, -70, -36, -2, 32, 66, 100]
  const front = [-87, -53, -19, 15, 49, 83, 117]
  return (
    <g data-landmark="ghughudanga-taltola">
      <ellipse cx="0" cy="8" rx="128" ry="12" fill="#8fcf9f" />
      {back.map((x, i) => <PalmTree key={x} x={x} y={-2} s={0.82} h={92 + (i % 3) * 8} lean={(i % 2 ? -1 : 1) * (4 + (i % 3) * 2)} leaf="#5fae80" leaf2="#7fc196" trunk="#9a7b58" delay={-i * 0.7} />)}
      {front.map((x, i) => <PalmTree key={x} x={x} y={10} s={1} h={106 + ((i * 5) % 3) * 8} lean={(i % 2 ? 1 : -1) * (5 + (i % 3) * 2)} delay={-i * 0.9 - 0.4} />)}
      <g transform="translate(-132 8)">
        <rect x="-9" y="-12" width="18" height="12" fill="#c9a26f" /><path d="M-13 -11L0 -26L13 -11Z" fill="#a8803f" /><rect x="-2.5" y="-8" width="5" height="8" fill="#5a3a22" />
      </g>
      <path d="M-44 14C-24 18 10 22 32 30" stroke="#e8d7ae" strokeWidth="9" strokeLinecap="round" fill="none" opacity=".85" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${-130 + i * 8} ${26 + i * 7}C-60 ${20 + i * 7} 40 ${34 + i * 6} 140 ${26 + i * 7}`} stroke={i % 2 ? '#78bb8e' : '#cfe59a'} strokeWidth="3.2" fill="none" opacity=".75" />)}
    </g>
  )
}
