import { useEffect, useState } from 'react'

type DetailSection = { title: string; level: 2 | 3; paragraphs: string[] }
type PlaceDetail = { title: string; sections: DetailSection[]; references: string[] }
type DetailMap = Record<string, PlaceDetail>

// The write-ups are large, so they load on first use and stay cached afterwards.
let detailPromise: Promise<DetailMap> | null = null

function loadDetails(): Promise<DetailMap> {
  detailPromise ??= import('../data/naogaon/place-details.json').then(
    (module) => module.default as unknown as DetailMap,
  )
  return detailPromise
}

type LoadState = { placeId: string; status: 'loading' | 'ready' | 'missing' | 'error'; detail?: PlaceDetail }

export function PlaceDetails({ placeId }: { placeId: string }) {
  const [state, setState] = useState<LoadState>({ placeId, status: 'loading' })

  useEffect(() => {
    let cancelled = false
    loadDetails()
      .then((all) => {
        if (cancelled) return
        const detail = all[placeId]
        setState(detail ? { placeId, status: 'ready', detail } : { placeId, status: 'missing' })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        console.error('Could not load place details.', error)
        setState({ placeId, status: 'error' })
      })
    return () => {
      cancelled = true
    }
  }, [placeId])

  const current = state.placeId === placeId ? state : { placeId, status: 'loading' as const }
  if (current.status === 'missing') return null
  if (current.status === 'loading') return <p className="place-details-note">বিস্তারিত তথ্য আসছে…</p>
  if (current.status === 'error' || !current.detail) {
    return <p className="place-details-note" role="alert">বিস্তারিত তথ্য লোড করা যায়নি।</p>
  }

  const { sections, references } = current.detail
  return (
    <div className="place-details">
      {sections.map((section, index) => (
        <details key={`${section.title}-${index}`} className="place-details-section" open={index === 0}>
          <summary>{section.title}</summary>
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex}>{paragraph}</p>
          ))}
        </details>
      ))}
      {references.length > 0 && (
        <details className="place-details-section place-details-references">
          <summary>তথ্যসূত্র</summary>
          <ul>
            {references.map((reference, index) => (
              <li key={index}>{reference}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
