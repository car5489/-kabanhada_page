export type NavigationSurface = 'header' | 'footer'

export type PageIndexItem = {
  id: string
  label: string
  href: string
  section: 'main'
  surface: NavigationSurface[]
  order: number
  description: string
}

export const pageIndex = [
  {
    id: 'catalog',
    label: '판매 차량',
    href: '/',
    section: 'main',
    surface: ['header', 'footer'],
    order: 0,
    description: '카반하다 판매중 차량 목록.',
  },
] as const satisfies readonly PageIndexItem[]

export function getNavigation(surface: NavigationSurface): PageIndexItem[] {
  return [...pageIndex]
    .filter((item) => item.surface.includes(surface))
    .sort((a, b) => a.order - b.order)
}
