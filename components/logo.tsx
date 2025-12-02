"use client";

import Image from "next/image";
import React from "react";
import { useDeviceType } from "@/app/hooks/useDeviceType";

interface LogoProps {
  color?: string; 
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ color = "#EFB639", size = 65 }) => {
  const device=useDeviceType()
  return (
    <div className="flex flex-col items-center justify-center" style={{color}}>
      <div
        className="flex flex-col items-center justify-center"
        style={{
          width: device==='d'?'124px': '62px',
          height: device === 'd' ? '54px' : '27px',
        }}
      >
        <Image
          src="/logo.png"
          alt="lose to gain Logo"
          height={device === 'd' ? 54 : 27}
          width={device === 'd' ? 124 : 62}
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
