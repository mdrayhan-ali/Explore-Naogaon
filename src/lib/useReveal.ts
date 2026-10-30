import { useEffect, useRef, useState } from 'react'

/** True once the element has scrolled into view (and stays true), for gentle entrance animations. */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShown(true)
        observer.disconnect()
      }
    }, { threshold })
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, shown] as const
}

/** Counts up to `target` once `active` becomes true; respects reduced-motion. */
export function useCountUp(target: number, active: boolean, ms = 1100) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, target, ms])
  return value
}
