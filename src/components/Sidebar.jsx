import { useState } from 'react';
import { ChevronDown, Wrench, X } from 'lucide-react';
import { NAV } from '../nav';

export default function Sidebar({ currentPage, setCurrentPage, mobileOpen, setMobileOpen }) {
  const groupOf = (id) => NAV.find((g) => g.items.some(([item]) => item === id))?.key;
  // Only groups the person has clicked are stored; everything else follows the
  // page they are on, so navigating from search opens the right group.
  const [open, setOpen] = useState({ overview: true, master: true });
  const isOpen = (key) => open[key] ?? groupOf(currentPage) === key;

  const go = (id) => { setCurrentPage(id); setMobileOpen?.(false); };

  return (
    <>
      <aside
        className={`${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          fixed top-0 left-0 z-40 h-screen w-[264px] shrink-0 flex flex-col
          bg-rail text-slate-300 border-r border-rail-line transition-transform duration-200`}
      >
        <div className="flex items-center gap-3 px-5 h-16 border-b border-rail-line shrink-0">
          <span className="w-8 h-8 rounded bg-accent grid place-items-center text-white shrink-0">
            <Wrench size={17} strokeWidth={2} />
          </span>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-white">Plant Maintenance</div>
            <div className="text-[11px] text-slate-500">SAP PM · Production</div>
          </div>
          <button className="lg:hidden ml-auto p-1.5 text-slate-400 hover:text-white" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((group) => {
            const expanded = isOpen(group.key);
            const GroupIcon = group.icon;
            return (
              <div key={group.key} className="mb-1">
                <button
                  onClick={() => setOpen((o) => ({ ...o, [group.key]: !expanded }))}
                  aria-expanded={expanded}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium text-slate-400 whitespace-nowrap hover:text-white hover:bg-white/5"
                >
                  <GroupIcon size={15} strokeWidth={1.75} />
                  {group.label}
                  <ChevronDown size={14} className={`ml-auto transition-transform ${expanded ? '' : '-rotate-90'}`} />
                </button>

                {expanded && (
                  <ul className="mt-0.5 mb-2">
                    {group.items.map(([id, label, Icon]) => {
                      const active = currentPage === id;
                      return (
                        <li key={id}>
                          <button
                            onClick={() => go(id)}
                            aria-current={active ? 'page' : undefined}
                            className={`w-full flex items-center gap-2.5 pl-4 pr-3 py-[7px] ml-1 rounded text-[13.5px] text-left border-l-2 transition-colors ${
                              active
                                ? 'border-accent bg-white/[0.07] text-white font-medium'
                                : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                            }`}
                          >
                            <Icon size={15} strokeWidth={1.75} className={active ? 'text-accent-line' : ''} />
                            {label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-rail-line shrink-0">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-slate-400">Plant network uptime</span>
            <span className="text-white tnum font-medium">96.8%</span>
          </div>
          <div className="h-1 mt-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-accent" style={{ width: '96.8%' }} />
          </div>
          <p className="text-[11px] text-slate-500 mt-2.5">6 plants · 1,248 pieces of equipment</p>
        </div>
      </aside>

      {mobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-ink/50 lg:hidden" />}
    </>
  );
}
