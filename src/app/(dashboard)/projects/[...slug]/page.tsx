import { SlugResolver } from "./slug-resolver";

export function generateStaticParams() {
  // All slugs are resolved client-side; emit a single catch-all placeholder
  // so Next.js static export produces the [...slug]/index.html fallback
  return [{ slug: ["_"] }];
}

export default function ProjectSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  return <SlugResolver params={params} />;
}
