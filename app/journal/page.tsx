import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";

export const metadata: Metadata = { title: "Field Journal — Deldiet", description: "Read Deldiet stories about origin, altitude, sensory education and brewing." };
export default function JournalPage() { return <DeldietExperience view="journal" />; }
