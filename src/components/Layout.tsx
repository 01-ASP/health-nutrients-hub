import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Menu, X, Github } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/analyze", label: "Analyze" },
  { to: "/diary", label: "Diary" },
  { to: "/explore", label: "Explore" },
  { to: "/how-it-works", label: "How it works" },
] as const;

export function Layout({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setShow(y < 80 || y < last);
      setScrolled(y > 12);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [path]);

  return (
    <div className="min-h-screen flex flex-col">
      <motion.header
        initial={false}
        animate={{ y: show ? 0 : -100 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className={`fixed top-0 inset-x-0 z-50 transition-colors ${scrolled ? "backdrop-blur-xl bg-background/70 border-b border-white/[0.06]" : "bg-transparent"}`}
      >
        <nav className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative inline-flex w-8 h-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/30">
              <Leaf className="w-4 h-4 text-primary" />
            </span>
            <span className="font-bold tracking-tight text-lg">NutriLens</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {links.slice(1).map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                activeProps={{ className: "px-3 py-2 text-sm text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/analyze"
              className="hidden md:inline-flex relative glow-border items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:scale-[1.02] transition-transform"
            >
              Try it free
            </Link>
            <button
              onClick={() => setOpen((s) => !s)}
              className="md:hidden p-2 rounded-lg border border-white/10"
              aria-label="Menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-white/5 bg-background/95 backdrop-blur-xl"
            >
              <div className="px-5 py-4 flex flex-col">
                {links.map((l) => (
                  <Link key={l.to} to={l.to} className="py-3 text-base text-muted-foreground" activeProps={{ className: "py-3 text-base text-foreground" }}>
                    {l.label}
                  </Link>
                ))}
                <Link to="/analyze" className="mt-3 inline-flex justify-center px-4 py-3 rounded-full bg-primary text-primary-foreground font-semibold">
                  Try it free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="border-t border-white/5 mt-24">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row md:items-center gap-6 justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">NutriLens</span>
            <span>· Eat smart. Live well.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Built with YOLOv8
            </span>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
              <Github className="w-4 h-4" /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
