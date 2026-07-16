export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-[hsl(var(--border))] py-16 text-center">
      {eyebrow && (
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          {eyebrow}
        </p>
      )}
      <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mx-auto mt-4 max-w-xl text-balance text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
      )}
    </div>
  );
}
