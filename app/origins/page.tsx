import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";

export const metadata: Metadata = { title: "Coffee Origins — Deldiet", description: "Explore Deldiet coffees by country, region, process, elevation and sensory profile." };
export default function OriginsPage() { return <DeldietExperience view="origins" />; }
