"use client";
import React, { useState } from "react";

interface InputElementProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputElement: React.FC<InputElementProps> = ({
  label,
  type = "text",
  value,
  onChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(value !== "")} 
        className="peer w-full border border-gray-300 rounded-md px-3 pt-5 pb-2 text-base text-gray-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
        placeholder=" " 
      />
      <label
        className={`absolute left-3 text-gray-500 transition-all duration-200 
          ${isFocused || value
            ? "text-xs -top-1.5 bg-white px-1 text-yellow-600"
            : "text-base top-2.5"
          }`}
      >
        {label}
      </label>
    </div>
  );
};

export default InputElement;
