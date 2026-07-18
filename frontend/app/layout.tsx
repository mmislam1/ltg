
import type { Metadata, Viewport } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import ReduxProvider from "./providers/ReduxProvider";
import { themeStyle } from "./theme";
import SiteShell from "./components/siteShell";
import AppToaster from "./components/appToaster";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-comfortaa",
});

export const metadata: Metadata = {
  title: "Lose To Gain",
  icons:{
    icon:'/logo1.png',
  },
  description: "Diet chart app.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={comfortaa.variable} style={themeStyle}>
      <body className="flex min-h-screen w-full max-w-full flex-col items-center antialiased">
        <ReduxProvider>
          <SiteShell>{children}</SiteShell>
          <AppToaster />
        </ReduxProvider>
      </body>
    </html>
  );
}
