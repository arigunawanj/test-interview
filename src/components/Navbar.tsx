"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="flex items-center gap-4 py-4 px-8 border-b">
      <Button asChild variant="ghost">
        <Link href="/">Dashboard</Link>
      </Button>
      <Button asChild variant="ghost">
        <Link href="/pokemon">Pokemon</Link>
      </Button>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
    </nav>
  );
}
