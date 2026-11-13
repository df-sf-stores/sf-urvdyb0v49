import type { ReactNode } from 'react'
import { ConsentBanner, ConsentSettingsButton, Link, PreviewBanner, StoreLogo, ThemeImage, useStorefront } from '@dripfunnel/storefront-core/theme'
import { FooterGroup } from './interactive/FooterGroup'
import { Masthead } from './interactive/Masthead'
import { MailIcon, PhoneIcon, PinIcon, SocialIcon } from './Icons'
import styles from '../styles/layout.module.css'

/** A number as `tel:` wants it: digits, with a leading + kept. */
const dialable = (phone: string) => phone.replace(/(?!^\+)[^\d]/g, '')

/** One phone line of the footer, tap to call; "-" in the content leaves it out. */
const PhoneLine = ({ label, phone }: { label: string | null; phone: string }) => {
  const { t } = useStorefront()
  const number = dialable(phone)
  if (phone.trim() === '-' || number.replace('+', '').length < 6) return null
  return (
    <li className={styles.contactItem}>
      <PhoneIcon className={styles.iconSm} />
      <span>
        {label ? <span className={styles.contactLabel}>{label}: </span> : null}
        <Link href={t('common.footer.tel', { number })} className={styles.contactLink}>
          {phone}
        </Link>
      </span>
    </li>
  )
}

export const Layout = ({ children }: { children: ReactNode }) => {
  const { store, t, mode } = useStorefront()
  const place = [store.address?.street, store.address?.city, store.address?.region, store.address?.postal].filter(Boolean).join(', ')
  return (
    <div className={styles.shell}>
      {mode === 'live' ? null : <PreviewBanner t={t} className={styles.preview} />}
      <Masthead />
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <div className={styles.columns}>
          <div className={styles.about}>
            <Link href="/" className={styles.footerLogo}>
              <StoreLogo className={styles.footerLogoImage} />
            </Link>
            <p className={styles.footerName}>{store.name}</p>
            <ul className={styles.contactList} aria-label={t('common.footer.contact')}>
              {place ? (
                <li className={styles.contactItem}>
                  <PinIcon className={styles.iconSm} />
                  <span>
                    <span className={styles.contactLabel}>{t('common.footer.visit')}: </span>
                    <Link href="/contact/" className={styles.contactLink}>
                      {place}
                    </Link>
                  </span>
                </li>
              ) : null}
              {store.contactPhone ? <PhoneLine label={null} phone={store.contactPhone} /> : null}
              <PhoneLine label={t('common.footer.salesLabel')} phone={t('common.footer.salesPhone')} />
              <PhoneLine label={t('common.footer.returnsLabel')} phone={t('common.footer.returnsPhone')} />
              <PhoneLine label={t('common.footer.deliveryLabel')} phone={t('common.footer.deliveryPhone')} />
              {store.contactEmail ? (
                <li className={styles.contactItem}>
                  <MailIcon className={styles.iconSm} />
                  <span>{store.contactEmail}</span>
                </li>
              ) : null}
            </ul>
          </div>
          <FooterGroup title={t('common.footer.policies')}>
            <li>
              <Link href="/policies/returns/" className={styles.footerLink}>
                {t('common.footer.returnsPolicy')}
              </Link>
            </li>
            <li>
              <Link href="/policies/privacy/" className={styles.footerLink}>
                {t('common.footer.privacyPolicy')}
              </Link>
            </li>
            <li>
              <Link href="/policies/shipping/" className={styles.footerLink}>
                {t('common.footer.shippingPolicy')}
              </Link>
            </li>
            <li>
              <Link href="/policies/terms/" className={styles.footerLink}>
                {t('common.footer.termsPolicy')}
              </Link>
            </li>
            <li>
              <Link href="/policies/legal/" className={styles.footerLink}>
                {t('common.footer.legalPolicy')}
              </Link>
            </li>
          </FooterGroup>
          <FooterGroup title={t('common.footer.information')}>
            <li>
              <Link href="/about/" className={styles.footerLink}>
                {t('common.footer.aboutUs')}
              </Link>
            </li>
            <li>
              <Link href="/blog/" className={styles.footerLink}>
                {t('common.footer.blog')}
              </Link>
            </li>
            <li>
              <Link href="/contact/" className={styles.footerLink}>
                {t('common.footer.contactUs')}
              </Link>
            </li>
            <li>
              <Link href="/contact/#visit" className={styles.footerLink}>
                {t('common.footer.storeLocator')}
              </Link>
            </li>
            <li>
              <Link href="/account/orders/" className={styles.footerLink}>
                {t('common.footer.orderTracking')}
              </Link>
            </li>
          </FooterGroup>
          <div className={styles.about}>
            <h2 className={styles.connectTitle}>{t('common.footer.connected')}</h2>
            <p className={styles.connectLead}>{t('common.footer.connectedLead')}</p>
            {store.social.length ? (
              <ul className={styles.social}>
                {store.social.map((s) => (
                  <li key={s.network}>
                    <Link href={s.url} className={styles.socialLink}>
                      <SocialIcon network={s.network} className={styles.socialIcon} />
                      <span className={styles.hidden}>{t('common.footer.followOn', { network: s.network })}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <div>
              <Link href="/register/" className={styles.join}>
                {t('common.footer.join')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
      <div className={styles.baseBar}>
        <div className={styles.baseInner}>
          <p className={styles.copyright}>{t('common.footer.copyright', { name: store.name })}</p>
          <div className={styles.baseEnd}>
            <Link href="/policies/privacy/" className={styles.baseLink}>
              {t('common.footer.privacy')}
            </Link>
            <Link href="/policies/terms/" className={styles.baseLink}>
              {t('common.footer.terms')}
            </Link>
            <ConsentSettingsButton t={t} className={styles.cookies} />
            <span className={styles.divider} aria-hidden="true" />
            <span className={styles.powered}>{t('common.footer.poweredBy')}</span>
            <Link href={t('common.footer.poweredUrl')} className={styles.brandLink}>
              <ThemeImage src="dripfunnel-logo.png" alt={t('common.footer.poweredLogo')} ratio={845 / 143} sizes="104px" className={styles.brandLogo} />
            </Link>
          </div>
        </div>
      </div>
      <ConsentBanner t={t} className={styles.consent} />
    </div>
  )
}
