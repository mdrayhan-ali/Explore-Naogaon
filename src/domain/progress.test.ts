import { describe, expect, it } from 'vitest'
import { getJourneyProgress } from './progress'
import type { Attraction } from '../types/geography'

const record = (id: string, verificationStatus: Attraction['verificationStatus'], upazilaId = 'badalgachhi') => ({
  id,
  nameBn: id,
  nameEn: id,
  upazilaId,
  upazilaNameBn: '',
  unionNameBn: null,
  coordinates: [88.9, 25.1] as [number, number],
  actualGeometry: null,
  descriptionBn: '',
  imageUrl: '',
  imageAttribution: '',
  imageSourceUrl: '',
  dataSources: [],
  verificationStatus,
})

describe('getJourneyProgress', () => {
  it('counts unique verified attraction IDs and ignores unverified records', () => {
    const progress = getJourneyProgress([
      record('a', 'verified'),
      record('a', 'verified'),
      record('b', 'verified'),
      record('sample', 'provisional'),
    ], ['a', 'a', 'sample', 'unknown'])

    expect(progress).toEqual({ visited: 1, total: 2, remaining: 1, percentage: 50 })
  })

  it('filters by upazila and rounds percentage', () => {
    const progress = getJourneyProgress([
      record('a', 'verified', 'badalgachhi'),
      record('b', 'verified', 'badalgachhi'),
      record('c', 'verified', 'atrai'),
    ], ['a'], 'Badalgachhi')

    expect(progress).toEqual({ visited: 1, total: 2, remaining: 1, percentage: 50 })
  })

  it('returns zero progress for empty or unmatched catalogues', () => {
    expect(getJourneyProgress([], ['unknown'])).toEqual({
      visited: 0,
      total: 0,
      remaining: 0,
      percentage: 0,
    })
  })
})
