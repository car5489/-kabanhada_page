import type { ParsedDirective } from '../directiveTypes'
import { renderVehicleCatalogDirective } from './vehicleCatalogDirective'

export function renderDirective(directive: ParsedDirective): string {
  switch (directive.name) {
    case 'vehicle-catalog':
      return renderVehicleCatalogDirective(directive)
    default:
      return ''
  }
}
