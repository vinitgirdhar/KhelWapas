"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, ShoppingCart, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KhelwapasLogo } from "@/components/icons/khelwapas-logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "../ui/badge";
import SearchComponent from "./search-component";
import { HeaderCartButton } from "./header-cart-button";

const mainNav = [
  { href: "/shop/preowned", label: "Shop Pre-Owned" },
  { href: "/shop/new", label: "Shop New Gear" },
  { href: "/sell", label: "Sell Now" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { items } = useCart();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);

    const handleStorageChange = () => {
      const loggedInVal = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedInVal);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    router.push("/");
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-6">
        <div className="flex h-20 items-center justify-between">
          
          {/* Left Side: Logo + Navigation - No left margin */}
          <div className="flex items-center space-x-8">
            {/* Logo - Reduced by 20% */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="transform scale-[1.36] origin-left">
                <KhelwapasLogo />
              </div>
            </Link>

            {/* Navigation Links - Closer to logo */}
            <nav className="hidden md:flex">
              <div className="flex items-center space-x-8 text-sm font-medium">
                {mainNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="transition-colors hover:text-foreground/80 text-foreground/70 whitespace-nowrap py-2 font-semibold"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          {/* Right Side: Search + Cart + Profile - No right margin */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <div className="hidden md:flex items-center space-x-1">
              
              {/* Search Component */}
              <div className="mr-1">
                <SearchComponent />
              </div>
              
              {/* Cart Button */}
              <div className="h-14 w-14 flex items-center justify-center">
                <HeaderCartButton />
              </div>

              {/* Profile/Auth Section */}
              {isMounted && isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-14 w-14 hover:bg-foreground/5">
                      <UserCircle className="h-8 w-8 stroke-[3]" />
                      <span className="sr-only">Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/orders" className="cursor-pointer">Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : isMounted ? (
                <div className="flex items-center space-x-2 ml-1">
                  <Button variant="ghost" asChild className="font-semibold h-10 px-4">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="font-semibold h-10 px-6">
                    <Link href="/register">Register</Link>
                  </Button>
                </div>
              ) : null}
            </div>

            {/* Mobile Menu Button - Bigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden ml-2">
                <Button variant="ghost" size="icon" className="h-14 w-14 hover:bg-foreground/5">
                  <Menu className="h-8 w-8 stroke-[3]" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                      <div className="transform scale-125">
                        <KhelwapasLogo />
                      </div>
                    </Link>
                  </div>
                  
                  <nav className="flex flex-col space-y-4 mb-8">
                    {mainNav.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-lg font-medium py-3 px-2 transition-colors hover:text-foreground/80"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  
                  <div className="mt-auto border-t pt-6">
                    <div className="mb-6">
                      <SearchComponent />
                    </div>
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="icon" className="h-12 w-12 relative" asChild>
                        <Link href="/cart" onClick={() => setMobileMenuOpen(false)}>
                          <ShoppingCart className="h-6 w-6" />
                          {isMounted && totalItems > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">
                              {totalItems}
                            </Badge>
                          )}
                          <span className="sr-only">Cart</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-12 w-12" asChild>
                        <Link href={isLoggedIn ? "/profile" : "/login"} onClick={() => setMobileMenuOpen(false)}>
                          <UserCircle className="h-6 w-6" />
                          <span className="sr-only">Account</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}