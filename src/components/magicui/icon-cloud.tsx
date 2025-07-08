"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";

interface IconCloudProps {
  iconSlugs: string[];
}

type IconData = {
  x: number;
  y: number;
  z: number;
  slug: string;
};

export function IconCloud({ iconSlugs }: IconCloudProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  const iconData = useMemo(() => {
    const phi = Math.PI * (3.0 - Math.sqrt(5.0)); // golden angle in radians
    return iconSlugs.map((slug, i) => {
      const y = 1 - (i / (iconSlugs.length - 1)) * 2; // y goes from 1 to -1
      const radius = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      return { x, y, z, slug };
    });
  }, [iconSlugs]);

  const rotationState = useRef({
    mouseX: 0,
    mouseY: 0,
    velocityX: 0,
    velocityY: 0,
    rotationX: 0,
    rotationY: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const { current: state } = rotationState;
      state.mouseX = clientX;
      state.mouseY = clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    let animationFrameId: number;

    const animate = () => {
      const { current: state } = rotationState;

      if (isHovered && containerRef.current) {
        const { width, height } =
          containerRef.current.getBoundingClientRect();

        // Update velocity based on mouse position
        state.velocityX = (state.mouseX - width / 2) * width * 0.5;
        state.velocityY = (state.mouseY - height / 2) * height * 0.5;

        state.rotationY += state.velocityX * 0.01;
        state.rotationX -= state.velocityY * 0.01;
      } else {
        // Slow constant rotation
        state.rotationY += 0.001;
      }


      // Apply transformations to each icon
      const sinX = Math.sin(state.rotationX);
      const cosX = Math.cos(state.rotationX);
      const sinY = Math.sin(state.rotationY);
      const cosY = Math.cos(state.rotationY);

      iconData.forEach((icon, i) => {
        const ref = iconRefs.current[i];
        if (!ref) return;

        // Rotate Y
        let x1 = icon.x * cosY - icon.z * sinY;
        let z1 = icon.x * sinY + icon.z * cosY;

        // Rotate X
        let y2 = icon.y * cosX - z1 * sinX;
        let z2 = icon.y * sinX + z1 * cosX;

        const scale = (z2 + 2) / 3;
        const transform = `translate3d(${(x1 * 150).toFixed(2)}px, ${(y2 * 150).toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
        const opacity = (z2 + 1.5) / 2.5;

        ref.style.transform = transform;
        ref.style.opacity = `${Math.max(0, opacity).toFixed(3)}`;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMounted, iconData, isHovered]);
  
  const iconColor = resolvedTheme === 'dark' ? 'white' : 'black';

  if (!isMounted) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex h-full w-full items-center justify-center"
      style={{ perspective: "1000px" }}
    >
      <div className="absolute h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        {iconData.map((icon, i) => (
          <div
            key={`${icon.slug}-${i}`}
            ref={(el) => (iconRefs.current[i] = el)}
            className="absolute flex h-[50px] w-[50px] items-center justify-center"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              transition: "transform 0.2s, opacity 0.2s",
              opacity: 0,
            }}
          >
             <img
              src={`https://cdn.simpleicons.org/${icon.slug}/${iconColor}`}
              alt={icon.slug}
              className="h-full w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
