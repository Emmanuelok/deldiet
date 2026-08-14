import type { Metadata } from "next";
import DeldietExperience from "../deldiet-experience";

export const metadata: Metadata = { title: "Shop Deldiet", description: "Shop Deldiet coffee, drinkware, brew gear, apparel, field objects and gifts." };
export default function ShopPage() { return <DeldietExperience view="shop" />; }
