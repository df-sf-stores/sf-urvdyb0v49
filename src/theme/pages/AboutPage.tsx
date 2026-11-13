import { Image, Link, MerchantImage, useCollections, useStorefront } from '@dripfunnel/storefront-core/theme'
import { Layout } from '../components/Layout'
import styles from '../styles/page.module.css'

export const AboutPage = () => {
  const { t } = useStorefront()
  const { collections } = useCollections({ first: 4 })
  const own = t('pages.about.image').trim() !== 'none'
  const photo = collections.find((c) => c.image)?.image ?? null
  return (
    <Layout>
      <section className={styles.split}>
        <div className={styles.page}>
          <p className={styles.eyebrow}>{t('pages.about.eyebrow')}</p>
          <h1 className={styles.title}>{t('pages.about.title')}</h1>
          <p className={styles.lead}>{t('pages.about.first')}</p>
          <p className={styles.lead}>{t('pages.about.second')}</p>
          <div className={styles.actions}>
            <Link href="/collections/all/" className={styles.action}>
              {t('home.hero.shop')}
            </Link>
            <Link href="/contact/" className={styles.ghost}>
              {t('common.footer.contactUs')}
            </Link>
          </div>
        </div>
        <div className={styles.picture}>
          {own ? (
            <MerchantImage asset={t('pages.about.image')} alt={t('pages.about.imageAlt')} ratio={0.9} sizes="(min-width: 900px) 50vw, 100vw" className={styles.cover} />
          ) : photo ? (
            <Image image={photo} alt={photo.alt ?? t('pages.about.imageAlt')} ratio={0.9} sizes="(min-width: 900px) 50vw, 100vw" className={styles.cover} />
          ) : null}
        </div>
      </section>
    </Layout>
  )
}
