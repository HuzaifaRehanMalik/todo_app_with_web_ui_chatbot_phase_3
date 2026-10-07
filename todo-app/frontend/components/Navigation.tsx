"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { tokenStorage } from "@/services/authService";
import { Icon } from "@/components/ui";
import { useStoredUser } from "@/lib/useStoredUser";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStoredUser();

  // The menu remembers the path it was opened on, so navigating closes it.
  const [menuOpenedOn, setMenuOpenedOn] = useState<string | null>(null);
  const isMenuOpen = menuOpenedOn === pathname;
  const setIsMenuOpen = (open: boolean) => setMenuOpenedOn(open ? pathname : null);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    tokenStorage.clear();
    router.push("/login");
  };

  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  const links = user
    ? [
        { href: "/todo", label: "Today's list" },
        { href: "/account", label: "Account" },
      ]
    : [
        ...(!isLoginPage ? [{ href: "/login", label: "Sign in" }] : []),
        ...(!isSignupPage ? [{ href: "/signup", label: "Create account" }] : []),
      ];

  const initial = user ? (user.full_name || user.email).charAt(0).toUpperCase() : "";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 md:pt-6">
        <nav className="flex w-full max-w-3xl items-center justify-between gap-2 rounded-full bg-card/70 py-1.5 pl-2 pr-1.5 ring-1 ring-ink/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_20px_40px_-24px_rgba(0,0,0,0.8)] backdrop-blur-xl md:w-max md:min-w-[560px]">
          <Link href={user ? "/todo" : "/"} className="group flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-paper transition-transform duration-700 ease-spring group-hover:rotate-[-12deg]">
              <Icon name="check" className="w-4 h-4" strokeWidth={1.75} />
            </span>
            <span className="font-display text-[22px] leading-none tracking-tight">Todoify</span>
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm transition-all duration-500 ease-spring ${
                  pathname === l.href ? "bg-ink/[0.06] text-ink" : "text-ink-soft hover:text-ink hover:bg-ink/[0.04]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <>
                <span className="mx-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-ink-soft">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage-soft font-display text-base text-sage">
                    {initial}
                  </span>
                  <span className="max-w-[140px] truncate">{user.full_name || user.email}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="group flex items-center gap-2 rounded-full bg-ink py-2 pl-4 pr-2 text-sm text-paper transition-all duration-500 ease-spring active:scale-[0.98]"
                >
                  Log out
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-paper/10 transition-transform duration-500 ease-spring group-hover:translate-x-0.5">
                    <Icon name="logout" className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Hamburger morph */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-ink/[0.05] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span
              className={`absolute h-px w-4 bg-ink transition-transform duration-500 ease-spring ${
                isMenuOpen ? "rotate-45" : "-translate-y-[3px]"
              }`}
            />
            <span
              className={`absolute h-px w-4 bg-ink transition-transform duration-500 ease-spring ${
                isMenuOpen ? "-rotate-45" : "translate-y-[3px]"
              }`}
            />
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 flex flex-col justify-end bg-paper/85 px-6 pb-16 pt-32 backdrop-blur-3xl transition-opacity duration-700 ease-spring md:hidden ${
          isMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="space-y-2">
          {links.map((l, i) => (
            <li key={l.href} className="overflow-hidden">
              <Link
                href={l.href}
                onClick={() => setIsMenuOpen(false)}
                style={{ transitionDelay: isMenuOpen ? `${100 + i * 60}ms` : "0ms" }}
                className={`block font-display text-5xl tracking-tight transition-all duration-700 ease-spring ${
                  isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
          {user && (
            <li className="overflow-hidden">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                style={{ transitionDelay: isMenuOpen ? `${100 + links.length * 60}ms` : "0ms" }}
                className={`block font-display text-5xl tracking-tight text-clay transition-all duration-700 ease-spring ${
                  isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
                }`}
              >
                Log out
              </button>
            </li>
          )}
        </ul>
        {user && (
          <p
            style={{ transitionDelay: isMenuOpen ? "320ms" : "0ms" }}
            className={`mt-10 text-sm text-muted transition-all duration-700 ease-spring ${
              isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            Signed in as {user.full_name || user.email}
          </p>
        )}
      </div>
    </>
  );
}
