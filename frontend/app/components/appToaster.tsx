"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      closeButton
      richColors
      position="top-right"
      visibleToasts={4}
    />
  );
}
