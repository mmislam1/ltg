"use client";

import React from "react";

interface ButtonProps {
  text: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
  size?: number; 
  className?: string; 
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  borderColor,
  backgroundColor,
  textColor='#ffffff',
  size = 52,
  className = "",
}) => {
  
  const defaultGradient =
    "linear-gradient(to right, #EFB639, #C59325)";

  return (
    <button
      onClick={onClick}
      className={`rounded-lg font-semibold px-6 transition-all duration-200 shadow-md hover:opacity-90 active:scale-95 ${className}`}
      style={{
        background: backgroundColor || defaultGradient,
        color: textColor || "#fff",
        border: borderColor ? `2px solid ${borderColor}` : "none",
        height: `${size}px`,
        minWidth: "fit-content",
      }}
    >
      {text}
    </button>
  );
};

export default Button;
