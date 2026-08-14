import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";

export const metadata: Metadata = { title: "Discover Deldiet", description: "Choose the shortest path into Deldiet: taste, coffeehouse, home brewing or trade." };
export default function DiscoverPage() { return <DeldietExperience view="discover" />; }
