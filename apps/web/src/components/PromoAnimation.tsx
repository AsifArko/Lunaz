import { useEffect, useRef } from 'react';

interface PromoAnimationProps {
  className?: string;
}

export function PromoAnimation({ className = '' }: PromoAnimationProps) {
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

    // Grayscale colors for promo animation
    const colors = [
      { r: 220, g: 220, b: 220 },   // Very light gray
      { r: 160, g: 160, b: 160 },   // Medium light gray
      { r: 120, g: 120, b: 120 },   // Medium gray
      { r: 180, g: 180, b: 180 },   // Light gray
    ];

    // Draw flowing waves from center
    const drawWaves = (width: number, height: number) => {
      const centerX = width / 2;
      const centerY = height / 2;
      const layers = 5;
      
      for (let layer = 0; layer < layers; layer++) {
        const color = colors[layer % colors.length];
        const maxRadius = Math.max(width, height) * (0.3 + layer * 0.15);
        const waveOffset = time * 0.02 + layer * 0.5;
        
        ctx.beginPath();
        
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.02) {
          const wave1 = Math.sin(angle * 3 + waveOffset) * 30;
          const wave2 = Math.cos(angle * 5 + waveOffset * 0.7) * 20;
          const wave3 = Math.sin(angle * 2 + waveOffset * 1.3) * 15;
          const radius = maxRadius + wave1 + wave2 + wave3;
          
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, maxRadius * 1.5
        );
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.03 - layer * 0.005})`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.06 - layer * 0.01})`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    };

    // Floating particles
    interface Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      brightness: number;
      speed: number;
      phase: number;
    }

    const particles: Particle[] = [];

    const initParticles = () => {
      const rect = canvas.getBoundingClientRect();
      particles.length = 0;
      
      const particleConfigs = [
        { x: 0.2, y: 0.3, size: 80 },
        { x: 0.8, y: 0.4, size: 60 },
        { x: 0.5, y: 0.2, size: 70 },
        { x: 0.3, y: 0.7, size: 50 },
        { x: 0.7, y: 0.6, size: 65 },
        { x: 0.15, y: 0.5, size: 45 },
        { x: 0.85, y: 0.25, size: 55 },
      ];

      particleConfigs.forEach((config, i) => {
        particles.push({
          x: config.x * rect.width,
          y: config.y * rect.height,
          baseX: config.x * rect.width,
          baseY: config.y * rect.height,
          size: config.size,
          brightness: 150 + (i * 15) % 80,
          speed: 0.3 + Math.random() * 0.4,
          phase: Math.random() * Math.PI * 2,
        });
      });
    };

    initParticles();

    const drawParticles = () => {
      particles.forEach((particle) => {
        // Gentle floating motion
        particle.x = particle.baseX + Math.sin(time * 0.008 * particle.speed + particle.phase) * 25;
        particle.y = particle.baseY + Math.cos(time * 0.006 * particle.speed + particle.phase) * 18;

        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        );
        const b = particle.brightness;
        gradient.addColorStop(0, `rgba(${b}, ${b}, ${b}, 0.12)`);
        gradient.addColorStop(0.4, `rgba(${b}, ${b}, ${b}, 0.04)`);
        gradient.addColorStop(1, `rgba(${b}, ${b}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Subtle connecting lines
    const drawConnections = (width: number, height: number) => {
      const centerX = width / 2;
      const centerY = height / 2;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.002;
        const length = Math.min(width, height) * 0.4;
        const wobble = Math.sin(time * 0.01 + i) * 20;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * (length + wobble),
          centerY + Math.sin(angle) * (length + wobble)
        );
        ctx.stroke();
      }
    };

    // Main animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      drawConnections(width, height);
      drawParticles();
      drawWaves(width, height);

      time++;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
      initParticles();
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
