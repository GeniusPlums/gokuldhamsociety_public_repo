import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SocietyMap from "@/components/SocietyMap";
import NoticeBoard from "@/components/NoticeBoard";
import ActivePoll from "@/components/ActivePoll";
import ElectionBanner from "@/components/ElectionBanner";
import ComplaintHighlights from "@/components/ComplaintHighlights";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Gokuldham Society - Join India's Most Entertaining Digital Neighbourhood</title>
        <meta
          name="description"
          content="Claim your flat in Gokuldham Society! Post notices, vote on conflicts, file complaints, and participate in society elections. A community-first social simulation."
        />
        <meta name="keywords" content="Gokuldham Society, TMKOC, digital community, social simulation, society management" />
        <link rel="canonical" href="https://gokuldhamsociety.com" />
      </Helmet>

        <div className="min-h-screen bg-background">
          <Header />
          <main>
            <div id="hero"><HeroSection /></div>
            <div id="elections"><ElectionBanner /></div>
            <div id="map"><SocietyMap /></div>
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
