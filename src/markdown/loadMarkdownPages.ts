export type MarkdownPageRecord = {
  slug: string
  title: string
  content: string
}

export async function loadMarkdownPages(): Promise<MarkdownPageRecord[]> {
  return []
}
