import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, Mail, Phone, MapPin, Linkedin, Twitter, Instagram, Facebook } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/programmes", label: "Programmes" },
  { to: "/bootcamps", label: "Bootcamps" },
  { to: "/events", label: "Events" },
  { to: "/contact", label: "Contact" },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0">
      <div className="size-10 rounded-xl bg-primary grid place-items-center text-mint font-display font-bold text-xl shadow-elegant">
        S
      </div>
      <div className="flex flex-col leading-tight">
        <span className="font-display font-bold text-base sm:text-lg tracking-tight text-primary">STAKEN HUB</span>
        <span className="hidden sm:block text-[10px] uppercase tracking-[0.18em] text-muted-foreground -mt-0.5">Academy</span>
      </div>
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-20 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <Logo />
        <nav className="hidden lg:flex items-center justify-center gap-3 xl:gap-7 text-[13px] xl:text-sm font-bold text-muted-foreground">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative px-3 py-1.5 rounded-md hover:text-primary hover:bg-primary/10 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
              activeProps={{ className: "text-primary bg-primary/10 after:w-full" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 justify-end">
          <Link
            to="/apply"
            className="hidden sm:inline-flex items-center rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-teal-deep transition-colors shadow-elegant"
          >
            Apply Now
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden inline-flex items-center justify-center size-10 rounded-lg text-primary hover:bg-primary-soft"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-primary-soft hover:text-primary"
                activeProps={{ className: "bg-primary-soft text-primary" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/apply"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold"
            >
              Apply Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground pt-20 pb-10 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 grid gap-12 lg:grid-cols-4 mb-16">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="size-10 rounded-xl bg-mint grid place-items-center text-primary font-display font-bold text-xl">
              S
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-lg">STAKEN HUB</span>
              <span className="text-[10px] uppercase tracking-[0.18em] opacity-70">Academy</span>
            </div>
          </div>
          <p className="text-sm text-primary-foreground/70 leading-relaxed mb-6 max-w-xs">
            Equipping the next generation of African innovators with world-class digital skills
            and pathways to employment.
          </p>
          <div className="flex gap-3">
            {[Linkedin, Twitter, Instagram, Facebook].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="size-9 rounded-full bg-white/10 hover:bg-mint hover:text-primary grid place-items-center transition-colors"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display font-bold text-base mb-5">Programmes</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/75">
            <li><Link to="/programmes" className="hover:text-mint">Cybersecurity</Link></li>
            <li><Link to="/programmes" className="hover:text-mint">Software Development</Link></li>
            <li><Link to="/programmes" className="hover:text-mint">Data Science & AI</Link></li>
            <li><Link to="/programmes" className="hover:text-mint">UI/UX Design</Link></li>
            <li><Link to="/programmes" className="hover:text-mint">Robotics for Kids</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-base mb-5">Quick Links</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/75">
            <li><Link to="/about" className="hover:text-mint">About Us</Link></li>
            <li><Link to="/success-stories" className="hover:text-mint">Success Stories</Link></li>
            <li><Link to="/events" className="hover:text-mint">Events & Workshops</Link></li>
            <li><Link to="/corporate" className="hover:text-mint">Corporate Training</Link></li>
            <li><Link to="/apply" className="hover:text-mint">Apply Now</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-base mb-5">Get in Touch</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/75">
            <li className="flex items-start gap-2.5"><Mail className="size-4 mt-0.5 shrink-0 text-mint" /> admissions@stakenhub.academy</li>
            <li className="flex items-start gap-2.5"><Phone className="size-4 mt-0.5 shrink-0 text-mint" /> +254 712 345 678</li>
            <li className="flex items-start gap-2.5"><MapPin className="size-4 mt-0.5 shrink-0 text-mint" /> Nairobi Tech Quarter, Kenya</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-primary-foreground/60">
        <p>© 2026 Staken Hub Academy. All Rights Reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-mint">Privacy Policy</a>
          <a href="#" className="hover:text-mint">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHero({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="relative bg-gradient-hero border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 lg:py-28 text-center">
        {eyebrow && (
          <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-primary mb-4">
            {eyebrow}
          </span>
        )}
        <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-primary leading-[1.05] text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
