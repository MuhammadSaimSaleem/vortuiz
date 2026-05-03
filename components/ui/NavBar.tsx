import { useState, useEffect } from "react";
import { Button } from "./button";
import Link from "next/link";
import Logo from "./Logo";

const navItems = [
  { label: "Features", href: "/features" },
  { label: "Teachers", href: "/teachers" },
  { label: "Students", href: "/students" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border" : "bg-white border-b border-border"
      }`}
    >
      <div className="max-w-300 mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={"/"}><Logo/></Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-500 font-medium">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="hover:text-brand-navy transition-colors">{item.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-sm font-medium text-slate-600">
            <Link href={'/auth'}>Login</Link>
          </Button>
          <Button asChild size="sm" className="flex items-center bg-brand-navy hover:bg-brand-blue text-white text-sm font-semibold rounded-lg px-3 py-4 transition-colors">
            <Link href={'/auth'}>Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}