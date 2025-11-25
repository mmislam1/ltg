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
          width: `124px`,
          height: `54px`,
        }}
      >
        <Image
          src="/logo.png"
          alt="lose to gain Logo"
          height='54'
          width= '124'
          style={{
            objectFit: "contain",
            
          }}
          className="flex flex-col items-center justify-center "
        />
      </div>
    </div>
  );
};

export default Logo;
