import type { Listing } from '@dripfunnel/storefront-core/theme'
import { FilterPanel, ListingBody } from './interactive/Filters'
import styles from '../styles/shop.module.css'

/** A collection's or a search's products: filters beside (or under a button), then the results. */
export const ListingResults = ({ listing }: { listing: Listing }) => (
  <div className={listing.facets.length || listing.priceBounds ? styles.listingFiltered : styles.listing}>
    <FilterPanel listing={listing} />
    <ListingBody listing={listing} />
  </div>
)
