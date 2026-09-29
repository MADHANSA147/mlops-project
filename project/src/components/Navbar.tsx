import { Bell, Search } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 h-16 flex items-center px-4 sm:px-6 gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-600 text-white">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-lg font-bold text-neutral-800 tracking-tight hidden sm:block">Veritas<span className="text-primary-600">AI</span></span>
      </div>

      <div className="flex-1 max-w-md mx-auto hidden md:block">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search topics, hashtags, posts..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-primary-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="relative p-2 rounded-lg hover:bg-neutral-100 text-neutral-600 transition-colors" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full ring-2 ring-white" />
        </button>
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 sm:border-l sm:border-neutral-200">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white text-sm font-semibold">
            AM
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-neutral-800 leading-tight">Alex Morgan</p>
            <p className="text-xs text-neutral-500">Analyst</p>
          </div>
        </div>
      </div>
    </header>
  );
}
