import { Headset, PhoneCall } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white py-8 ">
      <div className="max-w-300 px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center gap-1 md:items-baseline">
          <Logo className="mb-1"/>
          <p className="text-xs text-slate-400">© 2026 Vortuiz. Empowering learners globally.</p>
        </div>
        <nav className="flex flex-wrap items-center gap-5 text-xs text-slate-400">
          {["Privacy Policy", "Terms of Service", "Help Center", "Contact Us"].map((item) => (
            <a key={item} href="#" className="hover:text-slate-600 transition-colors">{item}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a href="#" className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-slate-400 hover:text-brand-navy hover:border-brand-navy transition-colors">
            <Headset className="h-3.5 w-3.5" />
          </a>
          <a href="#" className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-slate-400 hover:text-brand-navy hover:border-brand-navy transition-colors">
            <PhoneCall className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}