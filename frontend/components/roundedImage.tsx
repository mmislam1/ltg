"use client";
import Image from "next/image";
import React from "react";

interface RoundedImageProps {
  src: string; 
  alt?: string;
  width?: number; 
  height?: number; 
  curvature?: number; 
  side?: "left" | "right"; 
  className?: string; 
}

const RoundedImage: React.FC<RoundedImageProps> = ({
  src,
  alt = "image",
  width = 400,
  height = 300,
  curvature = 30,
  side = "left",
  className = "",
}) => {
  
  const borderRadiusStyle =
    side === "left"
      ? {
          borderTopLeftRadius: `${curvature}px`,
          borderBottomLeftRadius: `${curvature}px`,
        }
      : {
          borderTopRightRadius: `${curvature}px`,
          borderBottomRightRadius: `${curvature}px`,
        };

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        width,
        height,
        ...borderRadiusStyle,
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default RoundedImage;
