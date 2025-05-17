
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>TOS Raider - AI-Powered Terms of Service Analysis</title>
        <meta name="description" content="Analyze Terms of Service agreements with AI to find loopholes and protect your rights." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <Features />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
