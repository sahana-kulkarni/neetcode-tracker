import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border/60 bg-card/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight"
        >
          NC<span className="text-primary">150</span>
        </Link>
        <nav className="flex items-center gap-1 font-mono text-sm">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            dashboard
          </Link>
          <Link
            href="/review"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            review
          </Link>
          <Link
            href="/problems"
            className="rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            all problems
          </Link>
        </nav>
      </div>
    </header>
  );
}
