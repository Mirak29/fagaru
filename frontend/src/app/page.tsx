"use client"
import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import Blog from "@/components/Blog";
import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Video from "@/components/Video";
// import { useAuth } from "../context/AuthContext"
import { useApp } from "@/components/auth/MetaMaskAuth";


export default function Home() {
  const { isConnected, address, error, connectToMetaMask, signMessage, role } = useApp();


  return (
    <>
      <ScrollUp />
      <Hero />
      <Features />
      {/* <Video /> */}
      {/* <Brands /> */}
      {/* <AboutSectionOne />
      <AboutSectionTwo /> */}
      <Testimonials />
      {/* <Pricing /> */}
      {/* <Blog /> */}
      <Contact />
    </>
  );
}
