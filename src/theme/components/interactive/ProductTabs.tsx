'use client'

import { useState } from 'react'
import { Link, useProducts, useStorefront } from '@dripfunnel/storefront-core/theme'
import { ArrowIcon } from '../Icons'
import { ProductCard } from '../ProductCard'
import { Carousel } from './Carousel'
import styles from '../../styles/home.module.css'

/** New arrivals and the store's best-selling products (both from the catalogue), as a tabbed carousel. */
export const ProductTabs = () => {
  const { t } = useStorefront()
  const newest = useProducts({ sort: 'newest', first: 12 })
  const favourites = useProducts({ sort: 'best-selling', first: 12 })
  const [tab, setTab] = useState<'newest' | 'favourites'>('newest')
  const loading = newest.status === 'loading' && favourites.status === 'loading'
  const hasNewest = newest.products.length > 0
  const hasFavourites = favourites.products.length > 0
  if (!loading && !hasNewest && !hasFavourites) return null
  // Two tabs only when both lists hold something, and different things.
  const sameLists = newest.products.map((p) => p.id).join() === favourites.products.map((p) => p.id).join()
  const tabs = hasNewest && hasFavourites && !sameLists
  const active = tabs ? tab : hasNewest ? 'newest' : 'favourites'
  const list = active === 'newest' ? newest : favourites
  return (
    <section className={styles.band} aria-labelledby="home-products">
      <div className={styles.bandHead}>
        <div>
          <p className={styles.eyebrow}>{t('home.products.eyebrow')}</p>
          <h2 id="home-products" className={styles.heading}>
            {t('home.products.title')}
          </h2>
        </div>
        {tabs ? (
          <div className={styles.tabs} role="group" aria-label={t('home.products.tabs')}>
            <button type="button" className={active === 'newest' ? styles.tabOn : styles.tab} aria-pressed={active === 'newest'} onClick={() => setTab('newest')}>
              {t('home.products.newest')}
            </button>
            <button type="button" className={active === 'favourites' ? styles.tabOn : styles.tab} aria-pressed={active === 'favourites'} onClick={() => setTab('favourites')}>
              {t('home.products.best')}
            </button>
          </div>
        ) : null}
      </div>
      {loading ? (
        <ul className={styles.track} aria-busy="true" aria-label={t('shop.listing.loading')}>
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className={styles.slot}>
              <div className={styles.skeletonCard} />
            </li>
          ))}
        </ul>
      ) : (
        <Carousel label={active === 'newest' ? t('home.products.newest') : t('home.products.best')}>
          {list.products.map((p) => (
            <li key={p.id} className={styles.slot}>
              <ProductCard product={p} />
            </li>
          ))}
        </Carousel>
      )}
      <div className={styles.bandFoot}>
        <Link href={active === 'newest' ? '/collections/all/?sort=newest' : '/collections/all/'} className={styles.ghost}>
          {t('home.products.more')}
          <ArrowIcon className={styles.buttonIcon} />
        </Link>
      </div>
    </section>
  )
}
