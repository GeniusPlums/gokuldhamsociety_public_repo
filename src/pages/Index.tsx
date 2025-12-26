import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ThreeSocietyMap from "@/components/ThreeSocietyMap";
import NoticeBoard from "@/components/NoticeBoard";
import ActivePoll from "@/components/ActivePoll";
import ElectionBanner from "@/components/ElectionBanner";
import ComplaintHighlights from "@/components/ComplaintHighlights";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Gokuldham Society - India's First 3D Social Drama Simulator</title>
        <meta
          name="description"
          content="Live in 3D Gokuldham Society! Claim your flat, post notices, vote in meetings, and run for secretary. A persistent 3D social simulation for TMKOC fans."
        />
        <meta name="keywords" content="Gokuldham Society, 3D Game, TMKOC, digital community, social simulation, society management" />
        <link rel="canonical" href="https://gokuldhamsociety.com" />
      </Helmet>

        <div className="min-h-screen bg-background">
          <Header />
          <main>
            <div id="hero"><HeroSection /></div>
            <div id="elections"><ElectionBanner /></div>
            <div id="map"><ThreeSocietyMap /></div>
            <div id="notices"><NoticeBoard /></div>
            <div id="polls"><ActivePoll /></div>
            <div id="complaints"><ComplaintHighlights /></div>
          </main>
          <Footer />
        </div>
    </>
  );
};

export default Index;
