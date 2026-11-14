import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";

interface IntroSplitCurtainProps {
  onOpening?: () => void;
}

export default function IntroSplitCurtain({ onOpening }: IntroSplitCurtainProps) {
  const [stage, setStage] = useState<"intro" | "ready" | "opening" | "done">("intro");
  const triggeredRef = useRef(false);

  const triggerOpen = useCallback(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setStage("opening");
    if (onOpening) onOpening();

    // Unlock scroll as soon as opening begins
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    setTimeout(() => {
      setStage("done");
    }, 850);
  }, [onOpening]);

  useEffect(() => {
    // Lock scroll during intro to prevent background jitter on mobile
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const tReady = setTimeout(() => {
      setStage("ready");
    }, 500);

    // Auto-open after a smooth, brief showcase
    const tAutoOpen = setTimeout(() => {
      triggerOpen();
    }, 1500);

    return () => {
      clearTimeout(tReady);
      clearTimeout(tAutoOpen);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [triggerOpen]);

  useEffect(() => {
    if (stage === "done" || stage === "opening") return;

    // Instant trigger on mobile touch, click, scroll or keydown
    const handleTouchStart = () => triggerOpen();
    const handleTouchMove = () => triggerOpen();
    const handleClick = () => triggerOpen();
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 2) triggerOpen();
    };
    const handleKey = () => triggerOpen();

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("click", handleClick, { once: true });
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("keydown", handleKey, { once: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKey);
    };
  }, [stage, triggerOpen]);

  if (stage === "done") return null;

  const isOpening = stage === "opening";

  return (
    <div
      onClick={triggerOpen}
      className={`fixed inset-0 z-[9999] h-[100dvh] w-full overflow-hidden select-none cursor-pointer ${
        isOpening ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      {/* TOP CURTAIN - Slides UP (Crimson Theme) */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isOpening ? "-100%" : 0 }}
        transition={{
          duration: 0.85,
          ease: [0.76, 0, 0.24, 1],
        }}
        className="absolute top-0 inset-x-0 h-[50.5%] bg-gradient-to-b from-[#8a121a] via-[#b81822] to-[#df2531] border-b border-black/20"
        style={{ willChange: "transform" }}
      />

      {/* BOTTOM CURTAIN - Slides DOWN (Crimson Theme) */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isOpening ? "100%" : 0 }}
        transition={{
          duration: 0.85,
          ease: [0.76, 0, 0.24, 1],
        }}
        className="absolute bottom-0 inset-x-0 h-[50.5%] bg-gradient-to-b from-[#df2531] via-[#b81822] to-[#8a121a] border-t border-black/20"
        style={{ willChange: "transform" }}
      />

      {/* CENTER TYPOGRAPHY LAYER - Unified Full Name, Role & Interactive Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{
          opacity: isOpening ? 0 : 1,
          scale: isOpening ? 1.05 : 1,
        }}
        transition={{
          opacity: { duration: isOpening ? 0.35 : 0.6, ease: "easeOut" },
          scale: { duration: isOpening ? 0.5 : 0.6, ease: "easeOut" },
        }}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none"
      >
        {/* Subtle Category Pill */}
        <div className="mb-3 px-3 py-1 rounded-full bg-black/20 border border-white/20 backdrop-blur-md shadow-sm">
          <span className="font-mono text-[10px] sm:text-xs text-white/90 tracking-widest uppercase">
            PORTFOLIO // 2026
          </span>
        </div>

        {/* Unified Full Name - Never split or severed */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
          SIDDHANT TANTARPALE
        </h1>

        {/* Professional Subtitle */}
        <p className="font-mono text-xs sm:text-sm text-white/90 tracking-wider mt-2.5 mb-6 font-medium">
          AI &amp; SOFTWARE ENGINEER <span className="text-white/50">//</span> MUMBAI
        </p>

        {/* Glowing Interactive Prompt */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-0.5 w-16 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="h-full w-full bg-white rounded-full shadow-[0_0_8px_#ffffff]"
            />
          </div>
          <span className="font-mono text-[10px] text-white/80 tracking-widest uppercase mt-1">
            TAP OR SCROLL TO ENTER
          </span>
        </div>
      </motion.div>
    </div>
  );
}
