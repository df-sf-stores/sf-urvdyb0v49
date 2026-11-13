import { Link, useStorefront } from '@dripfunnel/storefront-core/theme'
import { Layout } from '../components/Layout'
import styles from '../styles/page.module.css'

/** Contact and store locator: every way to reach the store, from Site settings, and where to find it. */
export const ContactPage = () => {
  const { store, t } = useStorefront()
  const place = [store.address?.street, store.address?.city, store.address?.region, store.address?.postal].filter(Boolean).join(', ')
  const hours = t('pages.contact.hours')
  const number = store.contactPhone ? store.contactPhone.replace(/(?!^\+)[^\d]/g, '') : ''
  return (
    <Layout>
      <section className={styles.page}>
        <p className={styles.eyebrow}>{t('pages.contact.eyebrow')}</p>
        <h1 className={styles.title}>{t('pages.contact.title')}</h1>
        <p className={styles.lead}>{t('pages.contact.lead')}</p>
        <dl className={styles.details}>
          {store.contactEmail ? (
            <div className={styles.detail}>
              <dt className={styles.term}>{t('pages.contact.email')}</dt>
              <dd className={styles.value}>{store.contactEmail}</dd>
            </div>
          ) : null}
          {store.contactPhone ? (
            <div className={styles.detail}>
              <dt className={styles.term}>{t('pages.contact.phone')}</dt>
              <dd className={styles.value}>
                <Link href={t('common.footer.tel', { number })} className={styles.valueLink}>
                  {store.contactPhone}
                </Link>
              </dd>
            </div>
          ) : null}
          {place ? (
            <div id="visit" className={styles.detail}>
              <dt className={styles.term}>{t('pages.contact.visit')}</dt>
              <dd className={styles.value}>{place}</dd>
            </div>
          ) : null}
          {hours.trim() !== '-' ? (
            <div className={styles.detail}>
              <dt className={styles.term}>{t('pages.contact.hoursLabel')}</dt>
              <dd className={styles.value}>{hours}</dd>
            </div>
          ) : null}
          <div className={styles.detail}>
            <dt className={styles.term}>{t('pages.contact.orders')}</dt>
            <dd className={styles.value}>
              <Link href="/account/orders/" className={styles.valueLink}>
                {t('pages.contact.ordersLead')}
              </Link>
            </dd>
          </div>
        </dl>
      </section>
    </Layout>
  )
}
