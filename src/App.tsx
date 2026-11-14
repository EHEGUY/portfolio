import { useState, useEffect } from "react";
import Lenis from "lenis";
import BenjaminNav from "./components/BenjaminNav";
import BenjaminHero from "./components/BenjaminHero";
import BenjaminWorks from "./components/BenjaminWorks";
import BenjaminManifesto from "./components/BenjaminManifesto";
import BenjaminSkills from "./components/BenjaminSkills";
import BenjaminFooter from "./components/BenjaminFooter";
import IntroSplitCurtain from "./components/IntroSplitCurtain";

export default function App() {
  const [isOpening, setIsOpening] = useState(false);

  // Initialize ultra-smooth inertial momentum scrolling (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.85, // Snappy & fluid without sluggish drag
      easing: (t) => 1 - Math.pow(1 - t, 3.5), // Gentle cubic deceleration
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.05, // Eliminates notched mouse wheel stiffness
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] selection:bg-[#df2531] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Smooth Split Curtain Intro Overlay */}
      <IntroSplitCurtain onOpening={() => setIsOpening(true)} />

      {/* 1. Top Fixed Navigation */}
      <BenjaminNav />

      {/* Main Flow - GPU-accelerated and smooth on both desktop & mobile */}
      <main
        className="w-full relative transition-opacity duration-700 ease-out"
        style={{ opacity: isOpening ? 1 : 0.85 }}
      >
        {/* 2. Hero Section with Cyber Inset Video & Display Headline */}
        <BenjaminHero />

        {/* 3. Selected Works Section with Matrix Falling Code Terminal & Hover Preview */}
        <BenjaminWorks />

        {/* 4. Editorial Manifesto & ASCII Terrain Canvas */}
        <BenjaminManifesto />

        {/* 5. Skill Sets Categorized Breakdown */}
        <BenjaminSkills />

        {/* 6. Final Callout, Connect Marquee Ribbon & Technical Colophon */}
        <BenjaminFooter />
      </main>
    </div>
  );
}
