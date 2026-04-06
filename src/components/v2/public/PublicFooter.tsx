import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white mt-auto">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-slate-900 text-lg tracking-tighter">StrataDash</span>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
            &copy; {new Date().getFullYear()} School District Strategic Planning
          </p>
        </div>
        <div
          className="flex flex-col items-start gap-3 text-left sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-6 sm:text-right"
          data-testid="public-footer-links"
        >
          <a
            href="https://stratadash.org"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium uppercase tracking-widest text-slate-400 transition-opacity hover:text-violet-500"
          >
            Powered by StrataDash
          </a>
          <a
            href="mailto:support@stratadash.org?subject=Accessibility%20support%20request"
            className="text-xs font-medium uppercase tracking-widest text-slate-400 transition-opacity hover:text-violet-500"
          >
            Accessibility
          </a>
          <Link href="/privacy" className="text-xs font-medium uppercase tracking-widest text-slate-400 transition-opacity hover:text-violet-500">
            Privacy Policy
          </Link>
          <a
            href="mailto:support@stratadash.org?subject=Public%20district%20support"
            className="text-xs font-medium uppercase tracking-widest text-slate-400 transition-opacity hover:text-violet-500"
          >
            Contact Support
          </a>
        </div>
      </div>
    </footer>
  );
}
