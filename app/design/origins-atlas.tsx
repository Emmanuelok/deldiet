import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Compass, Globe2, LocateFixed, Plus } from "lucide-react";

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

type Camera = { latitude: number; longitude: number };

const regions = {
  Africa: { image: "africa", latitude: 12, longitude: 24 },
  Americas: { image: "americas", latitude: 5, longitude: -68 },
  "Asia Pacific": { image: "asia-pacific", latitude: 7, longitude: 122 },
};

// Natural Earth HYP_50M_SR_W, OB_50M, and Admin 0 (public domain): naturalearthdata.com.
// The marker identifies a country and does not claim to locate a farm.
const countryLocations: Record<string, [number, number]> = {
  ET: [39.0886, 8.0328], KE: [37.9076, 0.5490], RW: [30.1039, -1.8972],
  CO: [-73.1743, 3.3731], BR: [-49.5595, -12.0987], CR: [-84.0779, 10.0651],
  ID: [101.8929, -0.9544], PG: [143.9102, -5.6953],
};

function marker(origin: AtlasOrigin, camera: Camera): CSSProperties {
  const point = countryLocations[origin.code];
  if (!point) return { opacity: 0 };
  const radians = Math.PI / 180;
  const lat = point[1] * radians;
  const tilt = camera.latitude * radians;
  const delta = (point[0] - camera.longitude) * radians;
  const x = Math.cos(lat) * Math.sin(delta);
  const y = Math.cos(tilt) * Math.sin(lat) - Math.sin(tilt) * Math.cos(lat) * Math.cos(delta);
  const z = Math.sin(tilt) * Math.sin(lat) + Math.cos(tilt) * Math.cos(lat) * Math.cos(delta);
  return { left: `${50 + 50 * x}%`, top: `${50 - 50 * y}%`, opacity: z > 0.06 ? 1 : 0 };
}

const vertexSource = `
  attribute vec2 a_vertex;
  varying vec2 point;
  void main() {
    point = a_vertex;
    gl_Position = vec4(a_vertex, 0.0, 1.0);
  }`;

const fragmentSource = `
  precision highp float;
  varying vec2 point;
  uniform sampler2D relief;
  uniform vec2 camera;
  uniform float edge;
  const float pi = 3.14159265;
  void main() {
    float radius = length(point);
    if (radius >= 1.0) discard;
    float z = sqrt(1.0 - radius * radius);
    float lat = asin(clamp(point.y * cos(camera.y) + z * sin(camera.y), -1.0, 1.0));
    float lon = camera.x + atan(point.x, z * cos(camera.y) - point.y * sin(camera.y));
    vec2 uv = vec2(fract(lon / (2.0 * pi) + .5), .5 - lat / pi);
    vec3 colour = texture2D(relief, uv).rgb;
    float sunlight = .28 + .85 * max(dot(vec3(point,z), vec3(.48,.63,.60)), 0.0);
    vec3 haze = vec3(.129,.290,.353) * pow(1.0-z, 4.0);
    gl_FragColor = vec4(colour * sunlight + haze, smoothstep(0.0, edge, 1.0-radius));
  }`;

function makeGlobeRenderer(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false, depth: false });
  if (!gl) return;
  const program = gl.createProgram();
  if (!program) return;
  const shaders: WebGLShader[] = [];
  for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
    const shader = gl.createShader(type);
    if (!shader) continue;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
    shaders.push(shader);
  }
  gl.linkProgram(program);
  for (const shader of shaders) gl.deleteShader(shader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); return; }
  const buffer = gl.createBuffer();
  const texture = gl.createTexture();
  if (!buffer || !texture) {
    gl.deleteBuffer(buffer); gl.deleteTexture(texture); gl.deleteProgram(program); return;
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const vertex = gl.getAttribLocation(program, "a_vertex");
  gl.enableVertexAttribArray(vertex);
  gl.vertexAttribPointer(vertex, 2, gl.FLOAT, false, 0, 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const cameraUniform = gl.getUniformLocation(program, "camera");
  const edgeUniform = gl.getUniformLocation(program, "edge");
  return {
    load(image: HTMLImageElement) {
      if (image.naturalWidth > gl.getParameter(gl.MAX_TEXTURE_SIZE)) return false;
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      return gl.getError() === gl.NO_ERROR;
    },
    render(camera: Camera) {
      const width = Math.max(1, Math.round(canvas.clientWidth * Math.min(1.65, window.devicePixelRatio || 1)));
      if (canvas.width !== width || canvas.height !== width) { canvas.width = width; canvas.height = width; }
      gl.viewport(0, 0, width, width);
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(cameraUniform, camera.longitude * Math.PI / 180, camera.latitude * Math.PI / 180);
      gl.uniform1f(edgeUniform, 2 / width);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() { gl.deleteBuffer(buffer); gl.deleteTexture(texture); gl.deleteProgram(program); },
  };
}

// A software projection keeps the same controls available when a browser disables WebGL.
// Longitude dragging reuses the cached projection and only advances the texture sampling.
function makeSoftwareGlobe(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const textureWidth = 2048;
  const textureHeight = textureWidth / 2;
  let texture: ImageData | undefined;
  let frame: ImageData | undefined;
  let tilt = NaN;
  let offsets = new Int32Array(0);
  let lighting = new Float32Array(0);
  let haze = new Float32Array(0);

  return {
    load(image: HTMLImageElement) {
      const source = document.createElement("canvas");
      source.width = textureWidth;
      source.height = textureHeight;
      const brush = source.getContext("2d", { willReadFrequently: true });
      if (!brush) return false;
      brush.drawImage(image, 0, 0, textureWidth, textureHeight);
      texture = brush.getImageData(0, 0, textureWidth, textureHeight);
      return true;
    },
    render(camera: Camera) {
      if (!texture) return;
      const width = Math.max(1, Math.min(600, Math.round(canvas.clientWidth * 1.15)));
      if (frame?.width !== width) {
        canvas.width = canvas.height = width;
        frame = context.createImageData(width, width);
        offsets = new Int32Array(width * width);
        lighting = new Float32Array(width * width);
        haze = new Float32Array(width * width);
        tilt = NaN;
      }
      if (tilt !== camera.latitude) {
        tilt = camera.latitude;
        const sine = Math.sin(tilt * Math.PI / 180);
        const cosine = Math.cos(tilt * Math.PI / 180);
        for (let row = 0; row < width; row++) {
          const y = 1 - (row + .5) * 2 / width;
          for (let column = 0; column < width; column++) {
            const index = row * width + column;
            const x = (column + .5) * 2 / width - 1;
            const radius = x * x + y * y;
            if (radius >= 1) { offsets[index] = -1; continue; }
            const z = Math.sqrt(1 - radius);
            const latitude = Math.asin(Math.min(1, Math.max(-1, y * cosine + z * sine)));
            const longitude = Math.atan2(x, z * cosine - y * sine);
            const u = Math.floor((longitude / (2 * Math.PI) + .5) * textureWidth);
            const v = Math.min(textureHeight-1, Math.floor((.5-latitude / Math.PI)*textureHeight));
            offsets[index] = v * textureWidth + (u & (textureWidth-1));
            lighting[index] = .28 + .85 * Math.max(0, .48*x + .63*y + .60*z);
            haze[index] = (1-z)**4;
            frame.data[index*4+3] = Math.min(255, (1-Math.sqrt(radius))*width*128);
          }
        }
      }
      const rotation = Math.round(camera.longitude / 360 * textureWidth);
      for (let index = 0; index < offsets.length; index++) {
        const base = offsets[index];
        if (base < 0) continue;
        const sample = ((base & ~(textureWidth-1)) + ((base+rotation) & (textureWidth-1))) * 4;
        const pixel = index * 4;
        const lit = lighting[index];
        const rim = haze[index];
        frame.data[pixel] = texture.data[sample] * lit + 33 * rim;
        frame.data[pixel+1] = texture.data[sample+1] * lit + 74 * rim;
        frame.data[pixel+2] = texture.data[sample+2] * lit + 90 * rim;
      }
      context.putImageData(frame, 0, 0);
    },
    dispose() { texture = undefined; frame = undefined; },
  };
}

function ReliefGlobe({ selected }: { selected: AtlasOrigin }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pin = useRef<HTMLSpanElement>(null);
  const model = useRef({ origin: selected, camera: { ...regions[selected.continent] } as Camera });
  const render = useRef<(() => void) | undefined>(undefined);
  const animation = useRef(0);
  const drag = useRef<{ x: number; longitude: number } | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [moving, setMoving] = useState(false);
  const geographic = regions[selected.continent];

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const renderer = makeGlobeRenderer(element) ?? makeSoftwareGlobe(element);
    if (!renderer) return;
    let live = true;
    const texture = new window.Image();
    let observer: ResizeObserver | undefined;
    texture.onload = () => {
      if (!live || !renderer.load(texture)) return;
      render.current = () => {
        renderer.render(model.current.camera);
        if (pin.current) Object.assign(pin.current.style, marker(model.current.origin, model.current.camera));
      };
      render.current();
      setReady(true);
      observer = new ResizeObserver(() => render.current?.());
      observer.observe(element);
    };
    function lost(event: Event) {
      live = false;
      event.preventDefault();
      render.current = undefined;
      window.cancelAnimationFrame(animation.current);
      setReady(false);
      setMoving(false);
      if (pin.current) Object.assign(pin.current.style, marker(model.current.origin, regions[model.current.origin.continent]));
    }
    element.addEventListener("webglcontextlost", lost);
    texture.src = "/atlas/earth-relief.webp";
    return () => {
      live = false;
      texture.onload = null;
      element.removeEventListener("webglcontextlost", lost);
      window.cancelAnimationFrame(animation.current);
      observer?.disconnect();
      render.current = undefined;
      renderer.dispose();
    };
  }, []);

  const center = useCallback((destination: Camera) => {
    window.cancelAnimationFrame(animation.current);
    const from = model.current.camera;
    const longitudeDelta = ((destination.longitude - from.longitude + 540) % 360 + 360) % 360 - 180;
    const start = performance.now();
    const immediate = !render.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function update(now: number) {
      const fraction = immediate ? 1 : Math.min(1, (now-start)/760);
      const eased = fraction * fraction * (3-2*fraction);
      model.current.camera = { latitude: from.latitude+(destination.latitude-from.latitude)*eased, longitude: from.longitude+longitudeDelta*eased };
      render.current?.();
      if (fraction < 1) animation.current = window.requestAnimationFrame(update);
    }
    update(start);
  }, []);

  useEffect(() => {
    model.current.origin = selected;
    center(regions[selected.continent]);
  }, [selected, center]);

  function pointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (!ready || !event.isPrimary || event.button !== 0) return;
    window.cancelAnimationFrame(animation.current);
    drag.current = { x: event.clientX, longitude: model.current.camera.longitude };
    event.currentTarget.setPointerCapture(event.pointerId);
    setMoving(true);
  }

  function pointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!drag.current) return;
    model.current.camera = { ...model.current.camera, longitude: drag.current.longitude + (drag.current.x-event.clientX)*180/Math.max(1,event.currentTarget.clientWidth) };
    render.current?.();
  }

  function endDrag() {
    drag.current = undefined;
    setMoving(false);
  }

  function handleMapKey(event: KeyboardEvent<HTMLCanvasElement>) {
    if (!ready) return;
    if (event.key === "Home") {
      event.preventDefault();
      center(geographic);
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const { latitude, longitude } = model.current.camera;
    center({ latitude, longitude: longitude + (event.key === "ArrowLeft" ? -15 : 15) });
  }

  return <figure className={moving ? "at-planet moving" : "at-planet"} aria-label={`Physical globe highlighting ${selected.country}`}>
    <div className="at-orb">
      <Image className="at-still" src={`/atlas/${geographic.image}.webp`} width={830} height={830} alt="" priority unoptimized />
      <canvas ref={canvas} className={ready ? "at-textured ready" : "at-textured"}
        aria-hidden={ready ? undefined : true} tabIndex={ready ? 0 : undefined}
        aria-label="Rotate the globe with the left and right arrow keys. Press Home to recenter."
        onKeyDown={handleMapKey} onPointerDown={pointerDown} onPointerMove={pointerMove}
        onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} />
      <span ref={pin} className="at-map-pin" style={marker(selected,geographic)} aria-hidden="true"><i/><b>{selected.code}</b></span>
    </div>
    {ready && <div className="at-map-help"><span>Drag to rotate</span><button type="button" aria-label={`Recenter globe on ${selected.country}`} onClick={()=>center(geographic)}><LocateFixed size={17} aria-hidden="true"/> Recenter</button></div>}
  </figure>;
}

type AtlasProps = {
  origins: AtlasOrigin[]; visible: AtlasOrigin[]; selected: AtlasOrigin; region: string;
  onSelect: (origin: AtlasOrigin) => void; onRegion: (region: string) => void;
  onAdd: (origin: AtlasOrigin) => void; onTrace: () => void;
};

export function OriginAtlas({ origins, visible, selected, region, onSelect, onRegion, onAdd, onTrace }: AtlasProps) {
  useEffect(() => {
    function readLocation() {
      const id = new URLSearchParams(window.location.search).get("origin");
      const profile = origins.find((origin) => origin.id === id);
      if (profile) { onRegion("All origins"); onSelect(profile); }
    }
    const frame = window.requestAnimationFrame(readLocation);
    window.addEventListener("popstate", readLocation);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("popstate", readLocation); };
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
  function step(direction: number) {
    const index = visible.findIndex((origin) => origin.id === selected.id);
    select(visible[(index + direction + visible.length) % visible.length]);
  }
  const currentIndex = visible.findIndex((origin) => origin.id === selected.id)+1;

  return <div className="at-atlas" id="origins">
    <article className="at-instrument" id="origin-profile" aria-labelledby="at-country">
      <div className="at-canvas">
        <header className="at-toolbar">
          <h1><Globe2 aria-hidden="true" size={24}/> Origin atlas</h1>
          <div className="at-pickers">
            <label><span>Region</span><select value={region} aria-label="Filter by region" onChange={event=>changeRegion(event.target.value)}>
              {["All origins",...Object.keys(regions)].map(item=><option key={item}>{item}</option>)}
            </select><ChevronDown size={15} aria-hidden="true"/></label>
            <label><span>Country</span><select value={selected.id} aria-label="Choose a country" onChange={event=>{const chosen=visible.find(item=>item.id===event.target.value);if(chosen) select(chosen);}}>
              {visible.map(item=><option key={item.id} value={item.id}>{item.country}</option>)}
            </select><ChevronDown size={15} aria-hidden="true"/></label>
          </div>
        </header>

        <div className="at-stage">
          <ReliefGlobe selected={selected}/>
          <div className="at-story">
            <p className="at-coordinate"><Compass size={17} aria-hidden="true"/> {selected.continent} <span/> {selected.code}</p>
            <h2 id="at-country" className={selected.country.length>12?"at-country long":"at-country"}>{selected.country}</h2>
            <p className="at-region">{selected.region}</p>
            <div className="at-notes"><span>Tasting notes</span><p>{selected.notes.map(note=><b key={note}>{note}</b>)}</p></div>
            <div className="at-actions">
              <a href={`/build-a-cup?origin=${selected.id}`}>Brew this origin <ArrowRight size={19} aria-hidden="true"/></a>
              <button onClick={()=>onAdd(selected)} type="button" aria-label={`Add 340 g of ${selected.country} whole bean to bag for $${selected.price}`}>340 g · ${selected.price} CAD <Plus size={18} aria-hidden="true"/></button>
            </div>
          </div>
        </div>
        <div className="at-navigation">
          <span className="at-count"><strong>{String(currentIndex).padStart(2,"0")}</strong><i/> {String(visible.length).padStart(2,"0")} <span>origins</span></span>
          <div className="at-origin-index" role="group" aria-label="Browse origin profiles">{visible.map(origin=><button aria-label={origin.country} aria-pressed={origin.id===selected.id} type="button" key={origin.id} onClick={()=>select(origin)}>{origin.code}</button>)}</div>
          <div className="at-arrows"><button type="button" aria-label="Previous origin" onClick={()=>step(-1)}><ArrowLeft size={18} aria-hidden="true"/></button><button type="button" aria-label="Next origin" onClick={()=>step(1)}><ArrowRight size={18} aria-hidden="true"/></button></div>
        </div>
      </div>
      <section className="at-specs" aria-label={`${selected.country} coffee profile`}>
        <dl><div><dt>Roast profile</dt><dd>{selected.roast}</dd></div><div><dt>Process</dt><dd>{selected.process}</dd></div>
          <div><dt>Growing elevation</dt><dd>{selected.elevation}</dd></div><div><dt>Producer profile</dt><dd>{selected.producer}</dd></div></dl>
      </section>
    </article>
    <section className="at-trace" aria-labelledby="at-trace-title">
      <Image src="/atlas/coffee-lots.webp" alt="Green coffee beans in open sample sacks" width={768} height={512} unoptimized />
      <div><p>From the archive</p><h2 id="at-trace-title">Inside a coffee lot.</h2><span>Follow a sample Guji record from growing region to processing method and roast.</span><button type="button" onClick={onTrace}>Open the sample record <ArrowUpRight size={18} aria-hidden="true"/></button></div>
    </section>
  </div>;
}
