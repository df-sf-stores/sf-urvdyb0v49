import type { ReactNode } from 'react'
import { Image, Link, MerchantImage, ThemeImage, useCollections, useStorefront, type CollectionCard } from '@dripfunnel/storefront-core/theme'
import { ArrowIcon, CashIcon, LockIcon, ReturnIcon, TruckIcon } from './Icons'
import styles from '../styles/home.module.css'

/** "-" (or "none" for a picture) is how the merchant leaves a field out in the content. */
export const given = (words: string) => words.trim() !== '' && words.trim() !== '-' && words.trim() !== 'none'

const slugOf = (href: string) => href.replace(/\/+$/, '').split('/').pop() ?? ''

/**
 * Shop by categories: the collections home.categories.slugs lists, in that order (every collection when it says "none"), as
 * picture cards in a grid (two across on phones, four from tablets up); one the store doesn't have is left out. The collection whose
 * address ends in home.categories.pictured shows the theme's lighting image instead of its own.
 */
export const Categories = () => {
  const { t } = useStorefront()
  const { collections: all, status } = useCollections({ first: 50 })
  const pictured = t('home.categories.pictured').trim()
  const wanted = t('home.categories.slugs')
    .split(',')
    .map((s) => s.trim())
    .filter(given)
  const collections = wanted.length ? wanted.map((slug) => all.find((c) => slugOf(c.href) === slug)).filter((c): c is CollectionCard => c !== undefined) : all
  if (status !== 'loading' && collections.length === 0) return null
  return (
    <section className={styles.band} aria-labelledby="home-categories">
      <div className={styles.bandHead}>
        <div>
          <p className={styles.eyebrow}>{t('home.categories.eyebrow')}</p>
          <h2 id="home-categories" className={styles.heading}>
            {t('home.categories.title')}
          </h2>
        </div>
        <Link href="/collections/all/" className={styles.textLink}>
          {t('home.categories.all')}
          <ArrowIcon className={styles.buttonIcon} />
        </Link>
      </div>
      {status === 'loading' ? (
        <ul className={styles.categoryGrid} aria-busy="true" aria-label={t('shop.listing.loading')}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <li key={i}>
              <div className={styles.skeletonTile} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className={styles.categoryGrid} aria-label={t('home.categories.title')}>
          {collections.map((c) => (
            <li key={c.id}>
              <Link href={c.href} className={styles.category}>
                <span className={styles.categoryPicture}>
                  {slugOf(c.href) === pictured ? (
                    <ThemeImage src="modern-gold-lighting-collection.webp" alt={t('home.categories.picturedAlt')} ratio={1} sizes="(min-width: 768px) 24vw, 48vw" className={styles.cover} />
                  ) : c.image ? (
                    <Image image={c.image} alt={c.image.alt ?? c.name} ratio={1} sizes="(min-width: 768px) 24vw, 48vw" className={styles.cover} />
                  ) : null}
                </span>
                <span className={styles.categoryName}>{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Shop by collections: the collections the merchant lists in the content (by their address), as large editorial tiles. */
export const Collections = () => {
  const { t } = useStorefront()
  const { collections } = useCollections({ first: 50 })
  const wanted = t('home.collections.slugs')
    .split(',')
    .map((s) => s.trim())
    .filter(given)
  const chosen = wanted.map((slug) => collections.find((c) => slugOf(c.href) === slug)).filter((c): c is CollectionCard => c !== undefined)
  if (chosen.length === 0) return null
  return (
    <section className={styles.band} aria-labelledby="home-collections">
      <div className={styles.bandHead}>
        <div>
          <p className={styles.eyebrow}>{t('home.collections.eyebrow')}</p>
          <h2 id="home-collections" className={styles.heading}>
            {t('home.collections.title')}
          </h2>
        </div>
      </div>
      <ul className={chosen.length === 1 ? styles.tilesOne : chosen.length === 2 ? styles.tilesTwo : styles.tiles}>
        {chosen.map((c) => (
          <li key={c.id}>
            <Link href={c.href} className={styles.tile}>
              {c.image ? <Image image={c.image} alt={c.image.alt ?? c.name} ratio={0.9} sizes="(min-width: 1024px) 33vw, 100vw" className={styles.tileImage} /> : null}
              <span className={styles.tileCopy}>
                <span className={styles.tileName}>{c.name}</span>
                <span className={styles.tileMore}>
                  {t('home.hero.shop')}
                  <ArrowIcon className={styles.buttonIcon} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** `picture`: the theme's own image for a row, shown until the merchant sets `image` from Storefront › Assets. */
type Row = { image: string; alt: string; eyebrow: string; title: string; body: string; cta: string; link: string; picture?: ReactNode }

const StoryRow = ({ row, flip }: { row: Row; flip: boolean }) => {
  const { picture } = row
  const own = given(row.image)
  const pictured = own || picture !== undefined
  return (
    <article className={pictured ? (flip ? styles.rowFlip : styles.row) : styles.rowPlain}>
      {pictured ? (
        <div className={styles.rowPicture}>
          {own ? <MerchantImage asset={row.image} alt={given(row.alt) ? row.alt : ''} ratio={1.15} sizes="(min-width: 900px) 50vw, 100vw" className={styles.cover} /> : picture}
        </div>
      ) : null}
      <div className={styles.rowCopy}>
        {given(row.eyebrow) ? <p className={styles.eyebrow}>{row.eyebrow}</p> : null}
        <h2 className={styles.heading}>{row.title}</h2>
        {given(row.body)
          ? row.body.split(/\n{2,}/).map((para) => (
              <p key={para} className={styles.body}>
                {para}
              </p>
            ))
          : null}
        {given(row.cta) ? (
          <Link href={row.link} className={styles.ghost}>
            {row.cta}
            <ArrowIcon className={styles.buttonIcon} />
          </Link>
        ) : null}
      </div>
    </article>
  )
}

const rowSizes = '(min-width: 900px) 50vw, 100vw'

/** The story rows home.feature.rows names (e.g. "row3, row2"), in that order. */
const featured = (words: string) =>
  words
    .split(',')
    .map((s) => s.trim())
    .filter(given)

/**
 * The brand story: up to nine rows of picture and words, alternating sides; a row whose title is "-" is left out.
 * `band` 1, 2 or 3 shows only the rows home.feature.rows, home.feature2.rows or home.feature3.rows names, in that order,
 * wherever home.layout places feature, feature2 or feature3. Without it, the story shows every other row.
 */
export const Story = ({ band }: { band?: 1 | 2 | 3 }) => {
  const { t } = useStorefront()
  const bands = [featured(t('home.feature.rows')), featured(t('home.feature2.rows')), featured(t('home.feature3.rows'))]
  const feature = band !== undefined
  const own = feature ? bands[band - 1] ?? [] : []
  const picked = bands.flat()
  const all: (Row & { key: string })[] = [
    { key: 'row1', image: t('home.story.row1.image'), alt: t('home.story.row1.alt'), eyebrow: t('home.story.row1.eyebrow'), title: t('home.story.row1.title'), body: t('home.story.row1.body'), cta: t('home.story.row1.cta'), link: t('home.story.row1.link') },
    { key: 'row2', image: t('home.story.row2.image'), alt: t('home.story.row2.alt'), eyebrow: t('home.story.row2.eyebrow'), title: t('home.story.row2.title'), body: t('home.story.row2.body'), cta: t('home.story.row2.cta'), link: t('home.story.row2.link'),
      picture: <ThemeImage src="modern-gold-lighting-collection.webp" alt={t('home.story.row2.alt')} ratio={1.15} sizes={rowSizes} className={styles.cover} /> },
    { key: 'row3', image: t('home.story.row3.image'), alt: t('home.story.row3.alt'), eyebrow: t('home.story.row3.eyebrow'), title: t('home.story.row3.title'), body: t('home.story.row3.body'), cta: t('home.story.row3.cta'), link: t('home.story.row3.link'),
      picture: <ThemeImage src="menu-wall-decor.webp" alt={t('home.story.row3.alt')} ratio={1.15} sizes={rowSizes} className={styles.cover} /> },
    { key: 'row4', image: t('home.story.row4.image'), alt: t('home.story.row4.alt'), eyebrow: t('home.story.row4.eyebrow'), title: t('home.story.row4.title'), body: t('home.story.row4.body'), cta: t('home.story.row4.cta'), link: t('home.story.row4.link'),
      picture: <ThemeImage src="category-decorative-showpieces.webp" alt={t('home.story.row4.alt')} ratio={1.15} sizes={rowSizes} className={styles.cover} /> },
    { key: 'row5', image: t('home.story.row5.image'), alt: t('home.story.row5.alt'), eyebrow: t('home.story.row5.eyebrow'), title: t('home.story.row5.title'), body: t('home.story.row5.body'), cta: t('home.story.row5.cta'), link: t('home.story.row5.link'),
      picture: <ThemeImage src="category-vases.webp" alt={t('home.story.row5.alt')} ratio={1.15} sizes={rowSizes} className={styles.cover} /> },
    { key: 'row6', image: t('home.story.row6.image'), alt: t('home.story.row6.alt'), eyebrow: t('home.story.row6.eyebrow'), title: t('home.story.row6.title'), body: t('home.story.row6.body'), cta: t('home.story.row6.cta'), link: t('home.story.row6.link'),
      picture: <ThemeImage src="category-shadow-boxes.webp" alt={t('home.story.row6.alt')} ratio={1.15} sizes={rowSizes} className={styles.cover} /> },
    { key: 'row7', image: t('home.story.row7.image'), alt: t('home.story.row7.alt'), eyebrow: t('home.story.row7.eyebrow'), title: t('home.story.row7.title'), body: t('home.story.row7.body'), cta: t('home.story.row7.cta'), link: t('home.story.row7.link'),
      picture: <ThemeImage src="collection-victorian-blue-pottery.webp" alt={t('home.story.row7.alt')} ratio={1.15} sizes={rowSizes} className={styles.cover} /> },
    { key: 'row8', image: t('home.story.row8.image'), alt: t('home.story.row8.alt'), eyebrow: t('home.story.row8.eyebrow'), title: t('home.story.row8.title'), body: t('home.story.row8.body'), cta: t('home.story.row8.cta'), link: t('home.story.row8.link'),
      picture: <ThemeImage src="collection-italian-design-lighting.webp" alt={t('home.story.row8.alt')} ratio={1.15} sizes={rowSizes} className={styles.cover} /> },
    { key: 'row9', image: t('home.story.row9.image'), alt: t('home.story.row9.alt'), eyebrow: t('home.story.row9.eyebrow'), title: t('home.story.row9.title'), body: t('home.story.row9.body'), cta: t('home.story.row9.cta'), link: t('home.story.row9.link'),
      picture: <ThemeImage src="collection-handblown-glass.webp" alt={t('home.story.row9.alt')} ratio={1.15} sizes={rowSizes} className={styles.cover} /> },
  ].filter((r) => given(r.title) && r.title !== `home.story.${r.key}.title`)
  // A row the content has no words for yet comes back as its key; it is left out rather than shown as code.
  // home.story.last: rows moved to the end of the story, in that order.
  const last = featured(t('home.story.last'))
  const rest = all.filter((r) => !picked.includes(r.key))
  const rows = feature
    ? own.map((k) => all.find((r) => r.key === k)).filter((r): r is Row & { key: string } => r !== undefined)
    : [...rest.filter((r) => !last.includes(r.key)), ...last.map((k) => rest.find((r) => r.key === k)).filter((r): r is Row & { key: string } => r !== undefined)]
  if (rows.length === 0) return null
  return (
    <section className={styles.story}>
      {rows.map((row, i) => (
        <StoryRow key={row.title} row={row} flip={i % 2 === 1} />
      ))}
    </section>
  )
}

/** Visit our store: shown once the store's address is filled in (Site settings), with the way to the contact page. */
export const Visit = () => {
  const { store, t } = useStorefront()
  const place = [store.address?.street, store.address?.city, store.address?.region, store.address?.postal].filter(Boolean).join(', ')
  if (!store.address?.street && !store.address?.city) return null
  const own = given(t('home.visit.image'))
  return (
    <section className={own ? styles.visit : styles.visitPlain} aria-labelledby="home-visit">
      {own ? <MerchantImage asset={t('home.visit.image')} alt={t('home.visit.imageAlt')} ratio={2.4} sizes="100vw" className={styles.visitImage} /> : null}
      <div className={styles.visitCopy}>
        <p className={styles.eyebrowLight}>{t('home.visit.eyebrow')}</p>
        <h2 id="home-visit" className={styles.visitTitle}>
          {t('home.visit.title')}
        </h2>
        <p className={styles.visitLead}>{t('home.visit.lead')}</p>
        <p className={styles.visitPlace}>{place}</p>
        <Link href="/contact/#visit" className={styles.buttonLight}>
          {t('home.visit.action')}
          <ArrowIcon className={styles.buttonIcon} />
        </Link>
      </div>
    </section>
  )
}

/** The promise strip: up to four of the store's promises; one whose title is "-" is left out. */
export const Trust = () => {
  const { t } = useStorefront()
  const items = [
    { key: 'one', icon: <TruckIcon className={styles.trustIcon} />, title: t('home.trust.oneTitle'), text: t('home.trust.oneText') },
    { key: 'two', icon: <ReturnIcon className={styles.trustIcon} />, title: t('home.trust.twoTitle'), text: t('home.trust.twoText') },
    { key: 'three', icon: <CashIcon className={styles.trustIcon} />, title: t('home.trust.threeTitle'), text: t('home.trust.threeText') },
    { key: 'four', icon: <LockIcon className={styles.trustIcon} />, title: t('home.trust.fourTitle'), text: t('home.trust.fourText') },
  ].filter((i) => given(i.title))
  if (items.length === 0) return null
  return (
    <section className={styles.trust} aria-label={t('home.trust.label')}>
      <ul className={styles.trustList}>
        {items.map((i) => (
          <li key={i.key} className={styles.trustItem}>
            {i.icon}
            <span>
              <span className={styles.trustTitle}>{i.title}</span>
              {given(i.text) ? <span className={styles.trustText}>{i.text}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
