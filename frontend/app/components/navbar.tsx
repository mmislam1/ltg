"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React,{ReactNode} from "react";
import Logo from "../../components/logo";
import { useDeviceType } from "../hooks/useDeviceType";
import { useAppSelector } from "../store/hooks";
import UserTab from './userTab'
import DropdownMenu from "./dropdownMenu";
import { Plus } from "lucide-react";
import DatePickerCalendar from "./calender";
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
    <nav className="flex w-full flex-row items-center justify-center border-b border-line bg-surface px-5 py-2 md:px-40">
      <div className="flex flex-row justify-between items-center w-full max-w-7xl">

      
      <Link href="/" className="flex items-center gap-2">
        <Logo/>
      </Link>

      {!isMobile &&(<div className="text-muted">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`transition-colors duration-200 ${
              pathname === link.href
                ? "text-brand font-semibold"
                : "hover:text-brand"
            } px-3`}
          >
            {link.name}
          </Link>
        ))}
      </div>)}
      <DatePicker/>
      <DropdownMenu />
      </div>
    </nav>
  );
};

export default Navbar;
