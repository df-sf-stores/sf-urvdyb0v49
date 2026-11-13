import { Image, Link, Price, useStorefront, type Money, type ProductCard as Card } from '@dripfunnel/storefront-core/theme'
import styles from '../styles/shop.module.css'
import { WishlistHeart } from './interactive/WishlistView'

/** Whether the catalogue gives a compare-at price above the price: the only ground for a sale label. */
export const onSale = (price: Money | null, compareAt: Money | null) => price !== null && compareAt !== null && compareAt.currency === price.currency && Number(compareAt.amount) > Number(price.amount)

export const ProductCard = ({ product }: { product: Card }) => {
  const { store, locale, t } = useStorefront()
  const badge = product.badges[0]?.label ?? (onSale(product.price, product.compareAt) ? t('shop.card.sale') : null)
  return (
    <article className={styles.card}>
      <Link href={product.href} className={styles.cardLink}>
        <div className={product.stock.inStock ? styles.cardPicture : styles.cardPictureOut}>
          {product.photo ? <Image image={product.photo} alt={product.photo.alt ?? product.name} ratio={0.8} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className={styles.cardImage} /> : <span className={styles.noPicture}>{t('shop.card.noPicture')}</span>}
          {badge ? <span className={styles.badge}>{badge}</span> : null}
          {product.stock.inStock ? null : <span className={styles.soldOut}>{t('shop.card.soldOut')}</span>}
          <span className={styles.cardCta} aria-hidden="true">
            {t('shop.card.view')}
          </span>
        </div>
        <h3 className={styles.cardName}>{product.name}</h3>
      </Link>
      {/* Outside the link, so a tap on the heart saves the product instead of opening it. */}
      <WishlistHeart productId={product.id} versionId={null} className={styles.cardHeart} onClassName={styles.cardHeartOn} />
      {product.price ? (
        <p className={styles.cardPrice}>
          {product.from ? <span className={styles.from}>{t('shop.card.from')}</span> : null}
          <Price money={product.price} compareAt={product.compareAt} includesTax={store.pricesIncludeTax} locale={locale} t={t} className={styles.price} />
        </p>
      ) : null}
    </article>
  )
}

export type Columns = 1 | 2 | 3 | 4

const gridClass = (columns: Columns | null, wide: boolean) => (columns === 1 ? styles.grid1 : columns === 2 ? styles.grid2 : columns === 3 ? styles.grid3 : columns === 4 ? styles.grid4 : wide ? styles.gridWide : styles.grid)

export const ProductGrid = ({ products, wide = false, columns = null }: { products: readonly Card[]; wide?: boolean; columns?: Columns | null }) => (
  <ul className={gridClass(columns, wide)}>
    {products.map((p) => (
      <li key={p.id} className={styles.cell}>
        <ProductCard product={p} />
      </li>
    ))}
  </ul>
)

/** The grid's shape while its products load, so nothing moves when they arrive. */
export const GridPlaceholder = ({ label, count }: { label: string; count: number }) => (
  <ul className={styles.grid} aria-busy="true" aria-label={label}>
    {[...Array(count).keys()].map((i) => (
      <li key={i} className={styles.cell}>
        <div className={styles.skeletonPicture} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLineShort} />
      </li>
    ))}
  </ul>
)
