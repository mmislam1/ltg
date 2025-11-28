"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import Logo from "../../components/logo";
import { useDeviceType } from "../hooks/useDeviceType";
import { useAppSelector } from "../store/hooks";
import UserTab from './userTab'
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
    <nav className="w-full flex flex-row justify-center items-center px-5 md:px-40 py-4 bg-white border-b-2 border-gray-300">
      <div className="flex flex-row justify-between items-center w-full max-w-7xl">

      
      <Link href="/" className="flex items-center gap-2">
        <Logo/>
      </Link>

      {!isMobile &&(<div className="text1 text-[#545454]">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`transition-colors duration-200 ${
              pathname === link.href
                ? "text-[#EFB639] font-semibold"
                : "hover:text-[#EFB639]"
            } px-3`}
          >
            {link.name}
          </Link>
        ))}
      </div>)}

      <UserTab></UserTab>
      </div>
    </nav>
  );
};

export default Navbar;
