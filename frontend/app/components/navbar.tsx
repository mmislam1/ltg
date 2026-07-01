"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "../../components/logo";
import { useDeviceType } from "../hooks/useDeviceType";
import { useAppSelector } from "../store/hooks";
import UserTab from "./userTab";
import DropdownMenu from "./dropdownMenu";
import DatePicker from "./calender";
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
      <div className="relative flex w-full max-w-7xl items-center justify-between">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logo/>
        </Link>

        {user ? (
          <div className="absolute left-1/2 hidden -translate-x-1/2 sm:block">
            <DatePicker />
          </div>
        ) : (
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

        <div className="flex shrink-0 items-center gap-2">
          {user && <DropdownMenu />}
          <UserTab />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
