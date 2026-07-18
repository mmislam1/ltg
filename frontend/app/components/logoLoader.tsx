"use client";

import Image from "next/image";

type LogoLoaderProps = {
  visible?: boolean;
};

export default function LogoLoader({ visible = true }: LogoLoaderProps) {
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
        <div className="logo-loader__mark">
          <Image
            src="/logo.png"
            alt="Lose To Gain"
            width={180}
            height={78}
            priority
            className="logo-loader__image"
          />
        </div>
        <div className="logo-loader__track" aria-hidden="true" />
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
