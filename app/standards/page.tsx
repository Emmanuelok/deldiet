import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";

export const metadata: Metadata = { title: "Platform Standards — Deldiet", description: "See what is live, verified, estimated and planned across the Deldiet platform." };
export default function StandardsPage() { return <DeldietExperience view="standards" />; }
