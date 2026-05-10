import { parseVehicleCatalogDirective } from './directiveParser'
import { renderDirective } from './directives'

export function renderMarkdownPage(markdown: string): string {
  const directive = parseVehicleCatalogDirective(markdown)
  if (!directive) return markdown
  return markdown.replace(/::vehicle-catalog\n([\s\S]*?)\n::/, renderDirective(directive))
}
