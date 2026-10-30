import type { Attraction } from '../types/geography'

export type JourneyProgress = {
  visited: number
  total: number
  remaining: number
  percentage: number
}

export function getJourneyProgress(
  attractions: Attraction[],
  visitedIds: Iterable<string>,
  upazilaId?: string,
): JourneyProgress {
  const uniqueAttractions = new Map(
    attractions
      .filter((attraction) =>
        attraction.verificationStatus === 'verified' &&
        (!upazilaId || [attraction.upazilaId, ...(attraction.alsoUpazilaIds ?? [])]
          .some((id) => id.toLocaleLowerCase() === upazilaId.toLocaleLowerCase())),
      )
      .map((attraction) => [attraction.id, attraction]),
  )
  const visitedSet = new Set(visitedIds)
  const total = uniqueAttractions.size
  const visited = [...uniqueAttractions.keys()].filter((id) => visitedSet.has(id)).length

  return {
    visited,
    total,
    remaining: total - visited,
    percentage: total === 0 ? 0 : Math.round((visited / total) * 100),
  }
}
