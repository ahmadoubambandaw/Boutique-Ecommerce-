import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MOCK_POSTS } from "@/lib/mock/blog";
import { PageHero } from "@/components/ui/page-hero";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Conseils sécurité, guides EPI et prévention incendie par GSE.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const [featured, ...rest] = MOCK_POSTS;

  return (
    <>
      <PageHero eyebrow="Journal" title="Le Blog" />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {featured && (
          <Reveal>
            <Link
              href={`/blog/${featured.slug}`}
              className="group mb-12 grid gap-6 overflow-hidden rounded-3xl border border-[hsl(var(--border))] lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-8">
                <Badge variant="muted" className="w-fit">{featured.tag}</Badge>
                <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-[hsl(var(--muted-foreground))]">
                  {featured.excerpt}
                </p>
                <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
                  {featured.author} · {featured.readingTime} de lecture
                </p>
              </div>
            </Link>
          </Reveal>
        )}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <Reveal key={post.slug} index={i}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <Badge variant="muted" className="mt-4">{post.tag}</Badge>
                <h3 className="mt-2 text-lg font-semibold">{post.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-[hsl(var(--muted-foreground))]">
                  {post.excerpt}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
