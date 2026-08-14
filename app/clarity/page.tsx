import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";

export const metadata: Metadata = { title: "Clarity — Deldiet", description: "Explore Deldiet's caffeine-free Clarity ritual concept and ingredient direction." };
export default function ClarityPage() { return <DeldietExperience view="clarity" />; }
