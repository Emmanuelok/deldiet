import Image from "next/image";
import { useEffect, type CSSProperties } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Plus } from "lucide-react";

export type AtlasOrigin = {
  id: string;
  country: string;
  region: string;
  continent: "Africa" | "Americas" | "Asia Pacific";
  code: string;
  notes: string[];
  process: string;
  elevation: string;
  producer: string;
  roast: string;
  price: number;
  accent: string;
};

const globeRegions = {
  Africa: { image: "africa", latitude: 8, longitude: 26 },
  Americas: { image: "americas", latitude: 6, longitude: -70 },
  "Asia Pacific": { image: "asia-pacific", latitude: 1, longitude: 122 },
};

// The orthographic globes and country label points use public-domain Natural Earth
// 1:110m land and Admin 0 country data. Markers identify countries, not individual farms.
const countryLocations: Record<string, [number, number]> = {
  ET: [39.0886, 8.0328], KE: [37.9076, 0.5490], RW: [30.1039, -1.8972],
  CO: [-73.1743, 3.3731], BR: [-49.5595, -12.0987], CR: [-84.0779, 10.0651],
  ID: [101.8929, -0.9544], PG: [143.9102, -5.6953],
};

function globeMarker(origin: AtlasOrigin): CSSProperties | undefined {
  const point = countryLocations[origin.code];
  if (!point) return;
  const globe = globeRegions[origin.continent];
  const rad = Math.PI / 180;
  const lat = point[1] * rad;
  const tilt = globe.latitude * rad;
  const lon = (point[0] - globe.longitude) * rad;
  const x = Math.cos(lat) * Math.sin(lon);
  const y = Math.cos(tilt) * Math.sin(lat) - Math.sin(tilt) * Math.cos(lat) * Math.cos(lon);
  return { left: `${50 + 49.2 * x}%`, top: `${50 - 49.2 * y}%` };
}

type AtlasProps = {
  origins: AtlasOrigin[];
  visible: AtlasOrigin[];
  selected: AtlasOrigin;
  region: string;
  onSelect: (origin: AtlasOrigin) => void;
  onRegion: (region: string) => void;
  onAdd: (origin: AtlasOrigin) => void;
  onTrace: () => void;
};

export function OriginAtlas({ origins, visible, selected, region, onSelect, onRegion, onAdd, onTrace }: AtlasProps) {
  const filters = ["All origins", ...Object.keys(globeRegions)];

  useEffect(() => {
    function readLocation() {
      const id = new URLSearchParams(window.location.search).get("origin");
      const profile = origins.find((origin) => origin.id === id);
      if (profile) {
        onRegion("All origins");
        onSelect(profile);
      }
    }
    const frame = window.requestAnimationFrame(readLocation);
    window.addEventListener("popstate", readLocation);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("popstate", readLocation);
    };
  }, [origins, onSelect, onRegion]);

  function select(profile: AtlasOrigin) {
    onSelect(profile);
    const url = new URL(window.location.href);
    url.searchParams.set("origin", profile.id);
    window.history.replaceState(window.history.state, "", url);
  }

  function changeRegion(next: string) {
    onRegion(next);
    if (next !== "All origins" && selected.continent !== next) {
      const first = origins.find((origin) => origin.continent === next);
      if (first) select(first);
    }
  }

  function turnOrigin(direction: number) {
    const index = visible.findIndex((origin) => origin.id === selected.id);
    const next = (index + direction + visible.length) % visible.length;
    select(visible[next]);
  }

  return (
    <div className="oa-atlas" id="origins">
      <section className="oa-hero" aria-labelledby="oa-title">
        <div className="oa-hero-inner">
          <div className="oa-lead">
            <p className="oa-label"><span className="oa-marker-mini" aria-hidden="true" /> Deldiet field guide</p>
            <h1 id="oa-title">The origin<br /><em>atlas.</em></h1>
            <p className="oa-intro">Jasmine in Guji. Hazelnut in Cerrado. Follow the flavours back to the places that give each coffee its character.</p>
            <a className="oa-main-link" href="#origin-collection">Explore the origins <ArrowDown size={18} aria-hidden="true" /></a>
          </div>
          <div className="oa-globe-panel">
            <div className="oa-globe-field" aria-hidden="true">
              <i className="oa-field-cross oa-nw" /><i className="oa-field-cross oa-ne" />
              <i className="oa-field-cross oa-sw" /><i className="oa-field-cross oa-se" />
              <div className="oa-globe-orbit">
                <div className="oa-globe">
                  <Image key={selected.continent} className="oa-globe-image" src={`/atlas/${globeRegions[selected.continent].image}.webp`} width={760} height={760} unoptimized priority alt="" sizes="(max-width: 740px) 85vw, 36vw" />
                  {countryLocations[selected.code] && <span className="oa-globe-pin" style={globeMarker(selected)} />}
                </div>
              </div>
            </div>
            <div className="oa-globe-nav">
              <div aria-live="polite" aria-atomic="true"><span className="oa-label">On the globe</span><a href="#origin-profile">{selected.country} <ArrowDown size={15} aria-hidden="true" /></a></div>
              <div className="oa-stepper">
                <button type="button" onClick={() => turnOrigin(-1)} aria-label="Previous origin"><ArrowLeft size={20} aria-hidden="true" /></button>
                <button type="button" onClick={() => turnOrigin(1)} aria-label="Next origin"><ArrowRight size={20} aria-hidden="true" /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="oa-collection" id="origin-collection" aria-labelledby="oa-collection-title">
        <div className="oa-collection-heading">
          <div><p className="oa-label">The tasting library</p><h2 id="oa-collection-title">Find your <em>origin.</em></h2></div>
          <p>Choose a country for tasting notes, roast, and the story behind its beans.</p>
        </div>
        <div className="oa-workbench">
          <div className="oa-index">
            <fieldset className="oa-filters"><legend>Filter by region</legend>
              {filters.map((filter) => <button type="button" key={filter} aria-pressed={region === filter} onClick={() => changeRegion(filter)}>{filter}</button>)}
            </fieldset>
            <label className="oa-compact-index"><span>Choose a country</span>
              <select value={selected.id} onChange={(event) => { const profile = visible.find((item) => item.id === event.target.value); if (profile) select(profile); }}>
                {visible.map((item) => <option key={item.id} value={item.id}>{item.country} · {item.region}</option>)}
              </select>
            </label>
            <div className="oa-origin-list" role="group" aria-label="Origin profiles">
              {visible.map((item) => <button key={item.id} type="button" aria-controls="origin-profile" aria-pressed={selected.id === item.id} onClick={() => select(item)}>
                <span className="oa-code" style={{ backgroundColor: item.accent }}>{item.code}</span>
                <span className="oa-list-name"><strong>{item.country}</strong><small>{item.region}</small></span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>)}
            </div>
          </div>
          <article className="oa-profile" id="origin-profile" style={{ "--oa-accent": selected.accent } as CSSProperties} aria-labelledby="oa-profile-title">
            <div className="oa-profile-header">
              <div className="oa-profile-code" aria-hidden="true">{selected.code}</div>
              <p className="oa-label">{selected.continent} / Origin profile</p>
              <h3 id="oa-profile-title">{selected.country}</h3>
              <p className="oa-profile-region">{selected.region}</p>
            </div>
            <div className="oa-profile-body">
              <p className="oa-label">In the cup</p>
              <p className="oa-tasting-notes">{selected.notes.join(" · ")}</p>
              <dl className="oa-data">
                <div><dt>Roast</dt><dd>{selected.roast}</dd></div><div><dt>Process</dt><dd>{selected.process}</dd></div>
                <div><dt>Elevation</dt><dd>{selected.elevation}</dd></div><div><dt>Producer profile</dt><dd>{selected.producer}</dd></div>
              </dl>
              <div className="oa-profile-actions">
                <button type="button" onClick={() => onAdd(selected)} aria-label={`Add 340 g of ${selected.country} whole bean to bag for $${selected.price}`}>Add 340 g · ${selected.price} <Plus size={18} aria-hidden="true" /></button>
                <a href={`/build-a-cup?origin=${selected.id}`}>Build a cup <ArrowRight size={17} aria-hidden="true" /></a>
              </div>
            </div>
          </article>
        </div>

        <div className="oa-trace">
          <Image src="/atlas/coffee-lots.webp" alt="Sacks and samples of green coffee beans" width={768} height={512} sizes="(max-width: 620px) 100vw, 45vw" unoptimized />
          <div><p className="oa-label">Coffee provenance</p><h2>Read a <em>lot record.</em></h2><p>See how a sample Guji record connects a coffee to its origin, processing method and roast history.</p><button type="button" onClick={onTrace}>Open the sample record <ArrowUpRight size={18} aria-hidden="true" /></button></div>
        </div>
      </section>
    </div>
  );
}
