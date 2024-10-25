"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import { Inter } from "next/font/google";
import "node_modules/react-modal-video/css/modal-video.css";
import "../styles/index.css";
// import { AuthProvider } from "../context/AuthContext";
import { Providers } from "./providers";
import { AppProvider } from "@/components/auth/MetaMaskAuth";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={`bg-[#FCFCFC] dark:bg-black ${inter.className}`}>
        <Providers>
          <AppProvider>
            <Header />
            {children}
            {/* <Footer /> */}
            <ScrollToTop />
          </AppProvider>
        </Providers>
      </body>
    </html>
  );
}