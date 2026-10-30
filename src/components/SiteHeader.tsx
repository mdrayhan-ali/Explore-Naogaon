import { useEffect, useState } from 'react'
import { SITE } from '../config/site'
import { useLang } from '../i18n/LanguageContext'
import { IconArrow, LogoMark } from './Icons'

export const NAV_ITEMS = [
  { id: 'home', key: 'nav.home' },
  { id: 'map', key: 'nav.map' },
] as const

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function SiteHeader({ visited, total }: { visited: number; total: number }) {
  const { t, num, lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState<string>('home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      const best = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (best) setActive(best.target.id)
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.2, 0.5] })
    NAV_ITEMS.forEach((item) => {
      const node = document.getElementById(item.id)
      if (node) observer.observe(node)
    })
    return () => observer.disconnect()
  }, [])

  function go(id: string) {
    setOpen(false)
    scrollToSection(id)
  }

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' menu-open' : ''}`}>
      <div className="site-header-inner">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); go('home') }} aria-label={`${SITE.name} — হোম`}>
          <LogoMark className="brand-logo" />
          <span className="brand-text">
            {SITE.name.split(' ').map((word) => <strong key={word}>{word}</strong>)}
          </span>
        </a>

        <nav className="site-nav" aria-label={t('nav.aria')}>
          {NAV_ITEMS.map((item) => (
            <button key={item.id} type="button" className={active === item.id ? 'is-active' : ''} onClick={() => go(item.id)}>
              {t(item.key)}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <div className="lang-toggle" role="group" aria-label={t('lang.label')}>
            <button type="button" className={lang === 'bn' ? 'is-on' : ''} aria-pressed={lang === 'bn'} onClick={() => setLang('bn')}>বাং</button>
            <button type="button" className={lang === 'en' ? 'is-on' : ''} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
          </div>
          <button type="button" className="progress-chip" onClick={() => go('map')} title={t('chip.title')}>
            <span className="progress-chip-dot" aria-hidden="true" />
            <strong>{num(visited)}/{num(total)}</strong>
            <span>{t('chip.seen')}</span>
          </button>
          <button type="button" className="header-cta" onClick={() => go('map')}>
            {t('cta.openMap')} <IconArrow width={16} height={16} />
          </button>
          <button
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-label={open ? t('menu.close') : t('menu.open')}
            onClick={() => setOpen((value) => !value)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      <nav className="mobile-nav" aria-label={t('nav.aria')} hidden={!open}>
        {NAV_ITEMS.map((item) => (
          <button key={item.id} type="button" className={active === item.id ? 'is-active' : ''} onClick={() => go(item.id)}>
            {t(item.key)}
          </button>
        ))}
      </nav>
    </header>
  )
}
