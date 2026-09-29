export default function Footer() {
  return (
    <footer className="mt-auto px-6 py-4 border-t border-neutral-200 bg-white">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary-600 text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-semibold text-neutral-700">VeritasAI</span>
          <span className="text-neutral-400">— AI Powered Analytics Platform</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Version 2.4.1</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}
