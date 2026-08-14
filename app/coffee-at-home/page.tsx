import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";

export const metadata: Metadata = { title: "Coffee at Home — Deldiet", description: "Match Deldiet coffee formats and grinds to the equipment you actually use." };
export default function CoffeeAtHomePage() { return <DeldietExperience view="formats" />; }
