import { Link, useStorefront } from '@dripfunnel/storefront-core/theme'
import { Layout } from '../components/Layout'
import styles from '../styles/page.module.css'

export const NotFoundPage = () => {
  const { t } = useStorefront()
  return (
    <Layout>
      <section className={styles.pageCenter}>
        <p className={styles.big} aria-hidden="true">
          {t('pages.notFound.eyebrow')}
        </p>
        <h1 className={styles.title}>{t('pages.notFound.title')}</h1>
        <p className={styles.lead}>{t('pages.notFound.lead')}</p>
        <div className={styles.actions}>
          <Link href="/" className={styles.action}>
            {t('pages.notFound.action')}
          </Link>
          <Link href="/search/" className={styles.ghost}>
            {t('pages.notFound.search')}
          </Link>
        </div>
      </section>
    </Layout>
  )
}
