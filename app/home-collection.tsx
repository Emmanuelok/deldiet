"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight, Plus, Coffee, Sun, Sparkles, Moon, BookOpen } from "lucide-react";

type FeaturedProduct = { id: string; name: string; description: string; price: number; category: string };
type Props = { products: FeaturedProduct[]; images: Record<string, string>; onOpenProduct: (id: string) => void };

const rituals = [
  { id: "house-01", label: "The everyday", icon: Sun, title: "Your morning,\nmade better.", note: "Chocolate-forward. Comfortably familiar. The blend you reach for before the rest of the world wakes up.", flavour: ["Chocolate", "Rounded", "Comforting"], brew: "Espresso · with or without milk", number: "01", tone: "everyday" },
  { id: "guji-reserve", label: "The curious", icon: Sparkles, title: "A little out\nof the ordinary.", note: "A bright, floral Ethiopian coffee for the mornings you have time to take the scenic route.", flavour: ["Jasmine", "Bergamot", "Peach"], brew: "Pour-over · take your time", number: "02", tone: "curious" },
  { id: "huila-decaf", label: "The slow-down", icon: Moon, title: "All the ritual.\nA softer landing.", note: "Caramel sweetness and red berries. A sugarcane decaf for a long conversation or one more chapter.", flavour: ["Caramel", "Red berries", "Decaf"], brew: "Filter · an unhurried moment", number: "03", tone: "slow" },
];
const essentials = ["home-kit", "stoneware-mug", "field-tumbler", "deldiet-dripper"];

export default function HomeCollection({ products, images, onOpenProduct }: Props) {
  const [ritualIndex, setRitualIndex] = useState(0);
  const ritual = rituals[ritualIndex];
  const coffee = products.find(product => product.id === ritual.id)!;
  return <>
    <nav className="edit-shortcuts" aria-label="Find your Deldiet experience">
      <Link href="#daily-edit"><span>01 / FOR YOUR EVERYDAY</span><b>Find your coffee <ArrowUpRight /></b></Link>
      <Link href="/origin-bar"><span>02 / A CUP, YOUR WAY</span><b>Make it personal <ArrowUpRight /></b></Link>
      <Link href="/brew-lab"><span>03 / A BETTER BREW</span><b>Master the ritual <ArrowUpRight /></b></Link>
    </nav>

    <section className="edit-introduction" aria-labelledby="edit-intro-title">
      <span className="edit-kicker"><span className="edit-asterisk" aria-hidden="true">✳</span> A GOOD DAY STARTS HERE</span>
      <h2 id="edit-intro-title">More than a cup.<br/>A little <em>life upgrade.</em></h2>
      <p>Coffee worth slowing down for. Objects you’ll love to live with. A place to find your people. Welcome to the Deldiet way of doing the everyday.</p>
    </section>

    <section className={`edit-ritual edit-ritual-${ritual.tone}`} id="daily-edit" aria-labelledby="daily-edit-title">
      <div className="edit-ritual-top"><p className="edit-kicker">THE DAILY EDIT</p><div className="edit-ritual-choices" role="group" aria-label="Choose your coffee mood">{rituals.map((item, index) => <button key={item.id} type="button" aria-pressed={ritualIndex === index} onClick={() => setRitualIndex(index)}><item.icon size={16}/>{item.label}</button>)}</div></div>
      <div className="edit-ritual-stage">
        <div className="edit-ritual-copy"><span className="edit-edition">COFFEE / {ritual.number}</span><h2 id="daily-edit-title">{ritual.title.split("\n").map((line, index) => <span key={line}>{index === 1 ? <em>{line}</em> : line}</span>)}</h2><p>{ritual.note}</p><div className="edit-flavours">{ritual.flavour.map(note => <span key={note}>{note}</span>)}</div><button type="button" className="button edit-button-dark" onClick={() => onOpenProduct(coffee.id)}>Explore {coffee.name}<ArrowUpRight size={20}/></button><Link href="/tasteprint" className="edit-text-link">Want a closer match? Find your Tasteprint <ArrowRight size={16}/></Link></div>
        <div className="edit-ritual-product"><span className="edit-product-number" aria-hidden="true">{ritual.number}</span><div className="edit-product-frame" key={coffee.id}><Image src={images[coffee.id]} alt={`${coffee.name} coffee bag`} fill unoptimized sizes="(max-width: 760px) 90vw, 43vw"/></div><div className="edit-coffee-label" aria-live="polite"><span><b>{coffee.name}</b><small>{ritual.brew}</small></span><button type="button" onClick={() => onOpenProduct(coffee.id)} aria-label={`View ${coffee.name}, from ${coffee.price} Canadian dollars`}><span>From ${coffee.price}</span><Plus size={20}/></button></div></div>
      </div>
      <p className="edit-catalogue-note">Explore the concept collection. Prices in CAD; availability and fulfilment confirmed before purchase.</p>
    </section>

    <section className="edit-essentials" aria-labelledby="essentials-title">
      <div className="edit-section-heading"><div><p className="edit-kicker">CONSIDERED OBJECTS. DAILY JOY.</p><h2 id="essentials-title">Keep good <em>company.</em></h2></div><Link href="/shop" className="edit-text-link">Explore the collection<ArrowUpRight size={20}/></Link></div>
      <div className="edit-products">{essentials.map(id => { const product = products.find(item => item.id === id)!; return <article key={id}><button type="button" className="edit-object-image" onClick={() => onOpenProduct(id)} aria-label={`Explore ${product.name}`}><Image src={images[id]} alt={product.name} fill unoptimized sizes="(max-width: 600px) 75vw, (max-width: 1000px) 45vw, 24vw"/><span><Plus size={20}/></span></button><div className="edit-object-info"><span>{product.category}</span><h3><button type="button" onClick={() => onOpenProduct(id)}>{product.name}</button></h3><p>From ${product.price} <small>CAD</small></p></div></article>; })}</div>
    </section>

    <section className="edit-craft" aria-labelledby="craft-title">
      <div className="edit-craft-photo"><Image src="/origin-exchange-brew-gear.png" alt="Coffee brewing equipment arranged on a coffee bar" fill unoptimized sizes="(max-width: 760px) 100vw, 50vw"/><span className="edit-photo-caption">THE BEAUTY IS IN THE DETAILS.</span><div className="edit-recipe-note"><Coffee size={21}/><span>YOUR NEXT GREAT CUP</span><b>20g <i>/</i> 320ml</b><small>A simple pour-over starting point</small><Link href="/brew-lab">Make a recipe<ArrowUpRight size={18}/></Link></div></div>
      <div className="edit-craft-copy"><p className="edit-kicker">THE BREW STUDIO</p><h2 id="craft-title">Good things<br/>take <em>three<br/>minutes.</em></h2><p>A little precision. A little patience. Find your ratio, follow the timer, and keep a journal of the cups worth coming back to.</p><Link className="button edit-button-light" href="/brew-lab">Make your next great cup<ArrowUpRight size={20}/></Link><div className="edit-craft-features"><span>01<span>Choose your brewer</span></span><span>02<span>Find your ratio</span></span><span>03<span>Keep the good ones</span></span></div></div>
    </section>

    <section className="edit-house" aria-labelledby="house-title">
      <div className="edit-house-heading"><p className="edit-kicker">A PLACE TO SLOW DOWN</p><h2 id="house-title">Meet you<br/><em>at Deldiet.</em></h2><p>A familiar face. An unfamiliar favourite. A coffeehouse imagined around the simple pleasure of being here.</p><Link className="edit-text-link" href="/coffeehouse">Discover the coffeehouse<ArrowUpRight size={20}/></Link><span className="edit-location">ST. JOHN’S, NEWFOUNDLAND<br/><small>Opening date and location to be announced</small></span></div><div className="edit-house-image"><Image src="/deldiet-cafe-interior.png" alt="The Deldiet coffeehouse concept with warm light, natural materials and communal seating" fill unoptimized sizes="(max-width: 760px) 100vw, 60vw"/><span>STAY A LITTLE LONGER.</span></div>
    </section>

    <section className="edit-final-grid" aria-label="Keep exploring">
      <Link href="/passport" className="edit-passport"><span className="edit-kicker">A COFFEE LIFE, COLLECTED</span><h2>Make yourself<br/><em>at home.</em></h2><p>Your taste. Your favourites. Your brewing notes. Keep a little world of coffee in your Passport, saved on this device.</p><span className="edit-card-link">Open your Passport<ArrowUpRight size={22}/></span><div className="edit-passport-card" aria-hidden="true"><span>DELDIET / PASSPORT</span><b>Your next<br/>favourite<br/><em>is out there.</em></b><span>THE WORLD IN YOUR CUP <span>✳</span></span></div></Link>
      <Link href="/journal" className="edit-journal"><BookOpen size={26}/><span className="edit-kicker">THE FIELD JOURNAL</span><h2>A little<br/><em>coffee curiosity.</em></h2><p>Practical guides, better questions, and stories for your next coffee break.</p><span className="edit-card-link">Take a little time to read<ArrowUpRight size={22}/></span></Link>
    </section>
  </>;
}
