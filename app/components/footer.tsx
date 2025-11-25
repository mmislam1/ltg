import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="w-full flex flex-row bg-[#261B02] justify-center text-white py-10 px-6 md:px-16">
      <div className="flex flex-col items-center justify-center h-full px-4 md:px-40">
        <Image
          src="/logo.svg"
          alt="Ridero Logo"
          width={44}
          height={44}
          className="object-contain"
        />
        <span
          className=" font-semibold text-center"
          style={{
            fontSize: 16,
          }}
        >
          RIDERO
        </span>
      </div>
    <div className="flex flex-col items-start">
      <div className="flex flex-col md:flex-row ">
        <div className="space-y-4 mb-6">
          <p className="text-sm text-white leading-relaxed">
            5123 Market St. #22B Charlottesville, California 44635
          </p>
        </div>

        <div className="w-full max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-20 md:gap-35 md:ml-30 items-start">
          <div>
            <ul className="space-y-2 text-white text-sm">
              <li>
                <Link href="/Home" className="hover:text-[#EFB639]">
                  home
                </Link>
              </li>
              <li>
                <Link href="/How It Works" className="hover:text-[#EFB639]">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/Features" className="hover:text-[#EFB639]">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/Contact" className="hover:text-[#EFB639]">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/Testimonial" className="hover:text-[#EFB639]">
                  Testimonial
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <ul className="space-y-2 text-white text-sm">
              <li>
                <Link href="/Facebook" className="hover:text-[#EFB639]">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="/Twitter" className="hover:text-[#EFB639]">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="/Linkedin" className="hover:text-[#EFB639]">
                  Linkedin
                </Link>
              </li>
              <li>
                <Link href="/Instagram" className="hover:text-[#EFB639]">
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>

        
      </div>
      <div className="flex flex-col md:flex-row items-start gap-6 md:gap-20 border-red mt-4">
          <div>
            <p className="space-y-2 text-white text-sm">(434) 546-4356</p>
            <p className="text-white text-sm">contact@lift.agencyr.com</p>
          </div>
          <p className="text-white text-sm">
            © 2020 Lift media. All rights reserved.
          </p>
        </div>
    </div></div>
  );
};

export default Footer;
