import { describe, expect, it } from 'vitest'
import { readableOn } from './color'

describe('readableOn', () => {
  it('uses dark text on light colours and white text on dark colours', () => {
    expect(readableOn('#f5f8ed')).toBe('#12231c')
    expect(readableOn('#27835c')).toBe('#ffffff')
    expect(readableOn('#102431')).toBe('#ffffff')
    expect(readableOn('#48bd8c')).toBe('#12231c')
  })
})
