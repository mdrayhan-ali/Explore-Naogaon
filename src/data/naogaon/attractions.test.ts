import { describe, expect, it } from 'vitest'
import { getJourneyProgress } from '../../domain/progress'
import { pointInMultiPolygon, toMultiPolygon } from '../../gis/geometry'
import unionData from './unions.geojson?raw'
import { attractions } from './attractions'
import type { UnionCollection } from '../../types/geography'

const unions = JSON.parse(unionData) as UnionCollection

describe('Naogaon attraction records', () => {
  it('keeps the 29 verified spots unique, located, and assigned to their upazilas', () => {
    const ids = attractions.map((attraction) => attraction.id)
    const verified = attractions.filter((attraction) => attraction.verificationStatus === 'verified')

    expect(new Set(ids).size).toBe(ids.length)
    expect(attractions).toHaveLength(29)
    expect(verified).toHaveLength(29)
    expect(getJourneyProgress(attractions, []).total).toBe(29)
    expect(getJourneyProgress(attractions, []).percentage).toBe(0)

    for (const attraction of verified) {
      expect(attraction.coordinates).not.toBeNull()
      expect(attraction.upazilaId).not.toBe('')
      expect(attraction.dataSources.length).toBeGreaterThan(0)
      attraction.dataSources.forEach((source) => expect(() => new URL(source.url)).not.toThrow())
      if (!attraction.coordinates) continue
      expect(attraction.coordinates[0]).toBeGreaterThanOrEqual(88)
      expect(attraction.coordinates[0]).toBeLessThanOrEqual(90)
      expect(attraction.coordinates[1]).toBeGreaterThanOrEqual(24)
      expect(attraction.coordinates[1]).toBeLessThanOrEqual(26)

      const home = unions.features.find((feature) =>
        pointInMultiPolygon(attraction.coordinates!, toMultiPolygon(feature.geometry)),
      )
      expect(home, `${attraction.id} must fall inside a union`).toBeDefined()
      expect(home!.properties.upazila.toLocaleLowerCase(), `${attraction.id} upazila`).toBe(
        attraction.upazilaId.toLocaleLowerCase(),
      )
      if (attraction.unionNameBn) {
        expect(attraction.unionNameBn.startsWith(home!.properties.nameBn), `${attraction.id} union name`).toBe(true)
      }
    }
  })

  it('records every extra pin and upazila of a place that spans two upazilas', () => {
    const ghuksir = attractions.find((attraction) => attraction.id === 'dhamoirhat-ghuksir-beel')
    expect(ghuksir?.alsoUpazilaIds).toEqual(['patnitala'])
    expect(ghuksir?.territoryAnchors).toHaveLength(1)

    const patnitala = getJourneyProgress(attractions, ['dhamoirhat-ghuksir-beel'], 'patnitala')
    const dhamoirhat = getJourneyProgress(attractions, ['dhamoirhat-ghuksir-beel'], 'dhamoirhat')
    expect(patnitala.visited).toBe(1)
    expect(dhamoirhat.visited).toBe(1)
    expect(getJourneyProgress(attractions, ['dhamoirhat-ghuksir-beel']).visited).toBe(1)
  })

  it('treats Dighali and Taltoli as one beel with both names searchable', () => {
    const beel = attractions.find((attraction) => attraction.id === 'sadar-taltoli-beel')
    expect(beel?.aliasesBn).toContain('দিঘলী বিল')
    expect(attractions.some((attraction) => attraction.id === 'sadar-dighali-beel')).toBe(false)
  })

  it('keeps access restrictions and user-reported reopening notes explicit', () => {
    const privateHome = attractions.find((attraction) => attraction.id === 'mahadebpur-108-room-mud-house')
    const reopenedWetland = attractions.find((attraction) => attraction.id === 'raninagar-raktadaha-beel')

    expect(privateHome?.accessStatus).toBe('private')
    expect(privateHome?.contributorNotes).toContain('ব্যক্তিগত')
    expect(reopenedWetland?.selfVerified).toBe(true)
    expect(reopenedWetland?.verificationStatus).toBe('verified')
  })
})
