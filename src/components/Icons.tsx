import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const

/** The Explore Naogaon mark: a rice-field sun over a temple spire. Drawn for this project. */
/** The Explore Naogaon app logo (public/logo.png). */
export function LogoMark({ className }: { className?: string }) {
  return <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" aria-hidden="true" width={40} height={40} className={className} draggable={false} />
}

export const IconPin = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
)
export const IconCheck = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth={2.4} {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
)
export const IconSearch = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
)
export const IconDownload = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" /></svg>
)
export const IconShare = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><circle cx="6" cy="12" r="2.5" /><circle cx="17.5" cy="6" r="2.5" /><circle cx="17.5" cy="18" r="2.5" /><path d="m8.3 10.8 7-3.6m-7 5.6 7 3.6" /></svg>
)
export const IconLink = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.700l1-1" /></svg>
)
export const IconClose = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
)
export const IconArrow = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M5 12h14m-5-5 5 5-5 5" /></svg>
)
export const IconUpload = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 16V5m0 0-4 4m4-4 4 4M5 19h14" /></svg>
)
export const IconHeart = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M12 20.500S3.500 15 3.500 8.800A4.600 4.600 0 0 1 12 6.700a4.600 4.600 0 0 1 8.500 2.100C20.500 15 12 20.500 12 20.500Z" /></svg>
)
export const IconFacebook = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M13.500 21v-8h2.700l.4-3.200h-3.100V7.900c0-.9.300-1.500 1.600-1.500h1.700V3.500c-.3 0-1.300-.1-2.400-.1-2.400 0-4 1.500-4 4.100v2.300H7.700V13h2.700v8h3.100Z" /></svg>
)
