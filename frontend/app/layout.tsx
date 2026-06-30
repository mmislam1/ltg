
import type { Metadata, Viewport } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar";
import ReduxProvider from "./providers/ReduxProvider";
import Footer from "./components/footer";
import BottomBar from "./components/botomBar";
import { themeStyle } from "./theme";

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
          {/*<SocketProvider serverUrl="http://localhost:5000">*/}
            <header className="sticky top-0 z-50 w-full">
              <Navbar></Navbar>
            </header>
            <main className="w-full max-w-6xl overflow-hidden">{children}</main>

            <footer className="mt-auto w-full row-start-3 flex flex-wrap items-center justify-center">
              <Footer />
              <BottomBar/>
            </footer>
          {/*</SocketProvider>*/}
        </ReduxProvider>
      </body>
    </html>
  );
}
