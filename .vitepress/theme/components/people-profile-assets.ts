const images = import.meta.glob('../../../content/about/image/people/*', { eager: true, query: '?url', import: 'default' })
export function portraitUrl(file?: string) {
  return file ? images[`../../../content/about/image/people/${file}`] as string | undefined : undefined
}
