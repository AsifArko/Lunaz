import { useEffect, useRef } from 'react';

interface HeroAnimationProps {
  className?: string;
}

export function HeroAnimation({ className = '' }: HeroAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Aurora wave colors - Grayscale
    const colors = [
      { r: 180, g: 180, b: 180 },   // Light gray
      { r: 140, g: 140, b: 140 },   // Medium gray
      { r: 100, g: 100, b: 100 },   // Dark gray
      { r: 200, g: 200, b: 200 },   // Lighter gray
    ];

    // Draw smooth aurora waves
    const drawAurora = (width: number, height: number) => {
      const layers = 4;
      
      for (let layer = 0; layer < layers; layer++) {
        const color = colors[layer % colors.length];
        const layerOffset = layer * 0.3;
        const amplitude = height * (0.15 + layer * 0.05);
        const baseY = height * (0.3 + layer * 0.15);
        
        ctx.beginPath();
        ctx.moveTo(0, height);
        
        for (let x = 0; x <= width; x += 3) {
          const wave1 = Math.sin((x * 0.003) + time * 0.008 + layerOffset) * amplitude;
          const wave2 = Math.sin((x * 0.005) + time * 0.006 + layerOffset * 2) * (amplitude * 0.5);
          const wave3 = Math.sin((x * 0.001) + time * 0.004) * (amplitude * 0.3);
          const y = baseY + wave1 + wave2 + wave3;
          ctx.lineTo(x, y);
        }
        
        ctx.lineTo(width, height);
        ctx.closePath();
        
        const gradient = ctx.createLinearGradient(0, baseY - amplitude, 0, height);
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.08 - layer * 0.015})`);
        gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.04 - layer * 0.008})`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    };

    // Floating orbs with soft glow
    interface Orb {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      color: { r: number; g: number; b: number };
      speed: number;
      phase: number;
    }

    const orbs: Orb[] = [];

    const initOrbs = () => {
      const rect = canvas.getBoundingClientRect();
      orbs.length = 0;
      
      const orbConfigs = [
        { x: 0.15, y: 0.25, size: 120 },
        { x: 0.85, y: 0.35, size: 100 },
        { x: 0.6, y: 0.2, size: 80 },
        { x: 0.3, y: 0.6, size: 90 },
        { x: 0.75, y: 0.7, size: 70 },
      ];

      orbConfigs.forEach((config, i) => {
        orbs.push({
          x: config.x * rect.width,
          y: config.y * rect.height,
          baseX: config.x * rect.width,
          baseY: config.y * rect.height,
          size: config.size,
          color: colors[i % colors.length],
          speed: 0.5 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
        });
      });
    };

    initOrbs();

    const drawOrbs = () => {
      orbs.forEach((orb) => {
        // Gentle floating motion
        orb.x = orb.baseX + Math.sin(time * 0.01 * orb.speed + orb.phase) * 30;
        orb.y = orb.baseY + Math.cos(time * 0.008 * orb.speed + orb.phase) * 20;

        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.size
        );
        gradient.addColorStop(0, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, 0.15)`);
        gradient.addColorStop(0.4, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, 0.05)`);
        gradient.addColorStop(1, `rgba(${orb.color.r}, ${orb.color.g}, ${orb.color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Subtle grid pattern
    const drawGrid = (width: number, height: number) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      
      const gridSize = 60;
      
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    // Main animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      drawGrid(width, height);
      drawOrbs();
      drawAurora(width, height);

      time++;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
      initOrbs();
    };

    window.removeEventListener('resize', resizeCanvas);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
}
