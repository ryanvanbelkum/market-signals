function buildMapBounds(lat: number, lng: number) {
  const latDelta = 0.012;
  const lngDelta = 0.018;

  return {
    west: lng - lngDelta,
    south: lat - latDelta,
    east: lng + lngDelta,
    north: lat + latDelta,
  };
}

export function SignalLocationMap({
  addressLine,
  city,
  state,
  postalCode,
  lat,
  lng,
  neighborhood,
}: {
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  lat: number;
  lng: number;
  neighborhood: string;
}) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return (
      <article className="panel location-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Location</p>
            <h3>Map unavailable</h3>
          </div>
        </div>
        <p className="muted">
          This signal does not have valid coordinates yet, so the map cannot be
          rendered.
        </p>
      </article>
    );
  }

  const bounds = buildMapBounds(lat, lng);
  const mapUrl = new URL("https://www.openstreetmap.org/export/embed.html");
  mapUrl.searchParams.set(
    "bbox",
    `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
  );
  mapUrl.searchParams.set("layer", "mapnik");
  mapUrl.searchParams.set("marker", `${lat},${lng}`);

  const openMapUrl = new URL("https://www.openstreetmap.org/");
  openMapUrl.searchParams.set("mlat", String(lat));
  openMapUrl.searchParams.set("mlon", String(lng));
  openMapUrl.hash = `map=16/${lat}/${lng}`;

  return (
    <article className="panel location-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Location</p>
          <h3>Signal footprint</h3>
        </div>
        <a href={openMapUrl.toString()} target="_blank" rel="noreferrer">
          Open map
        </a>
      </div>

      <div className="location-map-frame">
        <iframe
          title={`Map for ${addressLine}, ${city}`}
          src={mapUrl.toString()}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="location-summary">
        <div>
          <span className="location-label">Address</span>
          <strong>
            {addressLine}, {city}, {state} {postalCode}
          </strong>
        </div>
        <div>
          <span className="location-label">Neighborhood</span>
          <strong>{neighborhood}</strong>
        </div>
        <div>
          <span className="location-label">Coordinates</span>
          <strong>
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </strong>
        </div>
      </div>
    </article>
  );
}
