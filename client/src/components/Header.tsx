"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* 1. Logo / Brand Name */}
          <div className="flex items-center gap-8 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-foreground">
                Tome<span className="text-brand-gradient">21</span>
              </span>
            </Link>
          </div>

          {/* 2. Middle Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                className="w-full h-10 pl-10 pr-4 text-sm rounded-full border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          </div>

          {/* 3. Actions & Clean Brand CTA */}
          <div className="hidden md:flex items-center gap-4 shrink-0">
            <Link
              href="/cart"
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
            </Link>

            <Link
              href="/login"
              className="text-sm font-medium text-foreground hover:text-primary px-3 py-2 transition-colors"
            >
              Log in
            </Link>

            {/* Reusable Brand Gradient Class */}
            <Link
              href="/register"
              className="px-5 py-2 rounded-full font-medium text-white bg-brand-gradient hover:opacity-90 shadow-sm transition-opacity text-sm"
            >
              Register
            </Link>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/cart"
              className="p-2 text-foreground relative"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-6 space-y-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full h-10 pl-10 pr-4 text-sm rounded-full border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="pt-2 border-t border-border flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-2 text-sm font-medium text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-full font-medium text-white bg-brand-gradient text-sm"
            >
              Register
            </Link>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
