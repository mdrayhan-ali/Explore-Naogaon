export type MapTheme = {
  id: 'nature' | 'blue' | 'monochrome' | 'night' | 'amber'
  label: string
  background: string
  mapBackground: string
  visited: string
  unvisited: string
  selected: string
  ink: string
  muted: string
  accent: string
  decoration: string
  fontFamily: string
}

export const THEMES: MapTheme[] = [
  { id: 'nature', label: 'প্রকৃতি সবুজ', background: '#f5f8ed', mapBackground: '#f1f3e8', visited: '#27835c', unvisited: '#d8e1d5', selected: '#1386bd', ink: '#174a3b', muted: '#5d7265', accent: '#087654', decoration: '#c8dfc8', fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif" },
  { id: 'blue', label: 'নীল আকাশ', background: '#edf6fa', mapBackground: '#eaf4f7', visited: '#287d94', unvisited: '#d3e2e7', selected: '#a3451b', ink: '#183f53', muted: '#56717b', accent: '#22677c', decoration: '#bcd8e1', fontFamily: "'Noto Sans Bengali', 'Segoe UI', sans-serif" },
  { id: 'monochrome', label: 'মিনিমাল / সিমারেখা', background: '#f4f3ef', mapBackground: '#f1f0eb', visited: '#505d57', unvisited: '#d9d9d2', selected: '#2f7191', ink: '#343d38', muted: '#656b66', accent: '#4f5b54', decoration: '#d3d2ca', fontFamily: "'Noto Sans Bengali', sans-serif" },
  { id: 'night', label: 'ডার্ক নেভি', background: '#102431', mapBackground: '#172d39', visited: '#48bd8c', unvisited: '#41545d', selected: '#6ec6ed', ink: '#eaf3ed', muted: '#a3b6b4', accent: '#46a77f', decoration: '#35545d', fontFamily: "'Noto Sans Bengali', 'Segoe UI', sans-serif" },
  { id: 'amber', label: 'উষ্ণ সূর্যাস্ত', background: '#fff6e9', mapBackground: '#fff1df', visited: '#925023', unvisited: '#e8d7c1', selected: '#3287a4', ink: '#543d2d', muted: '#735b43', accent: '#925023', decoration: '#edd2ad', fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif" },
]
