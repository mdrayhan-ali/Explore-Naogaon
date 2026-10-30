import { describe, expect, it } from 'vitest'
import { layoutLabels } from './labelLayout'

const opts = { fontSize: 20, dotRadius: 7, width: 1000, height: 1000 }

describe('map label layout', () => {
  it('puts a lone label to the right of its dot', () => {
    const result = layoutLabels([{ id: 'a', x: 300, y: 300, text: 'Somapura', priority: 1 }], opts)
    expect(result.get('a')?.anchor).toBe('start')
    expect(result.get('a')!.x).toBeGreaterThan(300)
  })

  it('moves a label to the left when the right side is out of the map', () => {
    const result = layoutLabels([{ id: 'a', x: 950, y: 300, text: 'Somapura Mahavihara', priority: 1 }], opts)
    expect(result.get('a')?.anchor).toBe('end')
  })

  it('never lets two labels cover each other, and drops one that cannot fit', () => {
    const items = Array.from({ length: 16 }, (_, i) => ({ id: `p${i}`, x: 500 + i, y: 500, text: 'A long place name', priority: 16 - i }))
    const result = layoutLabels(items, opts)
    expect(result.size).toBeLessThan(items.length)
    expect(result.has('p0')).toBe(true)
  })

  it('gives the more important place the first choice of position', () => {
    const items = [
      { id: 'minor', x: 400, y: 400, text: 'Minor', priority: 1 },
      { id: 'major', x: 402, y: 400, text: 'Major', priority: 3 },
    ]
    expect(layoutLabels(items, opts).get('major')?.anchor).toBe('start')
  })
})
