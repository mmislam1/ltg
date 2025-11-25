//"use client"
/*import { useEffect, useState } from "react";

export function useDeviceType() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768); 
    };

    checkDevice(); 
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  return isMobile;
}   */
"use client";

import { useState, useEffect } from "react";

type DeviceType = "m" | "t" | "d";

/**
 * A custom hook to detect the current device type based on window width.
 * Works only on the client side.
 */
export const useDeviceType = (): DeviceType => {
  const [device, setDevice] = useState<DeviceType>("d");

  useEffect(() => {
    // Function to check current window width and update device type
    const updateDevice = () => {
      const width = window.innerWidth;

      if (width < 640) setDevice("m");
      else if (width < 1024) setDevice("t");
      else setDevice("d");
    };

    // Run on mount
    updateDevice();

    // Listen to window resize
    window.addEventListener("resize", updateDevice);

    // Cleanup
    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  return device;
};
