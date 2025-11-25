import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import ReduxProvider from "./providers/ReduxProvider";
import Footer from "./components/footer";
import { SocketProvider } from "./socket-client";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "JVAI",
  description: "A Delivery App.",
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ReduxProvider>
        <SocketProvider serverUrl="">
          <body
            className={`${inter.variable} min-h-screen antialiased flex flex-col items-center w-full max-w-full  bg-gray-200`}
          >
            <header className="sticky top-0 z-50 w-full">
              <Navbar></Navbar>
            </header>
            {children}
            <footer className="mt-auto w-full row-start-3 flex flex-wrap items-center justify-center">
              <Footer />
            </footer>
          </body>
        </SocketProvider>
      </ReduxProvider>
    </html>
  );
}
