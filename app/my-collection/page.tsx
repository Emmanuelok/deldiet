import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";
export const metadata: Metadata = { title: "My collection | Deldiet", description: "Your saved coffee favourites, Brewprints, origin records and request references." };
export default function Page() { return <DeldietExperience view="collection"/>; }
