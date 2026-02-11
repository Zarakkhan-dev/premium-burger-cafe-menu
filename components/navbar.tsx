"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pacifico } from "next/font/google";
import { Menu, X } from "lucide-react";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoScale, setLogoScale] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollThreshold = 50;
      if (scrollY > scrollThreshold) {
        setIsScrolled(true);
        setLogoScale(Math.max(0.45, 1 - scrollY / 400));
      } else {
        setIsScrolled(false);
        setLogoScale(1);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[#6262622e] backdrop-blur-sm py-3 shadow-lg"
          : "bg-transparent py-4 sm:py-6"
      }`}
    >
      <style jsx global>{`
        @font-face {
          font-family: "Cantarell";
          src: url("/fonts/Cantarell.woff2") format("woff2");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        .font-cantarell {
          font-family: "Cantarell", Arial, sans-serif;
        }
      `}</style>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* ---------- LEFT: DESKTOP MENU (hidden on mobile) ---------- */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-white transition-all duration-300 ${
                isScrolled ? "text-xl" : "text-2xl lg:text-4xl"
              } ${pacifico.className} ${
                isActive("/")
                  ? "underline underline-offset-4 decoration-2"
                  : "hover:opacity-70"
              }`}
            >
              Home
            </Link>
            <Link
              href="/menu"
              className={`text-white transition-all duration-300 ${
                isScrolled ? "text-xl" : "text-2xl lg:text-4xl"
              } ${pacifico.className} ${
                isActive("/menu")
                  ? "underline underline-offset-4 decoration-2"
                  : "hover:opacity-70"
              }`}
            >
              Menu
            </Link>
          </div>

          {/* ---------- LEFT: MOBILE HAMBURGER ---------- */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* ---------- CENTER: LOGO ---------- */}
          <div
            className="transition-all duration-500 flex justify-center"
            style={{
              transform: `scale(${logoScale})`,
              transformOrigin: "center",
            }}
          >
            <Link href="/" className="flex flex-col items-center">
              <h1
                className={`text-white !font-serif font-bold tracking-widest text-center transition-all duration-500 font-cantarell uppercase ${
                  isScrolled
                    ? "text-2xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
                    : "text-3xl sm:text-6xl md:text-7xl lg:text-8xl"
                }`}
              >
                Premium
              </h1>
              <div
                className={`relative transition-all duration-500 ${
                  isScrolled ? "mt-0 sm:mt-1" : "mt-1 sm:mt-2"
                }`}
              >
                <p
                  className={`text-white !font-serif font-md tracking-wide transition-all duration-500 ${
                    isScrolled
                      ? "text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl"
                      : "text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl"
                  }`}
                  style={{
                    transform: `scale(${1 / logoScale})`,
                    transformOrigin: "top center",
                  }}
                >
                  Burger & Cafe
                </p>
              </div>
            </Link>
          </div>

          {/* ---------- RIGHT: INVISIBLE BALANCE (keeps logo centered) ---------- */}
          <div className="invisible md:flex items-center gap-6">
            {/* Matches left desktop menu width */}
            <span className="text-2xl lg:text-4xl">Home</span>
            <span className="text-2xl lg:text-4xl">Menu</span>
          </div>
          <div className="invisible md:hidden">
            {/* Matches hamburger button width on mobile */}
            <span className="p-2">
              <Menu size={24} className="opacity-0" />
            </span>
          </div>
        </div>

        {/* ---------- MOBILE DROPDOWN MENU ---------- */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full mt-2 bg-[#4a5a3a] backdrop-blur-md py-6 px-4 shadow-xl rounded-b-2xl animate-slideDown">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className={`text-white text-xl ${pacifico.className} ${
                  isActive("/")
                    ? "underline underline-offset-4 decoration-2"
                    : "hover:opacity-70"
                }`}
              >
                Home
              </Link>
              <Link
                href="/menu"
                className={`text-white text-xl ${pacifico.className} ${
                  isActive("/menu")
                    ? "underline underline-offset-4 decoration-2"
                    : "hover:opacity-70"
                }`}
              >
                Menu
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}