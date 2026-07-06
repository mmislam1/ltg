"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../../components/logo";
import { useDeviceType } from "../hooks/useDeviceType";
import { useAppSelector } from "../store/hooks";
import DropdownMenu from "./dropdownMenu";
const Navbar = () => {

  const user = useAppSelector((store)=>store.auth.user)
  const pathname = usePathname();
  const isMobile=useDeviceType()
  
  const navLinks = [
    { name: "Home", href: "/", disabled:false },
    { name: "How it works", href: "/how-it-works", disabled:false },
    { name: "Features", href: "/features", disabled:false },
    { name: "Testimonials", href: "/testimonials", disabled:false },
    { name: "Contact", href: "/contact", disabled:false },
  ];

  return (
    <nav className="flex w-full items-center justify-center border-b border-line bg-surface px-4 py-2 sm:px-6 lg:px-8">
      <div className="relative grid w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center">
        <Link href="/" className="col-start-1 row-start-1 flex shrink-0 items-center gap-2">
          <Logo/>
        </Link>

        {!user && (
          !isMobile && <div className="absolute left-1/2 hidden -translate-x-1/2 text-muted xl:flex">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`whitespace-nowrap px-3 transition-colors duration-200 ${
                  pathname === link.href ? "font-semibold text-brand" : "hover:text-brand"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}

        <div className="col-start-3 row-start-1 flex shrink-0 items-center gap-2 justify-self-end">
          {user ? (
            <DropdownMenu />
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/auth/signin" className="btn btn-secondary">Login</Link>
              <Link href="/auth/signup" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
