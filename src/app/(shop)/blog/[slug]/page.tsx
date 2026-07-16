import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MOCK_POSTS } from "@/lib/mock/blog";
import { JsonLd } from "@/components/seo/json-ld";

export function generateStaticParams() {
  return MOCK_POSTS.map((p) => ({ slug: p.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = MOCK_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Article introuvable" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, images: [post.image], type: "article" },
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = MOCK_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          image: post.image,
          datePublished: post.date,
          author: { "@type": "Organization", name: post.author },
        }}
      />
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="h-4 w-4" /> Retour au blog
      </Link>
      <p className="mt-8 text-sm uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
        {post.tag}
      </p>
      <h1 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        {post.title}
      </h1>
      <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
        {post.author} ·{" "}
        {new Date(post.date).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        · {post.readingTime} de lecture
      </p>
      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl">
        <Image src={post.image} alt={post.title} fill priority sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
      </div>
      <div className="mt-8 text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">
        <p>{post.content}</p>
      </div>
    </article>
  );
}
