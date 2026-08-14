import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";

export const metadata: Metadata = { title: "Deldiet Coffeehouse", description: "Explore the Deldiet coffeehouse, full menu and visit-planning experience." };
export default function CoffeehousePage() { return <DeldietExperience view="coffeehouse" />; }
