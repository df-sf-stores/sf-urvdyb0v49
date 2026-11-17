'use client'

import { useRef } from 'react'
import { Link, useReducedMotion, useScrollProgress, useStorefront } from '@dripfunnel/storefront-core/theme'
import { WhatsAppIcon } from '../Icons'
import styles from '../../styles/layout.module.css'

/** "-" (or empty) is how the merchant leaves a field out in the content. */
const given = (words: string) => words.trim() !== '' && words.trim() !== '-'

/**
 * Bottom-right floating buttons on every page: WhatsApp chat and back to top. WhatsApp opens the store's WhatsApp link
 * from Site settings › Social, else common.floating.whatsappLink (e.g. https://wa.me/91XXXXXXXXXX); with neither it's
 * hidden. Back to top shows once the page has scrolled past common.floating.topAfter of its length.
 */
export const FloatingActions = () => {
  const { store, t } = useStorefront()
  const still = useReducedMotion()
  const progress = useScrollProgress()
  const top = useRef<HTMLSpanElement>(null)
  const social = store.social.find((s) => s.network.toLowerCase() === 'whatsapp')?.url
  const fallback = t('common.floating.whatsappLink')
  const whatsapp = social ?? (given(fallback) ? fallback : null)
  const after = Number(t('common.floating.topAfter'))
  const showTop = progress > (Number.isFinite(after) ? after : 0.08)
  return (
    <>
      {/* The page's top edge, which back to top scrolls to. */}
      <span ref={top} className={styles.pageTop} aria-hidden="true" />
      <div className={styles.floating}>
        <button
          type="button"
          className={showTop ? styles.toTop : styles.toTopHidden}
          aria-label={t('common.floating.top')}
          tabIndex={showTop ? 0 : -1}
          aria-hidden={showTop ? undefined : true}
          onClick={() => top.current?.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' })}
        >
          <svg className={styles.floatingIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {whatsapp ? (
          <Link href={whatsapp} className={styles.whatsapp}>
            <span className={styles.whatsappLabel} aria-hidden="true">
              {t('common.floating.whatsappHover')}
            </span>
            <WhatsAppIcon className={styles.floatingIcon} />
            <span className={styles.hidden}>{t('common.floating.whatsapp')}</span>
          </Link>
        ) : null}
      </div>
    </>
  )
}
