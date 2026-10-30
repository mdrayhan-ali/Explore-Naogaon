import { describe, expect, it } from 'vitest'
import { POSTER_LAYOUTS } from './posterTypes'

describe('poster layout presets', () => {
  it('provides the documented social, story, and A4 pixel sizes', () => {
    expect(POSTER_LAYOUTS.portrait).toMatchObject({ width: 1200, height: 1500 })
    expect(POSTER_LAYOUTS.story).toMatchObject({ width: 1080, height: 1920 })
    expect(POSTER_LAYOUTS.a4).toMatchObject({ width: 2480, height: 3508 })
  })
})
