"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight, Maximize, Pause, Play, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./cinema.css";

const scenes = [
  {
    short: "The pour", label: "At the bar", title: "The world", emphasis: "in your cup.",
    copy: "Choose an origin, find your favourite brew and make it your own.",
    href: "/build-a-cup", action: "Build your cup", alternate: "/coffeehouse", alternateTitle: "Coffeehouse menu",
    image: "/deldiet-hero-motion-poster.webp", thumb: "/editorial/scene-pour-thumb.webp",
    tone: "#ffc583", focus: "65% 55%"
  },
  {
    short: "The coffeehouse", label: "St. John’s, Newfoundland", title: "A seat", emphasis: "at the bar.",
    copy: "From flat whites to pour-over flights, explore the menu for our St. John’s coffeehouse concept.",
    href: "/coffeehouse", action: "Step inside", alternate: "/events", alternateTitle: "Tastings & events",
    image: "/editorial/coffeehouse-interior.webp", thumb: "/editorial/scene-room-thumb.webp",
    tone: "#f5b46c", focus: "67% 52%"
  },
  {
    short: "The origins", label: "The origin atlas", title: "Where flavour", emphasis: "takes root.",
    copy: "Travel through eight coffee origins. Explore the region, process and tasting notes behind each profile.",
    href: "/origins", action: "Open the atlas", alternate: "/tasteprint", alternateTitle: "Find my Tasteprint",
    image: "/editorial/scene-origins.webp", thumb: "/editorial/scene-origins-thumb.webp",
    tone: "#c2dc94", focus: "68% 50%"
  },
  {
    short: "Your kitchen", label: "Coffee at home", title: "A ritual", emphasis: "of your own.",
    copy: "Find the format that fits your equipment, from whole beans and filter bags to capsules and cold brew.",
    href: "/coffee-at-home", action: "Match my brewer", alternate: "/shop", alternateTitle: "Browse the shop",
    image: "/editorial/scene-home.webp", thumb: "/editorial/scene-home-thumb.webp",
    tone: "#9bd7f3", focus: "70% 50%"
  }
] as const;

function FilmSources() {
  return <>
    <source media="(max-width: 640px)" src="/deldiet-hero-motion-mobile.mp4" type="video/mp4" />
    <source src="/deldiet-hero-motion.mp4" type="video/mp4" />
  </>;
}

function formatTime(seconds: number) {
  return '0:' + String(Math.floor(seconds || 0)).padStart(2, "0");
}

export default function Cinema() {
  const [sceneIndex, select] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState("");
  const [immersive, setImmersive] = useState(false);
  const player = useRef<HTMLVideoElement>(null);
  const filmDialog = useRef<HTMLDialogElement>(null);
  const fullFilm = useRef<HTMLVideoElement>(null);
  const shouldPlay = useRef(true);
  const panel = useRef<HTMLElement>(null);
  const timeDisplay = useRef<HTMLTimeElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const scene = scenes[sceneIndex];

  useEffect(() => {
    const video = player.current;
    const area = panel.current;
    if (!video || !area) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    const sync = () => {
      if (sceneIndex === 0 && !immersive && shouldPlay.current && !reduced.matches && !document.hidden && visible) {
        void video.play().catch(() => setPlaying(false));
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(area);
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, [sceneIndex, immersive]);

  function toggleFilm() {
    const video = player.current;
    if (!video) return;
    setNotice("");
    if (video.paused) {
      shouldPlay.current = true;
      void video.play().catch(() => setNotice("This device couldn’t play the film. The still image and all destinations are available."));
    } else {
      shouldPlay.current = false;
      video.pause();
    }
  }

  function updateProgress() {
    const video = player.current;
    if (!video || !Number.isFinite(video.duration) || !video.duration) return;
    if (timeDisplay.current) timeDisplay.current.textContent = formatTime(video.currentTime);
    if (progress.current) progress.current.style.transform = `scaleX(${video.currentTime / video.duration})`;
  }

  function openFilm() {
    const dialog = filmDialog.current;
    if (!dialog) return;
    player.current?.pause();
    setImmersive(true);
    dialog.showModal();
    const video = fullFilm.current;
    if (video) {
      video.currentTime = player.current?.currentTime || 0;
      void video.play().catch(() => { /* Native video controls remain available. */ });
    }
  }

  return <section className="dc-cinema" ref={panel} aria-labelledby="hero-title" style={{"--scene-color":scene.tone} as CSSProperties}>
    <div className="dc-screen" id="cinema-scene">
      <video ref={player} className="dc-film" muted playsInline loop preload="metadata" poster="/deldiet-hero-motion-poster.webp" aria-hidden="true" onTimeUpdate={updateProgress} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}>
        <FilmSources/>
      </video>
      {sceneIndex !== 0 && <div className="dc-still" key={scene.image}>
        <Image src={scene.image} alt="" fill priority unoptimized sizes="100vw" style={{objectPosition:scene.focus}} />
      </div>}
      <div className="dc-shade" aria-hidden="true"/>
      <div className="dc-scene-body">
        <div className="dc-copy" key={scene.short}>
          <p className="dc-location"><span aria-hidden="true"/>{scene.label}</p>
          <h1 id="hero-title">{scene.title} <em>{scene.emphasis}</em></h1>
          <p className="dc-deck">{scene.copy}</p>
          <div className="dc-cta">
            <a className="dc-enter" href={scene.href}>{scene.action} <ArrowUpRight size={18} aria-hidden="true"/></a>
            <a className="dc-alt" href={scene.alternate}>{scene.alternateTitle}</a>
          </div>
        </div>
      </div>
      <div className="dc-frame-controls">
        <a className="dc-down" href="#tasting-counter"><ArrowDown size={16} aria-hidden="true"/> The tasting counter</a>
        {sceneIndex === 0 && <div className="dc-film-tools">
          <button type="button" aria-label={playing ? "Pause the coffee film" : "Play the coffee film"} onClick={toggleFilm}>{playing ? <Pause size={15}/> : <Play size={15}/>}</button>
          <span className="dc-time" aria-hidden="true"><time ref={timeDisplay}>0:00</time><span className="dc-progress"><span ref={progress}/></span>0:08</span>
          <button className="dc-expand" type="button" aria-label="Expand the coffee film" onClick={openFilm}><Maximize size={16}/></button>
        </div>}
      </div>
      {notice && <p className="dc-film-notice" role="status">{notice}</p>}
    </div>
    <div className="dc-scenes" role="group" aria-label="Explore Deldiet scenes">
      {scenes.map((item, index) => <button key={item.short} type="button" aria-pressed={index===sceneIndex} aria-controls="cinema-scene" onClick={() => { select(index); setNotice(""); }}>
        <Image src={item.thumb} alt="" width={154} height={90} unoptimized />
        <span className="dc-scene-title">{item.short}</span>
        <span className="dc-scene-pip" aria-hidden="true"/>
      </button>)}
    </div>
    <dialog ref={filmDialog} className="dc-theatre" onClose={() => {fullFilm.current?.pause();setImmersive(false);}}>
      <div className="dc-theatre-bar"><span>The pour · Deldiet Coffee</span><button type="button" aria-label="Close film" onClick={() => filmDialog.current?.close()}><X size={20}/></button></div>
      <video ref={fullFilm} muted controls playsInline loop preload="none" poster="/deldiet-hero-motion-poster.webp" aria-label="Deldiet pour-over brewing film"><FilmSources/></video>
    </dialog>
  </section>;
}
