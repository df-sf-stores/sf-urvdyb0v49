'use client'

import { useEffect, useRef, useState } from 'react'
import { Image, useStorefront, Video, type Photo, type VideoFile } from '@dripfunnel/storefront-core/theme'
import { ArrowIcon, CloseIcon, ZoomIcon } from '../Icons'
import styles from '../../styles/product.module.css'

/**
 * The chosen picture large with the rest as thumbnails and the product's video last; swipe between them on phones,
 * and open any picture full screen, where a press zooms in and follows the pointer.
 */
export const Gallery = ({ photos, video, name }: { photos: readonly Photo[]; video: VideoFile | null; name: string }) => {
  const { t } = useStorefront()
  const [shown, setShown] = useState(0)
  const [full, setFull] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const start = useRef<number | null>(null)
  const lens = useRef<HTMLDivElement>(null)
  const closer = useRef<HTMLButtonElement>(null)
  const first = photos[0]
  const total = photos.length + (video ? 1 : 0)
  useEffect(() => {
    if (full) closer.current?.focus()
    else setZoomed(false)
  }, [full])
  // Core's <Video> needs a poster (storefront ARCHITECTURE §2.1), so a product with no photo shows no video either.
  if (!first) return <div className={styles.noPicture} />
  const playing = video !== null && shown === photos.length
  const photo = photos[Math.min(shown, photos.length - 1)] ?? first
  const go = (i: number) => setShown(((i % total) + total) % total)
  const swipe = {
    onPointerDown: (e: { clientX: number }) => {
      start.current = e.clientX
    },
    onPointerUp: (e: { clientX: number }) => {
      if (start.current === null) return
      const moved = e.clientX - start.current
      start.current = null
      if (Math.abs(moved) > 40 && total > 1) go(shown + (moved < 0 ? 1 : -1))
    },
  }
  return (
    <div className={styles.gallery}>
      <div className={styles.stage} onPointerDown={swipe.onPointerDown} onPointerUp={swipe.onPointerUp}>
        {playing && video ? (
          <Video video={video} poster={first} label={name} ratio={0.85} className={styles.media} />
        ) : (
          <>
            <Image image={photo} alt={photo.alt ?? name} ratio={0.85} sizes="(min-width: 1024px) 55vw, 100vw" className={styles.media} />
            <button type="button" className={styles.zoom} aria-label={t('shop.product.zoom')} onClick={() => setFull(true)}>
              <ZoomIcon className={styles.zoomIcon} />
            </button>
          </>
        )}
        {total > 1 ? (
          <div className={styles.stageDots} aria-hidden="true">
            {[...Array(total).keys()].map((i) => (
              <span key={i} className={i === shown ? styles.stageDotOn : styles.stageDot} />
            ))}
          </div>
        ) : null}
      </div>
      {total > 1 ? (
        <div className={styles.thumbs}>
          {photos.map((p, i) => (
            <button key={p.url} type="button" className={i === shown ? styles.thumbOn : styles.thumb} aria-label={p.alt ?? name} aria-pressed={i === shown} onClick={() => setShown(i)}>
              <Image image={p} alt="" ratio={1} sizes="80px" className={styles.thumbImage} />
            </button>
          ))}
          {video ? (
            <button type="button" className={playing ? styles.thumbOn : styles.thumb} aria-label={t('shop.product.video')} aria-pressed={playing} onClick={() => setShown(photos.length)}>
              <svg className={styles.play} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M9 7l8 5-8 5z" />
              </svg>
            </button>
          ) : null}
        </div>
      ) : null}
      {full ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={name}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setFull(false)
            if (e.key === 'ArrowRight' && photos.length > 1) setShown((shown + 1) % photos.length)
            if (e.key === 'ArrowLeft' && photos.length > 1) setShown((shown - 1 + photos.length) % photos.length)
          }}
        >
          <button ref={closer} type="button" className={styles.lightboxClose} aria-label={t('shop.product.closeZoom')} onClick={() => setFull(false)}>
            <CloseIcon className={styles.zoomIcon} />
          </button>
          <div
            ref={lens}
            className={zoomed ? styles.lensZoomed : styles.lens}
            onClick={() => setZoomed(!zoomed)}
            onPointerMove={(e) => {
              const el = lens.current
              if (!el || !zoomed) return
              const box = el.getBoundingClientRect()
              el.style.setProperty('--zoom-x', `${(((e.clientX - box.left) / box.width) * 100).toFixed(1)}%`)
              el.style.setProperty('--zoom-y', `${(((e.clientY - box.top) / box.height) * 100).toFixed(1)}%`)
            }}
          >
            <Image image={photo} alt={photo.alt ?? name} ratio={0.85} sizes="100vw" className={styles.lensImage} />
          </div>
          {photos.length > 1 ? (
            <>
              <button type="button" className={styles.lightboxPrev} aria-label={t('home.hero.previous')} onClick={() => setShown((Math.min(shown, photos.length - 1) - 1 + photos.length) % photos.length)}>
                <ArrowIcon className={styles.zoomIcon} back />
              </button>
              <button type="button" className={styles.lightboxNext} aria-label={t('home.hero.next')} onClick={() => setShown((Math.min(shown, photos.length - 1) + 1) % photos.length)}>
                <ArrowIcon className={styles.zoomIcon} />
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
