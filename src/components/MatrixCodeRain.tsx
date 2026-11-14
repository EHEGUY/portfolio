import { useEffect, useRef, useState } from "react";

export default function MatrixCodeRain() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;

    // High DPI scaling
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const characters =
      "0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ<>/{}=+*~#$λπ∑∫∇";
    const keywords = ["CUDA", "vLLM", "PTR", "NULL", "0x7F", "ASYNC", "VRAM", "RPC", "LLaMA"];

    const fontSize = 13;
    let columns = 0;
    
    // Each column has state: y position, speed, length, characters buffer
    interface Column {
      y: number;
      speed: number;
      length: number;
      chars: string[];
      hasRedAccent: boolean;
      redIndex: number;
    }

    let columnData: Column[] = [];

    const initColumns = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);

      columns = Math.floor(width / (fontSize * 0.85));
      columnData = [];

      for (let i = 0; i < columns; i++) {
        const length = Math.floor(Math.random() * 14) + 8;
        const chars: string[] = [];
        for (let j = 0; j < length; j++) {
          chars.push(characters[Math.floor(Math.random() * characters.length)]);
        }

        // Random chance of having a crimson accent glyph to match portfolio theme
        const hasRed = Math.random() < 0.22;
        const redIndex = Math.floor(Math.random() * length);

        columnData.push({
          y: Math.random() * -height * 1.5, // staggered start above canvas
          speed: Math.random() * 1.4 + 1.1,
          length,
          chars,
          hasRedAccent: hasRed,
          redIndex,
        });
      }

      // Initial clear to pure deep black
      ctx.fillStyle = "#06070a";
      ctx.fillRect(0, 0, width, height);
    };

    initColumns();

    const resizeObserver = new ResizeObserver(() => {
      initColumns();
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    let lastTime = performance.now();
    const fpsInterval = 1000 / 42; // silky smooth ~42 FPS vintage matrix cadence

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      // Trailing fade layer - creates the iconic falling luminescence trail
      ctx.fillStyle = "rgba(6, 7, 10, 0.16)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px 'JetBrains Mono', 'Fira Code', 'Courier New', monospace`;
      ctx.textBaseline = "top";

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      const colWidth = width / columns;

      for (let i = 0; i < columns; i++) {
        const col = columnData[i];
        const x = i * colWidth;

        // Interactive hover warp: columns near mouse speed up and glow
        const distToMouse = Math.hypot(x - mouseX, col.y - mouseY);
        const isNearMouse = distToMouse < 90;
        const currentSpeed = isNearMouse ? col.speed * 2.2 : col.speed;

        col.y += currentSpeed * (fontSize * 0.45);

        // Randomly mutate characters as they fall
        if (Math.random() < 0.07) {
          const randIdx = Math.floor(Math.random() * col.chars.length);
          if (Math.random() < 0.02) {
            // Occasionally inject code keyword fragment
            const kw = keywords[Math.floor(Math.random() * keywords.length)];
            col.chars[randIdx] = kw[Math.floor(Math.random() * kw.length)];
          } else {
            col.chars[randIdx] =
              characters[Math.floor(Math.random() * characters.length)];
          }
        }

        // Draw trail glyphs from bottom (head) to top (tail)
        for (let j = 0; j < col.length; j++) {
          const charY = col.y - j * fontSize;
          if (charY < -fontSize || charY > height + fontSize) continue;

          const char = col.chars[j % col.chars.length];

          if (j === 0) {
            // 1. LEADING GLYPH (Head of the drop): Bright glowing white/mint
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#50fa7b";
            ctx.fillStyle = isNearMouse ? "#ffffff" : "#e6fffa";
            ctx.fillText(char, x, charY);
            ctx.shadowBlur = 0;
          } else if (j <= 2) {
            // 2. High-intensity phosphor green trail
            ctx.fillStyle = isNearMouse ? "#50fa7b" : "#22c55e";
            ctx.fillText(char, x, charY);
          } else if (col.hasRedAccent && j === col.redIndex) {
            // 3. Signature Crimson Glitch Accent (#df2531) matching portfolio theme
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#df2531";
            ctx.fillStyle = "#ff4d5a";
            ctx.fillText(char, x, charY);
            ctx.shadowBlur = 0;
          } else {
            // 4. Smooth gradient fade down the tail
            const opacity = Math.max(0.12, 1 - j / col.length);
            ctx.fillStyle = `rgba(34, 197, 94, ${opacity * 0.75})`;
            ctx.fillText(char, x, charY);
          }
        }

        // Reset column when tail passes beyond bottom
        if (col.y - col.length * fontSize > height) {
          col.y = -Math.random() * 80;
          col.speed = Math.random() * 1.4 + 1.1;
          col.hasRedAccent = Math.random() < 0.22;
          col.redIndex = Math.floor(Math.random() * col.length);
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseLeave = () => {
    mouseRef.current = { x: -1000, y: -1000 };
    setIsHovered(false);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto select-none group">
      {/* 1. Ambient Dual Glow Behind the Terminal (Signature Crimson + Emerald Phosphor) */}
      <div className="absolute -inset-2 bg-gradient-to-r from-[#df2531]/15 via-emerald-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-[#df2531]/10 rounded-full blur-3xl pointer-events-none" />

      {/* 2. Cybernetic Terminal Frame */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[240px] sm:h-[260px] rounded-2xl overflow-hidden border border-white/10 bg-[#06070a]/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col transition-all duration-300 group-hover:border-white/20"
      >
        {/* Top Terminal Header Bar */}
        <div className="h-8 px-3.5 bg-black/60 border-b border-white/10 flex items-center justify-between z-10 shrink-0 font-mono text-[10px] select-none backdrop-blur-sm">
          {/* Traffic Lights + Terminal Title */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#df2531]/80" />
              <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-white/40 ml-1.5 font-medium tracking-wider">
              SYS.MATRIX // STREAM
            </span>
          </div>

          {/* Pulse Status */}
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[9px] tracking-wider text-emerald-400/90">
              {isHovered ? "INTERACTIVE" : "ONLINE"}
            </span>
          </div>
        </div>

        {/* Canvas Area with Top/Bottom Vignette Masks */}
        <div className="relative flex-1 w-full overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Vignette Gradients so rain emerges gracefully and dissolves before edges */}
          <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#06070a] to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#06070a] to-transparent pointer-events-none" />

          {/* Ultra-subtle CRT Scanline Texture Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.45) 2px, rgba(0, 0, 0, 0.45) 4px)",
            }}
          />
        </div>

        {/* Bottom Telemetry Bar Directly Connecting to Beside Projects (LLaMA, CUDA, VRAM) */}
        <div className="h-7 px-3.5 bg-black/60 border-t border-white/10 flex items-center justify-between z-10 shrink-0 font-mono text-[9px] text-[#8b8d98] select-none backdrop-blur-sm">
          <span className="text-white/60 truncate">
            ALLOC: <span className="text-emerald-400 font-semibold">5.8GB VRAM</span>
          </span>
          <span className="text-white/40 tracking-wider">
            LATENCY: <span className="text-[#df2531] font-semibold">&lt;3ms</span>
          </span>
        </div>
      </div>
    </div>
  );
}
