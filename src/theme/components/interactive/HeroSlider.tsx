'use client'

import { useEffect, useRef, useState } from 'react'
import { Link, MerchantImage, ThemeImage, useReducedMotion, useStorefront } from '@dripfunnel/storefront-core/theme'
import { ArrowIcon } from '../Icons'
import styles from '../../styles/home.module.css'

type Slide = { desktop: string; mobile: string; alt: string; eyebrow: string; title: string; text: string; cta: string; link: string }

/** "-" (or "none" for a picture) is how the merchant leaves a field out in the content. */
const given = (words: string) => words.trim() !== '' && words.trim() !== '-' && words.trim() !== 'none'

/**
 * The hero: the merchant's slides from Storefront › Assets (a desktop and a phone picture each), cross-fading on their
 * own, with dots, arrows and swipe. With no slide set up it shows the editorial hero beside its square picture: the merchant's home.hero.image, else the theme's lighting image.
 */
export const HeroSlider = () => {
  const { t } = useStorefront()
  const still = useReducedMotion()
  const all: Slide[] = [
    {
      desktop: t('home.hero.slide1.desktop'),
      mobile: t('home.hero.slide1.mobile'),
      alt: t('home.hero.slide1.alt'),
      eyebrow: t('home.hero.slide1.eyebrow'),
      title: t('home.hero.slide1.title'),
      text: t('home.hero.slide1.text'),
      cta: t('home.hero.slide1.cta'),
      link: t('home.hero.slide1.link'),
    },
    {
      desktop: t('home.hero.slide2.desktop'),
      mobile: t('home.hero.slide2.mobile'),
      alt: t('home.hero.slide2.alt'),
      eyebrow: t('home.hero.slide2.eyebrow'),
      title: t('home.hero.slide2.title'),
      text: t('home.hero.slide2.text'),
      cta: t('home.hero.slide2.cta'),
      link: t('home.hero.slide2.link'),
    },
    {
      desktop: t('home.hero.slide3.desktop'),
      mobile: t('home.hero.slide3.mobile'),
      alt: t('home.hero.slide3.alt'),
      eyebrow: t('home.hero.slide3.eyebrow'),
      title: t('home.hero.slide3.title'),
      text: t('home.hero.slide3.text'),
      cta: t('home.hero.slide3.cta'),
      link: t('home.hero.slide3.link'),
    },
  ]
  const slides = all.filter((s) => given(s.desktop))
  const [shown, setShown] = useState(0)
  const [held, setHeld] = useState(false)
  const start = useRef<number | null>(null)
  const count = slides.length
  useEffect(() => {
    if (count < 2 || held || still) return
    const timer = setInterval(() => setShown((i) => (i + 1) % count), 6000)
    return () => clearInterval(timer)
  }, [count, held, still])

  if (count === 0) {
    const own = given(t('home.hero.image'))
    return (
      <section className={styles.heroPlain} aria-label={t('home.hero.label')}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{t('home.hero.eyebrow')}</p>
          <h1 className={styles.heroTitle}>{t('home.hero.title')}</h1>
          <p className={styles.heroLead}>{t('home.hero.lead')}</p>
          <div className={styles.actions}>
            <Link href={t('home.hero.link')} className={styles.button}>
              {t('home.hero.shop')}
              <ArrowIcon className={styles.buttonIcon} />
            </Link>
            <Link href="/about/" className={styles.ghost}>
              {t('home.hero.story')}
            </Link>
          </div>
        </div>
        <div className={styles.heroPicture}>
          {own ? (
            <MerchantImage asset={t('home.hero.image')} alt={t('home.hero.imageAlt')} ratio={1} sizes="(min-width: 900px) 50vw, 100vw" className={styles.heroImage} />
          ) : (
            <ThemeImage src="modern-gold-lighting-collection.webp" alt={t('home.hero.imageAlt')} ratio={1} sizes="(min-width: 900px) 50vw, 100vw" className={styles.heroImage} />
          )}
        </div>
      </section>
    )
  }

  const go = (i: number) => setShown(((i % count) + count) % count)
  const current = shown % count
  return (
    <section
      className={styles.slider}
      aria-label={t('home.hero.label')}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setHeld(true)
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setHeld(false)
      }}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      onPointerDown={(e) => {
        start.current = e.clientX
      }}
      onPointerUp={(e) => {
        if (start.current === null) return
        const moved = e.clientX - start.current
        start.current = null
        if (Math.abs(moved) > 40) go(current + (moved < 0 ? 1 : -1))
      }}
      onPointerCancel={() => {
        start.current = null
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(current + 1)
        if (e.key === 'ArrowLeft') go(current - 1)
      }}
    >
      <div className={styles.slides} aria-live={held || still ? 'polite' : 'off'}>
        {slides.map((s, i) => {
          const phone = given(s.mobile) ? s.mobile : s.desktop
          const alt = given(s.alt) ? s.alt : given(s.title) ? s.title : ''
          const on = i === current
          return (
            <div key={s.desktop} className={on ? styles.slideOn : styles.slide} role="group" aria-label={alt || t('home.hero.label')} aria-hidden={on ? undefined : true}>
              <div className={styles.slideDesktop}>
                <MerchantImage asset={s.desktop} alt={alt} ratio={16 / 7} sizes="100vw" className={styles.slideImage} />
              </div>
              <div className={styles.slideMobile}>
                <MerchantImage asset={phone} alt={alt} ratio={4 / 5} sizes="100vw" className={styles.slideImage} />
              </div>
              {given(s.title) || given(s.cta) ? (
                <div className={styles.slideCopy}>
                  {given(s.eyebrow) ? <p className={styles.slideEyebrow}>{s.eyebrow}</p> : null}
                  {given(s.title) ? i === 0 ? <h1 className={styles.slideTitle}>{s.title}</h1> : <h2 className={styles.slideTitle}>{s.title}</h2> : null}
                  {given(s.text) ? <p className={styles.slideText}>{s.text}</p> : null}
                  {given(s.cta) && on ? (
                    <Link href={s.link} className={styles.buttonLight}>
                      {s.cta}
                      <ArrowIcon className={styles.buttonIcon} />
                    </Link>
                  ) : null}
                </div>
              ) : on && given(s.link) ? (
                <Link href={s.link} className={styles.slideCover}>
                  <span className={styles.hidden}>{alt || t('home.hero.shop')}</span>
                </Link>
              ) : null}
            </div>
          )
        })}
      </div>
      {count > 1 ? (
        <>
          <button type="button" className={styles.slidePrev} aria-label={t('home.hero.previous')} onClick={() => go(current - 1)}>
            <ArrowIcon className={styles.arrowIcon} back />
          </button>
          <button type="button" className={styles.slideNext} aria-label={t('home.hero.next')} onClick={() => go(current + 1)}>
            <ArrowIcon className={styles.arrowIcon} />
          </button>
          <div className={styles.dots}>
            {slides.map((s, i) => (
              <button key={s.desktop} type="button" className={i === current ? styles.dotOn : styles.dot} aria-label={t('home.hero.goTo', { name: given(s.alt) ? s.alt : given(s.title) ? s.title : t('home.hero.label') })} aria-current={i === current ? 'true' : undefined} onClick={() => go(i)} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
