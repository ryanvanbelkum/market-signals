export function MapPanel({
  neighborhoods,
}: {
  neighborhoods: { neighborhood: string; count: number }[];
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h3>Map / list activity</h3>
        <p className="muted">
          A lightweight stand-in for a map, highlighting where signal density is
          clustering right now.
        </p>
      </div>

      <div className="heat-grid">
        {neighborhoods.map((item) => (
          <div key={item.neighborhood} className="heat-cell">
            <span>{item.neighborhood}</span>
            <strong>{item.count} signals</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
