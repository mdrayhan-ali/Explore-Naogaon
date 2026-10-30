import { UNION_COUNT, UPAZILAS, VERIFIED_ATTRACTIONS } from '../data/naogaon/model'
import { useLang } from '../i18n/LanguageContext'
import type { StringKey } from '../i18n/translations'
import { useCountUp, useReveal } from '../lib/useReveal'

function Stat({ value, labelKey, active }: { value: number; labelKey: StringKey; active: boolean }) {
  const { t, num } = useLang()
  const shown = useCountUp(value, active)
  return (
    <div className="stat">
      <strong>{num(shown)}</strong>
      <span>{t(labelKey)}</span>
    </div>
  )
}

/** Facts that come straight from the data in this project, never typed in by hand. */
export function StatsStrip({ visitedCount }: { visitedCount: number }) {
  const [ref, shown] = useReveal<HTMLDivElement>(0.4)
  return (
    <div className="stats-strip" ref={ref}>
      <div className="container stats-grid">
        <Stat value={VERIFIED_ATTRACTIONS.length} labelKey="stat.places" active={shown} />
        <Stat value={UPAZILAS.length} labelKey="stat.upazilas" active={shown} />
        <Stat value={UNION_COUNT} labelKey="stat.unions" active={shown} />
        <Stat value={visitedCount} labelKey="stat.seen" active={shown} />
      </div>
    </div>
  )
}
