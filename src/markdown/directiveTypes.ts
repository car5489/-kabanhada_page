export type DirectiveFieldValue = string | boolean | number | undefined

export type DirectiveName = 'vehicle-catalog'

export type ParsedDirective = {
  name: DirectiveName
  attrs: Record<string, DirectiveFieldValue>
}

export const KNOWN_DIRECTIVES: readonly DirectiveName[] = ['vehicle-catalog']
