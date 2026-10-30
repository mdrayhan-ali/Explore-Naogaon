import { describe, expect, it } from 'vitest'
import { THEMES } from './themes'

function luminance(color: string) {
  const channels = [1, 3, 5].map((start) => Number.parseInt(color.slice(start, start + 2), 16) / 255)
  const linear = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  )
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
}

function contrastRatio(first: string, second: string) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

describe('map and poster themes', () => {
  it('includes all five distinct themes with readable text and selected outlines', () => {
    expect(new Set(THEMES.map((theme) => theme.id)).size).toBe(5)
    for (const theme of THEMES) {
      expect(contrastRatio(theme.background, theme.ink)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(theme.background, theme.muted)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(theme.background, theme.accent)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(theme.mapBackground, theme.selected)).toBeGreaterThanOrEqual(3)
    }
  })
})
