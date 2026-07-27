type Crumb = {
  name: string
  url: string
}

/**
 * Renders a schema.org BreadcrumbList JSON-LD script tag.
 * Helps Google show a breadcrumb trail (instead of the raw URL) in search results.
 */
export default function BreadcrumbSchema({ items }: { items: Crumb[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
