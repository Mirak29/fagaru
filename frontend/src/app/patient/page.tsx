import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";
import PopularProducts from "@/components/Contact/ppp";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Page | Free Next.js Template for Startup and SaaS",
  description: "This is Contact Page for Startup Nextjs Template",
  // other metadata
};

const ContactPage = () => {
  return (
    <>
      <PopularProducts />
    </>
  );
};

export default ContactPage;
