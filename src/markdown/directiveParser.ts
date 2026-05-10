import type { ParsedDirective } from './directiveTypes'

export function parseVehicleCatalogDirective(markdown: string): ParsedDirective | null {
  const match = markdown.match(/::vehicle-catalog\n([\s\S]*?)\n::/)
  if (!match) return null
  const attrs: ParsedDirective['attrs'] = {}
  for (const line of match[1].split('\n')) {
    const [rawKey, ...rest] = line.split(':')
    const key = rawKey?.trim()
    const value = rest.join(':').trim()
    if (!key) continue
    if (value === 'true') attrs[key] = true
    else if (value === 'false') attrs[key] = false
    else attrs[key] = value
  }
  return { name: 'vehicle-catalog', attrs }
}
