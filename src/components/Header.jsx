import { useEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronRight,
  CornerDownLeft,
} from "lucide-react";
import { PAGE_INDEX } from "../nav";

export default function Header({
  onMenu,
  currentPage,
  setCurrentPage,
}) {
  const [query, setQuery] = useState("");
  const [openResults, setOpenResults] = useState(false);

  const box = useRef(null);

  const page =
    PAGE_INDEX[currentPage] ||
    PAGE_INDEX.dashboard;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return [];

    return Object.values(PAGE_INDEX)
      .filter(
        (p) =>
          p.label.toLowerCase().includes(q) ||
          p.group.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!box.current?.contains(e.target)) {
        setOpenResults(false);
      }
    };

    const onKey = (e) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "k"
      ) {
        e.preventDefault();

        box.current
          ?.querySelector("input")
          ?.focus();
      }
    };

    document.addEventListener(
      "mousedown",
      onDocClick
    );

    document.addEventListener(
      "keydown",
      onKey
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        onDocClick
      );

      document.removeEventListener(
        "keydown",
        onKey
      );
    };
  }, []);

  const jump = (id) => {
    setCurrentPage(id);
    setQuery("");
    setOpenResults(false);
  };

  return (
    <header className="h-16 sticky top-0 z-20 bg-surface/90 backdrop-blur border-b border-line flex items-center gap-3 px-4 md:px-6">
      
      {/* MOBILE MENU */}
      <button
        onClick={onMenu}
        className="lg:hidden p-2 -ml-2 rounded text-ink-soft hover:bg-raised"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* BREADCRUMB */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-[13px] min-w-0"
      >
        <span className="text-ink-mute truncate">
          {page.group}
        </span>

        <ChevronRight
          size={14}
          className="text-line-strong shrink-0"
        />

        <span className="text-ink font-medium truncate">
          {page.label}
        </span>
      </nav>

      {/* SEARCH */}
      <div
        ref={box}
        className="relative ml-auto hidden md:block"
      >
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute"
        />

        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpenResults(true);
          }}
          onFocus={() =>
            setOpenResults(true)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              matches[0]
            ) {
              jump(matches[0].id);
            }

            if (e.key === "Escape") {
              setOpenResults(false);
            }
          }}
          placeholder="Go to screen"
          aria-label="Go to screen"
          className="w-56 lg:w-72 h-9 pl-9 pr-14 rounded-md bg-raised border border-line text-[13px] placeholder:text-ink-mute focus:bg-surface focus:border-accent focus:outline-none"
        />

        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-mute border border-line rounded px-1.5 py-0.5 bg-surface">
          ⌘K
        </kbd>

        {/* SEARCH RESULTS */}
        {openResults && query && (
          <div className="absolute right-0 mt-1.5 w-80 bg-surface border border-line rounded-lg shadow-xl shadow-ink/10 overflow-hidden rise">
            
            {matches.length ? (
              matches.map((m) => {
                const Icon = m.icon;

                return (
                  <button
                    key={m.id}
                    onClick={() =>
                      jump(m.id)
                    }
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-accent-soft border-b border-line last:border-0"
                  >
                    <Icon
                      size={15}
                      className="text-accent shrink-0"
                    />

                    <span className="text-[13.5px] text-ink">
                      {m.label}
                    </span>

                    <span className="text-[12px] text-ink-mute ml-auto">
                      {m.group}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-3.5 py-3 text-[13px] text-ink-mute">
                Nothing matches “{query}”.
                Try a module name such as
                equipment or breakdown.
              </p>
            )}

            {matches.length > 0 && (
              <p className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] text-ink-mute bg-raised">
                <CornerDownLeft size={12} />
                Enter opens the first result
              </p>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 md:ml-3 ml-auto md:ml-0">
        
        {/* NOTIFICATIONS */}
        <button
          className="relative p-2 rounded text-ink-soft hover:bg-raised"
          aria-label="Notifications"
        >
          <Bell
            size={18}
            strokeWidth={1.75}
          />

          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-danger ring-2 ring-surface" />
        </button>

        <span className="w-px h-6 bg-line" />

        {/* USER PROFILE */}
        <div className="flex items-center gap-2.5 pl-1">
          
          {/* INITIALS */}
          <span className="w-8 h-8 rounded-full bg-accent-soft text-accent border border-accent-line grid place-items-center text-[12px] font-semibold">
            RV
          </span>

          {/* NAME + ROLE */}
          <div className="hidden sm:block leading-tight">
            <div className="text-[13px] font-medium text-ink">
              Ravivarman
            </div>

            <div className="text-[11px] text-ink-mute">
              Maintenance Planner
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}