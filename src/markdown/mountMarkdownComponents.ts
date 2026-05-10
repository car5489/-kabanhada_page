import { createApp, type App, type Component } from 'vue'
import VehicleCatalogGrid from '@/components/vehicles/VehicleCatalogGrid.vue'

type MountedApp = {
  element: Element
  app: App
}

function mountOne(element: Element, component: Component, props: Record<string, unknown>): MountedApp | null {
  const htmlElement = element as HTMLElement
  if (htmlElement.dataset.vcMounted === '1') return null
  const app = createApp(component, props)
  app.mount(element)
  htmlElement.dataset.vcMounted = '1'
  return { element, app }
}

export function mountMarkdownComponents(root: HTMLElement): () => void {
  const mounted: MountedApp[] = []
  root.querySelectorAll('vehicle-catalog').forEach((element) => {
    const el = element as HTMLElement
    const props = {
      dataPath: el.dataset.data ?? 'data/vehicle-catalog.json',
    }
    const mountedApp = mountOne(element, VehicleCatalogGrid, props)
    if (mountedApp) mounted.push(mountedApp)
  })

  return () => {
    mounted.forEach(({ app }) => app.unmount())
  }
}
