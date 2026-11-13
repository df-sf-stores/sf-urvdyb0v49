'use client'

import { useState } from 'react'
import { Link, useStorefront, useWishlist } from '@dripfunnel/storefront-core/theme'
import { GridPlaceholder, ProductCard } from '../ProductCard'
import { Notice } from '../Notice'
import { Retry } from './Retry'
import shop from '../../styles/shop.module.css'

/** The shopper's saved products, each with Add to cart (once its option is known) and Remove; signed out, the way to sign in. */
export const WishlistView = () => {
  const { t } = useStorefront()
  const list = useWishlist({ cards: true })
  const [note, setNote] = useState<'added' | 'failed' | null>(null)
  return (
    <section className={shop.page}>
      <header className={shop.intro}>
        <h1 className={shop.title}>{t('pages.wishlist.title')}</h1>
        {list.status === 'ready' && list.items.length ? <p className={shop.lead}>{t('pages.wishlist.lead')}</p> : null}
      </header>
      {list.status === 'loading' ? <GridPlaceholder label={t('pages.wishlist.loading')} count={4} /> : null}
      {list.status === 'signedOut' ? (
        <Notice title={t('pages.wishlist.signedOut')} lead={t('pages.wishlist.signedOutLead')}>
          <Link href="/sign-in/?next=/account/wishlist/" className={shop.primary}>
            {t('pages.wishlist.signIn')}
          </Link>
        </Notice>
      ) : null}
      {list.status === 'error' ? (
        <Notice title={t('pages.wishlist.failed')} lead={t('shop.listing.failedLead')}>
          <Retry label={t('shop.listing.retry')} onRetry={list.retry} />
        </Notice>
      ) : null}
      {list.status === 'ready' && list.items.length === 0 ? (
        <Notice title={t('pages.wishlist.empty')} lead={t('pages.wishlist.emptyLead')}>
          <Link href="/collections/all/" className={shop.primary}>
            {t('pages.wishlist.browse')}
          </Link>
        </Notice>
      ) : null}
      {note || list.error ? (
        <p className={shop.muted} role="status">
          {list.error === 'LIMIT' ? t('pages.wishlist.full') : note === 'added' ? t('pages.wishlist.added') : t('pages.wishlist.failed')}{' '}
          {note === 'added' ? (
            <Link href="/cart/" className={shop.textLink}>
              {t('shop.product.viewCart')}
            </Link>
          ) : null}
        </p>
      ) : null}
      {list.status === 'ready' && list.items.length ? (
        <ul className={shop.gridWide}>
          {list.items.map((item) => (
            <li key={item.id} className={shop.cell}>
              <ProductCard product={item} />
              <div className={shop.wishActions}>
                {item.versionId && item.stock.inStock ? (
                  <button type="button" className={shop.primary} disabled={list.busy} onClick={() => void list.addToCart(item).then((ok) => setNote(ok ? 'added' : 'failed'))}>
                    {t('pages.wishlist.add')}
                  </button>
                ) : (
                  <Link href={item.href} className={shop.secondary}>
                    {t('pages.wishlist.choose')}
                  </Link>
                )}
                <button type="button" className={shop.clear} aria-label={t('pages.wishlist.removeItem', { name: item.name })} disabled={list.busy} onClick={() => void list.remove(item.id)}>
                  {t('pages.wishlist.remove')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

/** The heart on a product page: saves or unsaves it; signed out, core sends the shopper to sign in and saves it on return. */
export const WishlistHeart = ({ productId, versionId, className, onClassName }: { productId: string; versionId: string | null; className?: string | undefined; onClassName?: string | undefined }) => {
  const { t } = useStorefront()
  const list = useWishlist()
  const saved = list.has(productId)
  return (
    <button type="button" className={saved ? onClassName : className} aria-pressed={saved} disabled={list.busy} onClick={() => void list.toggle(productId, versionId)}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4.5 7.2 4.5c2 0 3.5 1.1 4.8 2.9 1.3-1.8 2.8-2.9 4.8-2.9 3.3 0 5.6 3.1 4.4 6.6-1.7 4.8-9.2 9.4-9.2 9.4z" />
      </svg>
      <span>{saved ? t('shop.product.savedItem') : t('shop.product.saveItem')}</span>
    </button>
  )
}
