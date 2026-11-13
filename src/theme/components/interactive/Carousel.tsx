'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useMediaQuery, useStorefront } from '@dripfunnel/storefront-core/theme'
import { ArrowIcon } from '../Icons'
import styles from '../../styles/home.module.css'

/**
 * A row that scrolls sideways: swipe or trackpad on its own (scroll snap), arrow buttons from tablets up.
 * `size` sets how many cards a desktop row shows.
 */
export const Carousel = ({ label, size = 'medium', children }: { label: string; size?: 'small' | 'medium' | 'large'; children: ReactNode }) => {
  const { t } = useStorefront()
  const track = useRef<HTMLUListElement>(null)
  // The arrows show only when the row holds more than fits.
  const [scrolls, setScrolls] = useState(false)
  const wide = useMediaQuery('(min-width: 1024px)')
  const tablet = useMediaQuery('(min-width: 640px)')
  useEffect(() => {
    const el = track.current
    if (el) setScrolls(el.scrollWidth > el.clientWidth + 4)
  }, [children, wide, tablet])
  const move = (direction: 1 | -1) => {
    const el = track.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' })
  }
  return (
    <div className={styles.carousel}>
      <ul ref={track} className={size === 'small' ? styles.trackSmall : size === 'large' ? styles.trackLarge : styles.track} aria-label={label}>
        {children}
      </ul>
      <div className={styles.carouselNav} hidden={!scrolls}>
        <button type="button" className={styles.carouselButton} aria-label={t('home.carousel.previous')} onClick={() => move(-1)}>
          <ArrowIcon className={styles.arrowIcon} back />
        </button>
        <button type="button" className={styles.carouselButton} aria-label={t('home.carousel.next')} onClick={() => move(1)}>
          <ArrowIcon className={styles.arrowIcon} />
        </button>
      </div>
    </div>
  )
}
