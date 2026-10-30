import { describe, expect, it } from 'vitest'
import { parseVisitedIds, readVisitedIds, writeVisitedIds } from './journeyStorage'

class MemoryStorage {
  private values = new Map<string, string>()
  getItem(key: string) { return this.values.get(key) ?? null }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

describe('anonymous journey storage', () => {
  const validIds = new Set(['somapura-mahavihara', 'another-place'])

  it('filters unknown IDs and de-duplicates saved records when reading', () => {
    expect(parseVisitedIds(JSON.stringify([
      'somapura-mahavihara',
      'somapura-mahavihara',
      'unknown',
      7,
    ]), validIds)).toEqual(['somapura-mahavihara'])
  })

  it('round-trips progress through browser-storage-compatible APIs', () => {
    const storage = new MemoryStorage()
    writeVisitedIds(storage, 'journey', ['another-place', 'another-place'])

    expect(readVisitedIds(storage, 'journey', validIds)).toEqual(['another-place'])
  })

  it('handles invalid data and migrates the old single-place value', () => {
    expect(parseVisitedIds('{bad json', validIds)).toEqual([])
    expect(parseVisitedIds('true', validIds)).toEqual(['somapura-mahavihara'])
  })

  it('propagates storage access failures for the UI to report', () => {
    const blockedStorage = {
      getItem() { throw new Error('Storage is blocked') },
    }

    expect(() => readVisitedIds(blockedStorage, 'journey', validIds)).toThrow('Storage is blocked')
  })
})
