import { useStorefront } from '@dripfunnel/storefront-core/theme'
import { Categories, Collections, Story, Trust, Visit } from '../components/HomeSections'
import { HeroSlider } from '../components/interactive/HeroSlider'
import { ProductTabs } from '../components/interactive/ProductTabs'
import { Layout } from '../components/Layout'

const sectionIds = ['hero', 'categories', 'collections', 'products', 'story', 'visit', 'trust'] as const
type SectionId = (typeof sectionIds)[number]

const isSection = (id: string): id is SectionId => (sectionIds as readonly string[]).includes(id)

const Section = ({ id }: { id: SectionId }) => {
  switch (id) {
    case 'hero':
      return <HeroSlider />
    case 'categories':
      return <Categories />
    case 'collections':
      return <Collections />
    case 'products':
      return <ProductTabs />
    case 'story':
      return <Story />
    case 'visit':
      return <Visit />
    case 'trust':
      return <Trust />
  }
}

/**
 * The home page's sections in the order the content names them (home.layout, comma separated): the merchant reorders
 * or leaves out a section there. Each section hides itself when the store has nothing for it.
 */
export const HomePage = () => {
  const { t } = useStorefront()
  const order = [
    ...new Set(
      t('home.layout')
        .split(',')
        .map((s) => s.trim())
        .filter(isSection),
    ),
  ]
  return (
    <Layout>
      {order.map((id) => (
        <Section key={id} id={id} />
      ))}
    </Layout>
  )
}
