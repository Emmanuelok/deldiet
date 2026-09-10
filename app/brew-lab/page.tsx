import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";
export const metadata: Metadata = { title: "Brew Studio | Deldiet", description: "Your recipe calculator, guided brew timer, taste adjustments and personal brew journal." };
export default function Page() { return <DeldietExperience view="brew-lab"/>; }
