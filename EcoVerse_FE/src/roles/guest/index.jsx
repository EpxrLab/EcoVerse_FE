import React from "react";
import { Helmet } from "react-helmet-async";
import NavBar from "./components/layout/navBar";
import Hero from "./components/landing/hero";
import Features from "./components/landing/features";
import Footer from "./components/landing/footer";
import GameDemo from "./components/landing/gameDemo";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>
          EcoVerse - Học phân loại rác qua trò chơi | Giáo dục môi trường cho
          học sinh
        </title>
        <meta
          name="description"
          content="EcoVerse là ứng dụng gamified giáo dục môi trường cho học sinh tiểu học. Học phân loại rác thải thông qua game tương tác, quiz thú vị và phần thưởng hấp dẫn."
        />
        <meta
          name="keywords"
          content="giáo dục môi trường, phân loại rác, game học tập, trẻ em, tiểu học, EcoVerse"
        />
        <link rel="canonical" href="https://ecoverse.edu.vn" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <NavBar />
        <main>
          <Hero />
          <section id="features">
            <Features />
          </section>
          <section id="demo">
            <GameDemo />
          </section>
        </main>
        <section id="contact">
          <Footer />
        </section>
      </div>
    </>
  );
};

export default Index;
