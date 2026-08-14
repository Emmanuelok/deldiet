import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";

export const metadata: Metadata = { title: "Coffee Events — Deldiet", description: "Explore planned Deldiet cuppings, brew classes and producer conversations." };
export default function EventsPage() { return <DeldietExperience view="events" />; }
