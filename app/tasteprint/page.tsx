import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";

export const metadata: Metadata = { title: "Tasteprint — Deldiet", description: "Find a transparent coffee starting point from flavour, mood and brew method." };
export default function TasteprintPage() { return <DeldietExperience view="tasteprint" />; }
