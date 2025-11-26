
import type { Metadata, Viewport } from "next";
import { Inter,Overlock,Advent_Pro } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import ReduxProvider from "./providers/ReduxProvider";
import Footer from "./components/footer";
import { SocketProvider } from "./socket-client";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const overlock = Overlock({
  subsets: ['latin'],
  weight: ['400', '700', '900'], // Specify the weights you need
  display: 'swap', // Ensures text is visible while loading
  variable: '--font-overlock', // Define a CSS variable name
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
    <html lang="en" className={overlock.variable}>
      <body
        className={` min-h-screen antialiased flex flex-col items-center w-full max-w-full`}
      >
        <ReduxProvider>
          <SocketProvider serverUrl="http://localhost:5000">
            <header className="sticky top-0 z-50 w-full">
              <Navbar></Navbar>
            </header>
            <main className="w-full max-w-7xl border overflow-hidden">{children}</main>

            <footer className="mt-auto w-full row-start-3 flex flex-wrap items-center justify-center">
              <Footer />
            </footer>
          </SocketProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
