"use client";

import Image, { type StaticImageData } from "next/image";
import type { CSSProperties } from "react";

type LogoLoaderProps = {
  alt?: string;
  height?: number;
  src?: string | StaticImageData;
  visible?: boolean;
  width?: number;
};

export default function LogoLoader({
  alt = "Loading",
  height = 78,
  src = "/logo.png",
  visible = true,
  width = 180,
}: LogoLoaderProps) {
  const logoStyle = {
    "--logo-loader-aspect": `${width} / ${height}`,
    "--logo-loader-width": `${width}px`,
  } as CSSProperties;

  return (
    <div
      className="logo-loader logo-loader--fixed"
      data-visible={visible ? "true" : "false"}
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      aria-hidden={visible ? undefined : true}
    >
      <div className="logo-loader__panel">
        <div className="logo-loader__mark" style={logoStyle}>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority
            className="logo-loader__image"
          />
        </div>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
