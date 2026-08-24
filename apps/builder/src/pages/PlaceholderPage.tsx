interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold text-ink">{title}</h2>
      <div className="mt-6 flex min-h-[300px] items-center justify-center rounded-md border border-dashed border-border bg-surface">
        <p className="text-sm text-ink-secondary">{title} is coming soon.</p>
      </div>
    </div>
  );
}
