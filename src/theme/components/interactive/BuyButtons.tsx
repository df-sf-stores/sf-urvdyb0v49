'use client'

import { useId, useRef, useState } from 'react'
import { AddToCart, BuyNow, Link, Price, TextField, useInView, useStorefront, type GiftRecipient, type ProductPage } from '@dripfunnel/storefront-core/theme'
import shop from '../../styles/shop.module.css'
import styles from '../../styles/product.module.css'

const emailLike = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Quantity, Add to cart and Buy now for the chosen version; both wait until every option is chosen and the version is
 * in stock. On phones a bar with the price and Add to cart stays at the bottom while these buttons are off screen.
 * A gift card asks for its recipient first; a download or a service says what the shopper gets.
 */
export const BuyButtons = ({ page }: { page: ProductPage }) => {
  const { store, locale, t } = useStorefront()
  const [note, setNote] = useState<'added' | 'failed' | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [gift, setGift] = useState<GiftRecipient>({ recipientName: '', recipientEmail: '', sendOn: '', message: '' })
  const box = useRef<HTMLDivElement>(null)
  const shown = useInView(box)
  const version = page.version
  const kind = page.product?.kind
  const isGift = kind?.kind === 'gift_card'
  const giftReady = gift.recipientName.trim() !== '' && emailLike.test(gift.recipientEmail.trim())
  const buyable = version !== null && version.stock.inStock && (!isGift || giftReady)
  const set = (patch: Partial<GiftRecipient>) => setGift({ ...gift, ...patch })
  const why = useId()
  const waitsForRecipient = isGift && !giftReady
  const firstMissing = page.missing[0]
  const done = (added: boolean) => setNote(added ? 'added' : 'failed')
  return (
    <div ref={box} className={styles.buy}>
      {kind?.kind === 'digital' ? (
        <p className={styles.kindNote}>{kind.downloadLimit !== null && kind.downloadDays !== null ? t('shop.product.download', { times: kind.downloadLimit, days: kind.downloadDays }) : t('shop.product.downloadPlain')}</p>
      ) : null}
      {kind?.kind === 'service' ? <p className={styles.kindNote}>{[kind.duration, kind.location].filter(Boolean).join(' · ') || t('shop.product.service')}</p> : null}
      {kind?.kind === 'gift_card' ? (
        <div className={styles.gift}>
          <TextField label={t('shop.product.gift.name')} autoComplete="off" value={gift.recipientName} onChange={(recipientName) => set({ recipientName })} className={styles.field} />
          <TextField label={t('shop.product.gift.email')} type="email" autoComplete="off" value={gift.recipientEmail} onChange={(recipientEmail) => set({ recipientEmail })} className={styles.field} />
          <TextField label={t('shop.product.gift.message')} note={t('shop.product.gift.optional')} maxLength={200} value={gift.message ?? ''} onChange={(message) => set({ message })} className={styles.field} />
          <TextField
            label={t('shop.product.gift.sendOn')}
            type="date"
            value={gift.sendOn ?? ''}
            onChange={(sendOn) => set({ sendOn })}
            hint={kind.expiryMonths !== null ? t('shop.product.gift.sendHintExpiry', { months: kind.expiryMonths }) : t('shop.product.gift.sendHint')}
            className={styles.field}
          />
        </div>
      ) : null}
      {waitsForRecipient ? (
        <p id={why} className={styles.kindNote}>
          {t('shop.product.gift.needed')}
        </p>
      ) : null}
      <div className={styles.buyRow}>
        {isGift ? null : (
          <div className={styles.stepper} role="group" aria-label={t('shop.product.quantity')}>
            <button type="button" className={styles.stepButton} aria-label={t('shop.product.decrease')} disabled={quantity <= 1} onClick={() => setQuantity(Math.max(1, quantity - 1))}>
              <svg className={styles.stepIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 12h12" />
              </svg>
            </button>
            <span className={styles.stepValue} aria-live="polite">
              {quantity}
            </span>
            <button type="button" className={styles.stepButton} aria-label={t('shop.product.increase')} onClick={() => setQuantity(quantity + 1)}>
              <svg className={styles.stepIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M6 12h12M12 6v12" />
              </svg>
            </button>
          </div>
        )}
        <AddToCart versionId={version?.id ?? null} quantity={quantity} disabled={!buyable} gift={isGift ? gift : null} describedBy={waitsForRecipient ? why : undefined} className={styles.add} onDone={done}>
          {isGift ? t('shop.product.gift.add') : t('shop.product.add')}
        </AddToCart>
      </div>
      {isGift ? null : (
        <BuyNow versionId={version?.id ?? null} quantity={quantity} disabled={!buyable} className={styles.buyNow} onDone={(bought) => setNote(bought ? null : 'failed')}>
          {t('shop.product.buyNow')}
        </BuyNow>
      )}
      {note ? (
        <p className={styles.added} role="status">
          {note === 'added' ? t('shop.product.added') : t('shop.product.addFailed')}{' '}
          {note === 'added' ? (
            <Link href="/cart/" className={styles.viewCart}>
              {t('shop.product.viewCart')}
            </Link>
          ) : null}
        </p>
      ) : null}
      {isGift ? null : (
        <div className={shown ? styles.stickyBar : styles.stickyBarOn} aria-hidden={shown ? true : undefined} role="region" aria-label={t('shop.product.sticky')}>
          <div className={styles.stickyInfo}>
            <span className={styles.stickyName}>{page.product?.name}</span>
            {page.price ? <Price money={page.price} compareAt={null} includesTax={store.pricesIncludeTax} locale={locale} t={t} className={styles.stickyPrice} /> : null}
          </div>
          {firstMissing ? (
            <button type="button" className={shop.primary} onClick={() => box.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
              {t('shop.product.choose', { option: firstMissing.name })}
            </button>
          ) : (
            <AddToCart versionId={version?.id ?? null} quantity={quantity} disabled={!buyable} className={styles.stickyAdd} onDone={done}>
              {t('shop.product.add')}
            </AddToCart>
          )}
        </div>
      )}
    </div>
  )
}
