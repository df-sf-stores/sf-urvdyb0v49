'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Image,
  Link,
  navigate,
  SearchField,
  StoreLogo,
  useCart,
  useCollections,
  useLocation,
  useMenu,
  useReducedMotion,
  useScrollProgress,
  useStorefront,
  useWishlist,
  type MenuItem,
  type Photo,
} from '@dripfunnel/storefront-core/theme'
import { AccountIcon, BagIcon, CaretIcon, CloseIcon, HeartIcon, MenuIcon, PauseIcon, SearchIcon } from '../Icons'
import shop from '../../styles/shop.module.css'
import styles from '../../styles/layout.module.css'

/** How many top categories the desktop row shows before the rest go under "More". */
const rowLimit = 5

const trimSlash = (href: string) => href.replace(/\/+$/, '')

/** Words for the address's query; navigate() encodes the rest, so only what would split the query is escaped. */
const queryValue = (words: string) => words.replace(/[%&#+=]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)

/**
 * The header's categories: the merchant's menu (Storefront › Navigation), or, while it has no items, the store's own
 * collections, so the row is never empty and nothing is written into the theme.
 */
const useNavigation = () => {
  const menu = useMenu()
  const { collections } = useCollections({ first: 50 })
  const pictures = new Map<string, Photo>()
  for (const c of collections) if (c.image) pictures.set(trimSlash(c.href), c.image)
  const items: MenuItem[] = menu.items.length ? menu.items : collections.map((c) => ({ id: c.id, label: c.name, href: c.href, children: [] }))
  const pictureOf = (item: MenuItem) => pictures.get(trimSlash(item.href)) ?? null
  return { items, pictureOf, ready: menu.status !== 'loading' }
}

/** The announcement bar: the merchant's messages (content › common.announcement.messages, split by |), one at a time. */
const Announcement = () => {
  const { t } = useStorefront()
  const still = useReducedMotion()
  const messages = t('common.announcement.messages')
    .split('|')
    .map((m) => m.trim())
    .filter((m) => m !== '' && m !== '-')
  const [shown, setShown] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [closed, setClosed] = useState(false)
  const rotating = messages.length > 1 && !paused && !hovered && !still
  useEffect(() => {
    if (!rotating) return
    const timer = setInterval(() => setShown((i) => (i + 1) % messages.length), 5000)
    return () => clearInterval(timer)
  }, [rotating, messages.length])
  if (closed || messages.length === 0) return null
  return (
    <section className={styles.announce} aria-label={t('common.announcement.label')} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <div className={styles.announceInner}>
        {messages.length > 1 && !still ? (
          <button type="button" className={styles.announcePause} aria-label={paused ? t('common.announcement.play') : t('common.announcement.pause')} aria-pressed={paused} onClick={() => setPaused(!paused)}>
            <PauseIcon className={styles.iconSm} paused={paused} />
          </button>
        ) : null}
        <div className={styles.announceTrack} aria-live={rotating ? 'off' : 'polite'}>
          {messages.map((m, i) => (
            <p key={m} className={i === shown % messages.length ? styles.announceMessageOn : styles.announceMessage} aria-hidden={i === shown % messages.length ? undefined : true}>
              {m}
            </p>
          ))}
        </div>
        <button type="button" className={styles.announceClose} aria-label={t('common.announcement.dismiss')} onClick={() => setClosed(true)}>
          <CloseIcon className={styles.iconSm} />
        </button>
      </div>
    </section>
  )
}

/** The sticky header's frame: a shadow and a smaller logo once the page has scrolled. Its children don't re-render. */
const StickyFrame = ({ children }: { children: ReactNode }) => {
  const progress = useScrollProgress()
  return <header className={progress > 0 ? styles.headerStuck : styles.header}>{children}</header>
}

/** The category row, the only part that stays on screen from desktops up; a shadow once the page has scrolled. */
const StickyNav = ({ children }: { children: ReactNode }) => {
  const progress = useScrollProgress()
  return <div className={progress > 0 ? styles.navRowStuck : styles.navRow}>{children}</div>
}

/** One top category on the desktop row; with sub-links it opens a mega menu of links and pictures on hover or press. */
const NavEntry = ({ item, open, onOpen, pictureOf }: { item: MenuItem; open: boolean; onOpen: (id: string | null) => void; pictureOf: (item: MenuItem) => Photo | null }) => {
  const { t } = useStorefront()
  const leaving = useRef<ReturnType<typeof setTimeout>>(undefined)
  const toggle = useRef<HTMLButtonElement>(null)
  const hasPanel = item.children.length > 0
  const cards = [...item.children, ...(item.children.length ? [] : [item])]
    .map((c) => ({ item: c, photo: pictureOf(c) }))
    .filter((c): c is { item: MenuItem; photo: Photo } => c.photo !== null)
    .slice(0, 4)
  const own = pictureOf(item)
  const shownCards = cards.length ? cards : own ? [{ item, photo: own }] : []
  const enter = () => {
    clearTimeout(leaving.current)
    if (hasPanel) onOpen(item.id)
  }
  const leave = () => {
    clearTimeout(leaving.current)
    leaving.current = setTimeout(() => onOpen(null), 140)
  }
  useEffect(() => () => clearTimeout(leaving.current), [])
  return (
    <div
      className={open ? styles.navItemOpen : styles.navItem}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') enter()
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') leave()
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Escape' || !open) return
        onOpen(null)
        toggle.current?.focus()
      }}
      onFocus={() => clearTimeout(leaving.current)}
      onBlur={() => {
        clearTimeout(leaving.current)
        leaving.current = setTimeout(() => onOpen(null), 0)
      }}
    >
      <Link href={item.href} className={styles.navLink}>
        {item.label}
      </Link>
      {hasPanel ? (
        <>
          <button ref={toggle} type="button" className={styles.navLink} aria-expanded={open} aria-label={t('common.nav.submenu', { item: item.label })} onClick={() => onOpen(open ? null : item.id)}>
            <CaretIcon className={styles.caret} />
          </button>
          <div className={open ? styles.megaOpen : styles.mega}>
            <div className={styles.megaInner}>
              <div>
                <p className={styles.megaTitle}>{item.label}</p>
                <ul className={styles.megaLinks}>
                  {item.children.map((child) => (
                    <li key={child.id}>
                      <Link href={child.href} className={styles.megaLink}>
                        {child.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href={item.href} className={styles.megaAll}>
                      {t('common.nav.viewAll', { item: item.label })}
                    </Link>
                  </li>
                </ul>
              </div>
              {shownCards.length ? (
                <div className={styles.megaCards}>
                  {shownCards.map((c) => (
                    <Link key={c.item.id} href={c.item.href} className={styles.megaCard}>
                      <span className={styles.megaPicture}>
                        <Image image={c.photo} alt={c.photo.alt ?? c.item.label} ratio={0.8} sizes="240px" className={styles.megaImage} />
                      </span>
                      <span>{c.item.label}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

/** The rest of the categories, once there are more than the row holds. */
const MoreEntry = ({ items, open, onOpen }: { items: MenuItem[]; open: boolean; onOpen: (id: string | null) => void }) => {
  const { t } = useStorefront()
  const leaving = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(leaving.current), [])
  return (
    <div
      className={styles.more}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onOpen(null)
      }}
      onFocus={() => clearTimeout(leaving.current)}
      onBlur={() => {
        clearTimeout(leaving.current)
        leaving.current = setTimeout(() => onOpen(null), 0)
      }}
    >
      <button type="button" className={styles.navLink} aria-expanded={open} aria-controls="nav-more" onClick={() => onOpen(open ? null : 'more')}>
        {t('common.nav.more')}
        <CaretIcon className={styles.caret} />
      </button>
      <ul id="nav-more" className={styles.moreMenu} hidden={!open}>
        {items.map((item) => (
          <li key={item.id}>
            <Link href={item.href} className={styles.moreLink}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The phone and tablet menu: a drawer of categories, each opening to its sub-links, with their pictures. */
const Drawer = ({ open, onClose, items, pictureOf }: { open: boolean; onClose: () => void; items: MenuItem[]; pictureOf: (item: MenuItem) => Photo | null }) => {
  const { t } = useStorefront()
  const [expanded, setExpanded] = useState<string | null>(null)
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (open) close.current?.focus()
  }, [open])
  return (
    <>
      <div className={open ? styles.scrimOn : styles.scrim} aria-hidden="true" onClick={onClose} />
      <div
        id="site-drawer"
        className={open ? styles.drawerOpen : styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-label={t('common.nav.drawer')}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onClose()
        }}
      >
        <div className={styles.drawerHead}>
          <p className={styles.drawerTitle}>{t('common.nav.menu')}</p>
          <button ref={close} type="button" className={styles.tool} aria-label={t('common.nav.close')} onClick={onClose}>
            <CloseIcon className={styles.icon} />
          </button>
        </div>
        <nav className={styles.drawerBody} aria-label={t('common.nav.label')}>
          <ul className={styles.drawerList}>
            <li className={styles.drawerItem}>
              <div className={styles.drawerRow}>
                <Link href="/collections/all/" className={styles.drawerLink}>
                  {t('common.nav.shop')}
                </Link>
              </div>
            </li>
            {items.map((item) => {
              const photo = pictureOf(item)
              const isOpen = expanded === item.id
              const childCards = item.children
                .map((c) => ({ item: c, photo: pictureOf(c) }))
                .filter((c): c is { item: MenuItem; photo: Photo } => c.photo !== null)
              return (
                <li key={item.id} className={styles.drawerItem}>
                  <div className={styles.drawerRow}>
                    <Link href={item.href} className={styles.drawerLink}>
                      <span className={styles.drawerThumb}>{photo ? <Image image={photo} alt="" ratio={1} sizes="44px" className={styles.drawerThumbImage} /> : null}</span>
                      {item.label}
                    </Link>
                    {item.children.length ? (
                      <button type="button" className={styles.drawerToggle} aria-expanded={isOpen} aria-controls={`drawer-${item.id}`} aria-label={t('common.nav.submenu', { item: item.label })} onClick={() => setExpanded(isOpen ? null : item.id)}>
                        <CaretIcon className={styles.caret} />
                      </button>
                    ) : null}
                  </div>
                  {item.children.length ? (
                    <div id={`drawer-${item.id}`} hidden={!isOpen}>
                      {childCards.length ? (
                        <div className={styles.drawerCards}>
                          {childCards.slice(0, 4).map((c) => (
                            <Link key={c.item.id} href={c.item.href} className={styles.drawerCard}>
                              <span className={styles.drawerCardPicture}>
                                <Image image={c.photo} alt="" ratio={1} sizes="45vw" className={styles.drawerThumbImage} />
                              </span>
                              <span>{c.item.label}</span>
                            </Link>
                          ))}
                        </div>
                      ) : null}
                      <ul className={styles.drawerSub}>
                        {item.children.map((child) => (
                          <li key={child.id}>
                            <Link href={child.href} className={styles.drawerSubLink}>
                              {child.label}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link href={item.href} className={styles.drawerSubLink}>
                            {t('common.nav.viewAll', { item: item.label })}
                          </Link>
                        </li>
                      </ul>
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
          <div className={styles.drawerFoot}>
            <p className={styles.drawerFootTitle}>{t('common.nav.info')}</p>
            <Link href="/account/" className={styles.drawerFootLink}>
              <AccountIcon className={styles.iconSm} />
              {t('common.tools.account')}
            </Link>
            <Link href="/account/wishlist/" className={styles.drawerFootLink}>
              <HeartIcon className={styles.iconSm} />
              {t('common.tools.wishlist')}
            </Link>
            <Link href="/account/orders/" className={styles.drawerFootLink}>
              {t('common.footer.orderTracking')}
            </Link>
            <Link href="/about/" className={styles.drawerFootLink}>
              {t('common.footer.aboutUs')}
            </Link>
            <Link href="/contact/" className={styles.drawerFootLink}>
              {t('common.footer.contactUs')}
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}

/** The full-screen search: core's search box suggests products (picture, name, price) as the shopper types. */
const SearchLayer = ({ open, onClose, items }: { open: boolean; onClose: () => void; items: MenuItem[] }) => {
  const { t } = useStorefront()
  const close = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (open) close.current?.focus()
  }, [open])
  return (
    <div
      id="site-search"
      className={open ? styles.searchLayerOpen : styles.searchLayer}
      role="dialog"
      aria-modal="true"
      aria-label={t('common.tools.search')}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
      }}
    >
      <div className={styles.searchHead}>
        <p className={styles.searchTitle}>{t('common.tools.searchTitle')}</p>
        <button ref={close} type="button" className={styles.tool} aria-label={t('common.tools.searchClose')} onClick={onClose}>
          <CloseIcon className={styles.icon} />
        </button>
      </div>
      <div className={styles.searchBody}>
        {open ? (
          <SearchField
            label={t('shop.search.label')}
            placeholder={t('shop.search.placeholder')}
            button={t('shop.search.button')}
            value=""
            suggest={4}
            onSearch={(words) => {
              onClose()
              navigate(`/search/?q=${queryValue(words)}`)
            }}
            className={shop.search}
          />
        ) : null}
        {items.length ? (
          <div className={styles.searchChips}>
            <p className={styles.searchChipsTitle}>{t('common.tools.searchPopular')}</p>
            {items.slice(0, 8).map((item) => (
              <Link key={item.id} href={item.href} className={styles.searchChip}>
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/** Everything above the page: the announcements, the sticky header with its categories, the drawer and the search. */
export const Masthead = () => {
  const { t } = useStorefront()
  const { count } = useCart()
  const saved = useWishlist().count
  const { path } = useLocation()
  const { items, pictureOf } = useNavigation()
  const [panel, setPanel] = useState<string | null>(null)
  const [drawer, setDrawer] = useState(false)
  const [search, setSearch] = useState(false)
  // A new page closes whatever was open.
  useEffect(() => {
    setPanel(null)
    setDrawer(false)
    setSearch(false)
  }, [path])
  const row = items.length > rowLimit + 1 ? items.slice(0, rowLimit) : items
  const rest = items.length > rowLimit + 1 ? items.slice(rowLimit) : []
  return (
    <>
      <Announcement />
      <StickyFrame>
        <div className={styles.bar}>
          <div className={styles.start}>
            <button type="button" className={styles.menuButton} aria-expanded={drawer} aria-controls="site-drawer" onClick={() => setDrawer(true)}>
              <MenuIcon className={styles.icon} />
              <span className={styles.hidden}>{t('common.nav.menu')}</span>
            </button>
          </div>
          <Link href="/" className={styles.brand}>
            <StoreLogo className={styles.logo} />
          </Link>
          <div className={styles.end}>
            <button type="button" className={styles.tool} aria-expanded={search} aria-controls="site-search" onClick={() => setSearch(true)}>
              <SearchIcon className={styles.icon} />
              <span className={styles.hidden}>{t('common.tools.searchOpen')}</span>
            </button>
            <Link href="/account/wishlist/" className={styles.toolDesktop}>
              <HeartIcon className={styles.icon} />
              <span className={styles.hidden}>{saved > 0 ? t('common.tools.wishlistCount', { count: saved }) : t('common.tools.wishlist')}</span>
              {saved > 0 ? (
                <span className={styles.count} aria-hidden="true">
                  {saved}
                </span>
              ) : null}
            </Link>
            <Link href="/account/" className={styles.toolDesktop}>
              <AccountIcon className={styles.icon} />
              <span className={styles.hidden}>{t('common.tools.account')}</span>
            </Link>
            <Link href="/cart/" className={styles.tool}>
              <BagIcon className={styles.icon} />
              <span className={styles.hidden}>{count > 0 ? t('common.tools.cartCount', { count }) : t('common.tools.cart')}</span>
              {count > 0 ? (
                <span className={styles.count} aria-hidden="true">
                  {count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>
      </StickyFrame>
      <StickyNav>
        <div className={styles.navRowInner}>
          <nav className={styles.nav} aria-label={t('common.nav.label')}>
            <div className={styles.navItem}>
              <Link href="/collections/all/" className={styles.navLink}>
                {t('common.nav.shop')}
              </Link>
            </div>
            {row.map((item) => (
              <NavEntry key={item.id} item={item} open={panel === item.id} onOpen={setPanel} pictureOf={pictureOf} />
            ))}
            {rest.length ? <MoreEntry items={rest} open={panel === 'more'} onOpen={setPanel} /> : null}
            <div className={styles.navItem}>
              <Link href="/about/" className={styles.navLink}>
                {t('common.nav.about')}
              </Link>
            </div>
            <div className={styles.navItem}>
              <Link href="/contact/" className={styles.navLink}>
                {t('common.nav.contact')}
              </Link>
            </div>
          </nav>
        </div>
      </StickyNav>
      <Drawer open={drawer} onClose={() => setDrawer(false)} items={items} pictureOf={pictureOf} />
      <SearchLayer open={search} onClose={() => setSearch(false)} items={items} />
    </>
  )
}
