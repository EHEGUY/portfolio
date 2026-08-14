import * as React from "react";
import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AppleSwitch } from "./AppleSwitch";

interface NavbarDockItem {
  label: string;
  href: string;
}

function NavbarDockIcon({
  item,
  mouseX,
  onClick,
}: {
  item: NavbarDockItem;
  mouseX: any;
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const elRef = React.useRef<HTMLAnchorElement>(null);

  const distance = useTransform(mouseX, (val: number) => {
    const el = elRef.current;
    if (!el || val === Infinity) return 200;
    const rect = el.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    return Math.abs(val - center);
  });

  // Scale factor: smooth transition between 1.0 (far away) and 1.35 (directly hovered)
  const scaleRaw = useTransform(distance, [0, 120], [1.35, 1.0]);
  const scale = useSpring(scaleRaw, {
    stiffness: 400,
    damping: 25,
    mass: 0.4,
  });

  // Vertical lift offset: raises the hovered text slightly
  const yRaw = useTransform(distance, [0, 120], [-4, 0]);
  const y = useSpring(yRaw, {
    stiffness: 400,
    damping: 25,
    mass: 0.4,
  });

  return (
    <motion.a
      ref={elRef}
      href={item.href}
      onClick={onClick}
      style={{ scale, y }}
      className="nav-item-link"
    >
      {item.label}
    </motion.a>
  );
}

function NavbarDock({ items }: { items: NavbarDockItem[] }) {
  const mouseX = useMotionValue(Infinity);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="navbar-dock-container"
    >
      {items.map((item) => (
        <NavbarDockIcon
          key={item.label}
          item={item}
          mouseX={mouseX}
          onClick={(e) => handleScroll(e, item.href)}
        />
      ))}
    </div>
  );
}

export default function Navbar() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const navItems: NavbarDockItem[] = [
    { label: "Skills", href: "#skills" },
    { label: "Projects", href: "#projects" },
    { label: "Experience", href: "#experience" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav>
      <span className="nav-name">Siddhant Tantarpale</span>
      <div className="nav-links">
        <NavbarDock items={navItems} />
        <span className="nav-badge">🟢 Open to opportunities</span>
        <AppleSwitch
          checked={theme === "dark"}
          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          size="sm"
          tone="accent"
          aria-label="Toggle dark mode"
        />
      </div>
    </nav>
  );
}
