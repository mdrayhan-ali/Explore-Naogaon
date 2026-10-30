function luminance(hex: string): number {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Picks whichever of two text colours has the better contrast on the given #rrggbb background. */
export function readableOn(hex: string, light = '#ffffff', dark = '#12231c'): string {
  const background = luminance(hex)
  const contrast = (text: string) => {
    const [a, b] = [background, luminance(text)].sort((x, y) => y - x)
    return (a + 0.05) / (b + 0.05)
  }
  return contrast(dark) >= contrast(light) ? dark : light
}
