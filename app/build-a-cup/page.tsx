import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";

export const metadata: Metadata = { title: "Build a Cup — Deldiet", description: "Create a Deldiet Brewprint from origin, drink, milk, finish and serve." };
export default function BuildACupPage() { return <DeldietExperience view="build" />; }
