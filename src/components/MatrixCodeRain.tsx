import { useEffect, useRef } from "react";

export default function MatrixCodeRain() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

    // Pure coding characters and numbers
    const characters =
      "01234567890101010123456789{}()<>[];:=+/*-_&|!#$%;";

    const fontSize = 13;
    let columns = 0;

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
        const length = Math.floor(Math.random() * 16) + 10;
        const chars: string[] = [];
        for (let j = 0; j < length; j++) {
          chars.push(characters[Math.floor(Math.random() * characters.length)]);
        }

        const hasRed = Math.random() < 0.2;
        const redIndex = Math.floor(Math.random() * length);

        columnData.push({
          y: Math.random() * -height * 1.5,
          speed: Math.random() * 1.4 + 1.1,
          length,
          chars,
          hasRedAccent: hasRed,
          redIndex,
        });
      }

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
    const fpsInterval = 1000 / 42; // ~42 FPS matrix cadence

    const render = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const elapsed = currentTime - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = currentTime - (elapsed % fpsInterval);

      // Trailing fade layer
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

        // Interactive hover warp
        const distToMouse = Math.hypot(x - mouseX, col.y - mouseY);
        const isNearMouse = distToMouse < 90;
        const currentSpeed = isNearMouse ? col.speed * 2.2 : col.speed;

        col.y += currentSpeed * (fontSize * 0.45);

        // Randomly mutate characters as they fall
        if (Math.random() < 0.08) {
          const randIdx = Math.floor(Math.random() * col.chars.length);
          col.chars[randIdx] =
            characters[Math.floor(Math.random() * characters.length)];
        }

        // Draw trail glyphs from head to tail
        for (let j = 0; j < col.length; j++) {
          const charY = col.y - j * fontSize;
          if (charY < -fontSize || charY > height + fontSize) continue;

          const char = col.chars[j % col.chars.length];

          if (j === 0) {
            // Head: Glowing white/mint
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#50fa7b";
            ctx.fillStyle = isNearMouse ? "#ffffff" : "#e6fffa";
            ctx.fillText(char, x, charY);
            ctx.shadowBlur = 0;
          } else if (j <= 2) {
            // High-intensity phosphor green
            ctx.fillStyle = isNearMouse ? "#50fa7b" : "#22c55e";
            ctx.fillText(char, x, charY);
          } else if (col.hasRedAccent && j === col.redIndex) {
            // Portfolio Crimson accent (#df2531)
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#df2531";
            ctx.fillStyle = "#ff4d5a";
            ctx.fillText(char, x, charY);
            ctx.shadowBlur = 0;
          } else {
            // Tail fade
            const opacity = Math.max(0.12, 1 - j / col.length);
            ctx.fillStyle = `rgba(34, 197, 94, ${opacity * 0.75})`;
            ctx.fillText(char, x, charY);
          }
        }

        // Reset column when tail passes bottom
        if (col.y - col.length * fontSize > height) {
          col.y = -Math.random() * 80;
          col.speed = Math.random() * 1.4 + 1.1;
          col.hasRedAccent = Math.random() < 0.2;
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
  };

  return (
    <div className="relative w-full max-w-sm mx-auto select-none group">
      {/* Ambient Dual Glow */}
      <div className="absolute -inset-2 bg-gradient-to-r from-[#df2531]/15 via-emerald-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-[#df2531]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Frame displaying only the falling coding numbers and symbols */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full h-[250px] sm:h-[270px] rounded-2xl overflow-hidden border border-white/10 bg-[#06070a]/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-300 group-hover:border-white/20"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Soft Vignette Gradients */}
        <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[#06070a] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#06070a] to-transparent pointer-events-none" />

        {/* Scanline Texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.45) 2px, rgba(0, 0, 0, 0.45) 4px)",
          }}
        />
      </div>
    </div>
  );
}
