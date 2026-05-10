import type { DirectiveFieldValue, ParsedDirective } from '../directiveTypes'
import { attrValue } from '../directiveHtml'

const VALID_DETAIL_MODE = new Set(['route'])
const VALID_SORT = new Set(['order', 'year-newest', 'year-oldest', 'mileage-low', 'mileage-high', 'title'])

function normalizeString(value: DirectiveFieldValue): string {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeBoolean(value: DirectiveFieldValue): boolean | undefined {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    if (value === 'true') return true
    if (value === 'false') return false
  }
  return undefined
}

function boolAttr(name: string, value: boolean | undefined): string {
  return value !== undefined ? `${name}="${attrValue(value)}"` : ''
}

export function renderVehicleCatalogDirective(directive: ParsedDirective): string {
  const attrs = directive.attrs
  const cardLinkMode = typeof attrs.cardLinkMode === 'string' && VALID_DETAIL_MODE.has(attrs.cardLinkMode)
    ? attrs.cardLinkMode
    : 'route'
  const defaultSort = typeof attrs.defaultSort === 'string' && VALID_SORT.has(attrs.defaultSort)
    ? attrs.defaultSort
    : 'order'

  const htmlAttrs = [
    normalizeString(attrs.title) ? `data-title="${attrValue(normalizeString(attrs.title))}"` : '',
    normalizeString(attrs.intro) ? `data-intro="${attrValue(normalizeString(attrs.intro))}"` : '',
    normalizeString(attrs.data) ? `data-data="${attrValue(normalizeString(attrs.data))}"` : 'data-data="data/vehicle-catalog.json"',
    `data-card-link-mode="${attrValue(cardLinkMode)}"`,
    normalizeString(attrs.detailBasePath) ? `data-detail-base-path="${attrValue(normalizeString(attrs.detailBasePath))}"` : 'data-detail-base-path="/catalog"',
    boolAttr('data-show-search', normalizeBoolean(attrs.showSearch)),
    boolAttr('data-show-filters', normalizeBoolean(attrs.showFilters)),
    boolAttr('data-copy-phone', normalizeBoolean(attrs.copyPhone)),
    `data-default-sort="${attrValue(defaultSort)}"`,
  ].filter(Boolean).join(' ')

  return `<vehicle-catalog ${htmlAttrs}></vehicle-catalog>`
}
