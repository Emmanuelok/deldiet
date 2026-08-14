import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";

export const metadata: Metadata = { title: "Trace a Coffee — Deldiet", description: "Follow the evidence fields that connect a Deldiet lot from producer to cup." };
export default function TracePage() { return <DeldietExperience view="trace" />; }
