import { SITE } from '../config/site'
import { useLang } from '../i18n/LanguageContext'
import { boundarySource } from '../data/naogaon/sources'
import { FooterLandscape } from './landscape/FooterLandscape'
import { IconFacebook, LogoMark } from './Icons'
import { NAV_ITEMS, scrollToSection } from './SiteHeader'

export function SiteFooter() {
  const { t, num, lang } = useLang()
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <FooterLandscape />
      <div className="container footer-grid">
        <div className="footer-about">
          <a className="brand brand-light" href="#home" onClick={(event) => { event.preventDefault(); scrollToSection('home') }}>
            <LogoMark className="brand-logo" />
            <span className="brand-text">{SITE.name.split(' ').map((word) => <strong key={word}>{word}</strong>)}</span>
          </a>
          <p>{t('footer.tagline')}{lang === 'bn' ? '। ' : '. '}{t('footer.about')}</p>
          {/^https:\/\//.test(SITE.facebookUrl) ? (
            <a className="footer-fb" href={SITE.facebookUrl} target="_blank" rel="noreferrer"><IconFacebook width={18} height={18} /> {t('footer.fb')}</a>
          ) : (
            <span className="footer-fb is-soon"><IconFacebook width={18} height={18} /> {t('footer.fbSoon')}</span>
          )}
        </div>

        <nav className="footer-links" aria-label={t('nav.aria')}>
          <strong>{t('footer.pages')}</strong>
          {NAV_ITEMS.map((item) => <button type="button" key={item.id} onClick={() => scrollToSection(item.id)}>{t(item.key)}</button>)}
        </nav>

        <div className="footer-links">
          <strong>{t('footer.sources')}</strong>
          <a href="https://www.openstreetmap.org/way/235843608" target="_blank" rel="noreferrer">{t('footer.mapData')}</a>
          <a href={boundarySource.url} target="_blank" rel="noreferrer">{t('footer.boundary')}</a>
          <span>{t('footer.data')}</span>
        </div>
      </div>
      <div className="footer-bar">
        <div className="container footer-bar-inner">
          <span>© {num(year)} {SITE.name}. {t('footer.rights')}</span>
          <span className="made-by">{t('footer.madeBy')} <a href={SITE.developer.url} target="_blank" rel="noopener noreferrer"><strong>{t('footer.developer')}</strong></a></span>
        </div>
      </div>
    </footer>
  )
}
