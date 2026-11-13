import { Breadcrumbs, LegalNotices, Link, Price, RichText, useProduct, useStorefront } from '@dripfunnel/storefront-core/theme'
import { BuyButtons } from '../components/interactive/BuyButtons'
import { Carousel } from '../components/interactive/Carousel'
import { Gallery } from '../components/interactive/Gallery'
import { Options } from '../components/interactive/Options'
import { Retry } from '../components/interactive/Retry'
import { WishlistHeart } from '../components/interactive/WishlistView'
import { BoxIcon, ImageCheckIcon, ReturnIcon, SocialIcon, VideoIcon } from '../components/Icons'
import { Layout } from '../components/Layout'
import { Notice } from '../components/Notice'
import { onSale, ProductCard } from '../components/ProductCard'
import home from '../styles/home.module.css'
import shop from '../styles/shop.module.css'
import styles from '../styles/product.module.css'

/** "-" (or "none" for a link) is how the merchant leaves a line out in the content. */
const given = (words: string) => words.trim() !== '' && words.trim() !== '-' && words.trim() !== 'none'

export const ProductPage = () => {
  const { store, locale, t } = useStorefront()
  const page = useProduct()
  const product = page.product
  if (page.status === 'missing' || page.status === 'error' || !product) {
    return (
      <Layout>
        <section className={shop.page}>
          {page.status === 'missing' ? (
            <Notice main title={t('shop.product.missing')} lead={t('shop.product.missingLead')}>
              <Link href="/collections/all/" className={shop.primary}>
                {t('shop.collection.browse')}
              </Link>
            </Notice>
          ) : page.status === 'error' ? (
            <Notice main title={t('shop.product.failed')} lead={t('shop.listing.failedLead')}>
              <Retry label={t('shop.listing.retry')} onRetry={page.retry} />
            </Notice>
          ) : (
            <div className={styles.product} aria-busy="true">
              <div className={styles.noPicture} />
              <div className={styles.info}>
                <h1 className={styles.loadingTitle}>{t('shop.product.loading')}</h1>
                <div className={styles.skeleton} />
                <div className={styles.skeletonShort} />
              </div>
            </div>
          )}
        </section>
      </Layout>
    )
  }
  const firstMissing = page.missing[0]
  const specs = product.specs.filter((s) => s.versionId === null || s.versionId === page.version?.id)
  const sale = onSale(page.price, page.compareAt)
  const percent = sale && page.price && page.compareAt ? Math.round((1 - Number(page.price.amount) / Number(page.compareAt.amount)) * 100) : 0
  const whatsapp = store.social.find((s) => s.network.toLowerCase() === 'whatsapp')
  const videoCall = t('shop.product.videoCallLink')
  const trust = [
    { key: 'one', icon: <BoxIcon className={styles.trustIcon} />, words: t('shop.product.trust.one') },
    { key: 'two', icon: <ImageCheckIcon className={styles.trustIcon} />, words: t('shop.product.trust.two') },
    { key: 'three', icon: <ReturnIcon className={styles.trustIcon} />, words: t('shop.product.trust.three') },
  ].filter((i) => given(i.words))
  const place = [store.address?.city, store.address?.region].filter(Boolean).join(', ')
  return (
    <Layout>
      <section className={shop.page}>
        <Breadcrumbs crumbs={[{ label: t('shop.crumbs.home'), href: '/' }, { label: product.name, href: product.href }]} t={t} className={shop.crumbs} />
        <div className={styles.product}>
          <Gallery photos={page.photos} video={product.video} name={product.name} />
          <div className={styles.info}>
            <div className={styles.badges}>
              {product.badges.map((b) => (
                <span key={b.label} className={styles.badge}>
                  {b.label}
                </span>
              ))}
              {sale && product.badges.length === 0 ? <span className={styles.badgeSale}>{t('shop.card.sale')}</span> : null}
            </div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{product.name}</h1>
              <WishlistHeart productId={product.id} versionId={page.version?.id ?? null} className={styles.heart} onClassName={styles.heartOn} />
            </div>
            {page.price ? (
              <div className={styles.priceBlock}>
                <p className={styles.price}>
                  {page.from ? <span className={styles.from}>{t('shop.card.from')}</span> : null}
                  <Price money={page.price} compareAt={page.compareAt} includesTax={store.pricesIncludeTax} locale={locale} t={t} className={styles.priceTag} />
                </p>
                {percent > 0 ? <p className={styles.save}>{t('shop.product.save', { percent })}</p> : null}
                {store.pricesIncludeTax ? <p className={styles.taxes}>{t('shop.product.taxes')}</p> : null}
                {given(t('shop.product.emi')) ? <p className={styles.emi}>{t('shop.product.emi')}</p> : null}
              </div>
            ) : null}
            {trust.length ? (
              <ul className={styles.trust} aria-label={t('shop.product.trust.label')}>
                {trust.map((i) => (
                  <li key={i.key} className={styles.trustItem}>
                    {i.icon}
                    <span>{i.words}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <Options page={page} />
            <p className={page.stock?.inStock || firstMissing ? styles.stock : styles.stockOut} role="status">
              <span className={styles.stockDot} aria-hidden="true" />
              {firstMissing ? t('shop.product.choose', { option: firstMissing.name }) : page.stock?.inStock ? t('shop.product.inStock') : t('shop.product.outOfStock')}
            </p>
            <BuyButtons page={page} />
            {whatsapp || given(videoCall) ? (
              <div className={styles.assist}>
                {whatsapp ? (
                  <Link href={whatsapp.url} className={styles.assistLink}>
                    <SocialIcon network={whatsapp.network} className={styles.assistIcon} />
                    {t('shop.product.whatsapp')}
                  </Link>
                ) : null}
                {given(videoCall) ? (
                  <Link href={videoCall} className={styles.assistLink}>
                    <VideoIcon className={styles.assistIconLine} />
                    {t('shop.product.videoCall')}
                  </Link>
                ) : null}
              </div>
            ) : null}
            {product.highlights.length ? (
              <ul className={styles.highlights}>
                {product.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : null}
            <LegalNotices notices={product.legal} t={t} className={styles.legal} />
            <div className={styles.sections}>
              {product.description ? (
                <details className={styles.section} open>
                  <summary className={styles.summary}>{t('shop.product.description')}</summary>
                  <RichText html={product.description} className={styles.rich} />
                </details>
              ) : null}
              {specs.length ? (
                <details className={styles.section}>
                  <summary className={styles.summary}>{t('shop.product.specs')}</summary>
                  <dl className={styles.specs}>
                    {specs.map((s) => (
                      <div key={`${s.name}-${s.versionId ?? ''}`} className={styles.spec}>
                        <dt>{s.name}</dt>
                        <dd>{s.value}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ) : null}
              <details className={styles.section}>
                <summary className={styles.summary}>{t('shop.product.shipping')}</summary>
                <p className={styles.body}>{product.returns ?? t('shop.product.shippingText')}</p>
                {product.warranty ? (
                  <p className={styles.body}>
                    <strong>{t('shop.product.warranty')}</strong> {product.warranty}
                  </p>
                ) : null}
                <p className={styles.body}>
                  <Link href="/policies/returns/" className={styles.inlineLink}>
                    {t('common.footer.returnsPolicy')}
                  </Link>
                </p>
              </details>
              <details className={styles.section}>
                <summary className={styles.summary}>{t('shop.product.seller')}</summary>
                <p className={styles.body}>{t('shop.product.sellerText', { store: store.name })}</p>
                {place ? <p className={styles.body}>{place}</p> : null}
                {store.contactEmail ? <p className={styles.body}>{store.contactEmail}</p> : null}
              </details>
              {product.faqs.length ? (
                <details className={styles.section}>
                  <summary className={styles.summary}>{t('shop.product.questions')}</summary>
                  <dl className={styles.specs}>
                    {product.faqs.map((f) => (
                      <div key={f.question} className={styles.faq}>
                        <dt>{f.question}</dt>
                        <dd>{f.answer}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              ) : null}
            </div>
          </div>
        </div>
      </section>
      {product.related.length ? (
        <section className={home.band} aria-labelledby="related">
          <div className={home.bandHead}>
            <h2 id="related" className={home.heading}>
              {t('shop.product.related')}
            </h2>
          </div>
          <Carousel label={t('shop.product.related')}>
            {product.related.map((p) => (
              <li key={p.id} className={home.slot}>
                <ProductCard product={p} />
              </li>
            ))}
          </Carousel>
        </section>
      ) : null}
    </Layout>
  )
}
