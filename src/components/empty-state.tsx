export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="panel empty-state">
      <p className="eyebrow">Awaiting data</p>
      <h3>{title}</h3>
      <p className="muted">{description}</p>
    </section>
  );
}
