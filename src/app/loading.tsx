export default function Loading() {
  return (
    <main className="content">
      <header className="page-header">
        <div className="page-header-copy">
          <p className="eyebrow">Navigation</p>
          <h2>Loading</h2>
          <p className="page-description">
            Preparing the next route.
          </p>
        </div>
      </header>

      <section className="hero panel loading-panel">
        <div className="loading-line loading-line-wide" />
        <div className="loading-line loading-line-mid" />
        <div className="loading-chip-row">
          <span className="loading-chip" />
          <span className="loading-chip" />
          <span className="loading-chip" />
        </div>
      </section>

      <section className="signal-list">
        {Array.from({ length: 3 }).map((_, index) => (
          <article key={index} className="signal-card loading-panel">
            <div className="loading-chip-row">
              <span className="loading-chip" />
              <span className="loading-chip" />
              <span className="loading-chip" />
            </div>
            <div className="loading-line loading-line-wide" />
            <div className="loading-line loading-line-mid" />
            <div className="loading-line loading-line-short" />
          </article>
        ))}
      </section>
    </main>
  );
}
