"use client";

import Image from "next/image";
import React from "react";

interface LogoProps {
  color?: string; 
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ color = "#EFB639", size = 65 }) => {
  return (
    <div className="flex flex-col items-center justify-center" style={{color}}>
      <div
        className="flex flex-col items-center justify-center"
        style={{
          width: `44px`,
          height: `44px`,
        }}
      >
        <Image
          src="/logoGold.svg"
          alt="Ridero Logo"
          height='44'
          width= '44'
          style={{
            objectFit: "contain",
            
          }}
        />
      </div>

      <span
        className=" font-semibold text-center"
        style={{
          fontSize: 16,
        }}
      >
        RIDERO
      </span>
    </div>
  );
};

export default Logo;
