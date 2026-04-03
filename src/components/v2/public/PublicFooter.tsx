export function PublicFooter() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full max-w-7xl mx-auto gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-slate-900 text-lg tracking-tighter">StrataDash</span>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
            &copy; {new Date().getFullYear()} School District Strategic Planning
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <span className="text-xs font-medium uppercase tracking-widest text-slate-400 hover:text-violet-500 transition-opacity cursor-default">
            Powered by StrataDash
          </span>
          <a href="#" className="text-xs font-medium uppercase tracking-widest text-slate-400 hover:text-violet-500 transition-opacity">
            Accessibility
          </a>
          <a href="#" className="text-xs font-medium uppercase tracking-widest text-slate-400 hover:text-violet-500 transition-opacity">
            Privacy Policy
          </a>
          <a href="#" className="text-xs font-medium uppercase tracking-widest text-slate-400 hover:text-violet-500 transition-opacity">
            Contact Support
          </a>
        </div>
      </div>
    </footer>
  );
}
