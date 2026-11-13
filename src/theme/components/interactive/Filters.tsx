'use client'

import { useState } from 'react'
import { Checkbox, Link, Select, TextField, useLoadOnScroll, useStorefront, type Listing, type SortKey } from '@dripfunnel/storefront-core/theme'
import { CloseIcon } from '../Icons'
import { GridPlaceholder, ProductGrid, type Columns } from '../ProductCard'
import { Notice } from '../Notice'
import { Retry } from './Retry'
import styles from '../../styles/shop.module.css'

/** Whole rupees (or the store's major unit) as the minor units the listing filters by; null when empty or not a number. */
const minor = (words: string) => {
  const n = Number(words.replace(/[^\d.]/g, ''))
  return words.trim() === '' || !Number.isFinite(n) ? null : String(Math.round(n * 100))
}
const major = (units: string | null) => (units === null ? '' : String(Math.round(Number(units) / 100)))

const PriceFilter = ({ listing }: { listing: Listing }) => {
  const { t } = useStorefront()
  const [low, setLow] = useState(major(listing.priceRange.min))
  const [high, setHigh] = useState(major(listing.priceRange.max))
  if (!listing.priceBounds) return null
  return (
    <div role="group" aria-label={t('shop.listing.price')} className={styles.facet}>
      <p className={styles.facetName}>{t('shop.listing.price')}</p>
      <div className={styles.priceRow}>
        <TextField label={t('shop.listing.priceFrom')} inputMode="numeric" value={low} onChange={setLow} className={styles.priceField} />
        <TextField label={t('shop.listing.priceTo')} inputMode="numeric" value={high} onChange={setHigh} className={styles.priceField} />
      </div>
      <button type="button" className={styles.chip} onClick={() => listing.setPriceRange({ min: minor(low), max: minor(high) })}>
        {t('shop.listing.priceApply')}
      </button>
    </div>
  )
}

/** The filter values: a sidebar on wide screens, a bottom sheet the Filters button opens on phones and tablets. */
export const FilterPanel = ({ listing }: { listing: Listing }) => {
  const { t } = useStorefront()
  const [open, setOpen] = useState(false)
  if (listing.facets.length === 0 && !listing.priceBounds) return null
  return (
    <aside className={styles.filters}>
      <button type="button" className={styles.filterToggle} aria-expanded={open} aria-controls="listing-filters" onClick={() => setOpen(true)}>
        <svg className={styles.filterIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
          <circle cx="16" cy="7" r="2" />
          <circle cx="10" cy="17" r="2" />
        </svg>
        {t('shop.listing.filters')}
        {listing.selected.length ? <span className={styles.count}>{listing.selected.length}</span> : null}
      </button>
      {open ? <div className={styles.sheetScrim} aria-hidden="true" onClick={() => setOpen(false)} /> : null}
      <div
        id="listing-filters"
        className={open ? styles.filterBodyOpen : styles.filterBody}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
        }}
      >
        <div className={styles.sheetHead}>
          <p className={styles.sheetTitle}>{t('shop.listing.filters')}</p>
          <button type="button" className={styles.sheetClose} aria-label={t('shop.listing.filtersShown')} onClick={() => setOpen(false)}>
            <CloseIcon className={styles.filterIcon} />
          </button>
        </div>
        <div className={styles.sheetBody}>
          <PriceFilter listing={listing} />
          {listing.facets.map((facet) => (
            <div key={facet.id} role="group" aria-label={facet.name} className={styles.facet}>
              <p className={styles.facetName}>{facet.name}</p>
              {facet.values.map((value) => (
                <Checkbox key={value.id} checked={value.selected} onChange={() => listing.toggle(value.id)} className={styles.check}>
                  {value.name} <span className={styles.muted}>({value.count})</span>
                </Checkbox>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.sheetFoot}>
          {listing.selected.length ? (
            <button type="button" className={styles.secondary} onClick={listing.clear}>
              {t('shop.listing.clear')}
            </button>
          ) : null}
          <button type="button" className={styles.primary} onClick={() => setOpen(false)}>
            {t('shop.listing.done')}
          </button>
        </div>
      </div>
    </aside>
  )
}

const ColumnIcon = ({ count }: { count: Columns }) => (
  <svg className={styles.columnIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {count === 1 ? <rect x="5" y="4" width="14" height="16" rx="1.5" /> : null}
    {count === 2 ? (
      <>
        <rect x="3" y="4" width="8" height="16" rx="1.5" />
        <rect x="13" y="4" width="8" height="16" rx="1.5" />
      </>
    ) : null}
    {count === 3 ? (
      <>
        <rect x="2" y="4" width="5.5" height="16" rx="1" />
        <rect x="9.25" y="4" width="5.5" height="16" rx="1" />
        <rect x="16.5" y="4" width="5.5" height="16" rx="1" />
      </>
    ) : null}
    {count === 4 ? (
      <>
        <rect x="1.5" y="4" width="4" height="16" rx="1" />
        <rect x="7.17" y="4" width="4" height="16" rx="1" />
        <rect x="12.83" y="4" width="4" height="16" rx="1" />
        <rect x="18.5" y="4" width="4" height="16" rx="1" />
      </>
    ) : null}
  </svg>
)

/**
 * The listing's results: count, sort, column choice and chosen filters, then the grid with its states. More products
 * load as the shopper nears the end, with "Load more" and page links when that can't run.
 */
export const ListingBody = ({ listing }: { listing: Listing }) => {
  const { t } = useStorefront()
  const [columns, setColumns] = useState<Columns | null>(null)
  const sentinel = useLoadOnScroll(listing)
  const labels: Record<SortKey, string> = {
    featured: t('shop.listing.sorts.featured'),
    newest: t('shop.listing.sorts.newest'),
    'price-low': t('shop.listing.sorts.priceLow'),
    'price-high': t('shop.listing.sorts.priceHigh'),
    name: t('shop.listing.sorts.name'),
  }
  const names: Record<Columns, string> = { 1: t('shop.listing.grid1'), 2: t('shop.listing.grid2'), 3: t('shop.listing.grid3'), 4: t('shop.listing.grid4') }
  const choice = (count: Columns) => (
    <button key={count} type="button" className={columns === count ? styles.columnButtonOn : styles.columnButton} aria-pressed={columns === count} aria-label={names[count]} onClick={() => setColumns(count)}>
      <ColumnIcon count={count} />
    </button>
  )
  return (
    <div className={styles.results}>
      {listing.status === 'ready' ? (
        <div className={styles.toolbar}>
          <p className={styles.muted} role="status">
            {t('shop.listing.showing', { count: listing.items.length })}
          </p>
          <div className={styles.toolbarEnd}>
            <div className={styles.columns} role="group" aria-label={t('shop.listing.grid')}>
              <span className={styles.columnsPhone}>
                {choice(1)}
                {choice(2)}
              </span>
              <span className={styles.columnsDesktop}>
                {choice(2)}
                {choice(3)}
                {choice(4)}
              </span>
            </div>
            <Select label={t('shop.listing.sort')} value={listing.sort} options={listing.sorts.map((s) => ({ value: s, label: labels[s] }))} onChange={listing.setSort} className={styles.sort} />
          </div>
          <div className={styles.chips}>
            {listing.selected.map((s) => (
              <button key={s.id} type="button" className={styles.chip} aria-label={t('shop.listing.remove', { name: s.name })} onClick={() => listing.toggle(s.id)}>
                {s.name}
                <svg className={styles.chipIcon} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            ))}
            {listing.selected.length > 1 ? (
              <button type="button" className={styles.clear} onClick={listing.clear}>
                {t('shop.listing.clear')}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      {listing.status === 'loading' ? <GridPlaceholder label={t('shop.listing.loading')} count={6} /> : null}
      {listing.status === 'error' ? (
        <Notice title={t('shop.listing.failed')} lead={t('shop.listing.failedLead')}>
          <Retry label={t('shop.listing.retry')} onRetry={listing.retry} />
        </Notice>
      ) : null}
      {listing.status === 'ready' && listing.items.length === 0 ? (
        listing.selected.length ? (
          <Notice title={t('shop.listing.empty')} lead={t('shop.listing.emptyLead')}>
            <Retry label={t('shop.listing.clear')} onRetry={listing.clear} />
          </Notice>
        ) : (
          <Notice title={t('shop.collection.empty')} lead={t('shop.collection.emptyLead')}>
            <Link href="/" className={styles.secondary}>
              {t('shop.collection.home')}
            </Link>
          </Notice>
        )
      ) : null}
      {listing.status === 'ready' ? <ProductGrid products={listing.items} columns={columns} /> : null}
      <div ref={sentinel} />
      {listing.hasMore ? (
        <div className={styles.more}>
          {listing.moreFailed ? (
            <p className={styles.muted} role="alert">
              {t('shop.listing.moreFailed')}
            </p>
          ) : null}
          <button type="button" className={styles.secondary} disabled={listing.loadingMore} onClick={listing.fetchMore}>
            {t('shop.listing.more')}
          </button>
        </div>
      ) : null}
      {listing.previousHref || (listing.nextHref && listing.moreFailed) ? (
        <nav className={styles.pager} aria-label={t('shop.listing.page')}>
          {listing.previousHref ? (
            <Link href={listing.previousHref} className={styles.chipLink}>
              {t('shop.listing.pagePrevious')}
            </Link>
          ) : null}
          {listing.nextHref && listing.moreFailed ? (
            <Link href={listing.nextHref} className={styles.chipLink}>
              {t('shop.listing.page')}
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  )
}
