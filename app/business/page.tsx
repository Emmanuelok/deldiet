import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";

export const metadata: Metadata = { title: "Deldiet for Business", description: "Explore Deldiet coffee programmes for hospitality, workplaces, events and private label." };
export default function BusinessPage() { return <DeldietExperience view="business" />; }
