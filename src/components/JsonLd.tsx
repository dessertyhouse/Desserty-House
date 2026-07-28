/** Renders one or more Schema.org nodes as a single JSON-LD @graph script tag. */
export default function JsonLd({ data }: { data: object | object[] }) {
  const graph = Array.isArray(data) ? data : [data];
  const payload = { '@context': 'https://schema.org', '@graph': graph };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
