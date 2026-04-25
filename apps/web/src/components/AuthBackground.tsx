import { useEffect, useRef, useMemo } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AuthBackgroundConfig {
  /** Background color (hex) */
  backgroundColor?: string;
  /** Line color for illustrations (hex) */
  lineColor?: string;
  /** Line width */
  lineWidth?: number;
  /** Number of illustrations */
  illustrationCount?: number;
  /** Animation speed multiplier (0.1 - 2.0) */
  speed?: number;
  /** Line opacity (0.0 - 1.0) */
  opacity?: number;
}

type IllustrationType =
  | 'vase'
  | 'yarn'
  | 'scissors'
  | 'brush'
  | 'plant'
  | 'basket'
  | 'needle'
  | 'palette'
  | 'cup'
  | 'leaf';

interface Illustration {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  rotationSpeed: number;
  type: IllustrationType;
  opacity: number;
  floatPhase: number;
  floatSpeed: number;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: Required<AuthBackgroundConfig> = {
  backgroundColor: '#F5F5F5',
  lineColor: '#9CA3AF',
  lineWidth: 1.5,
  illustrationCount: 8,
  speed: 0.3,
  opacity: 0.7,
};

// ============================================================================
// Component Props
// ============================================================================

interface AuthBackgroundProps {
  config?: AuthBackgroundConfig;
  className?: string;
}

// ============================================================================
// Main Component
// ============================================================================

export function AuthBackground({ config = {}, className = '' }: AuthBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const illustrationsRef = useRef<Illustration[]>([]);
  const timeRef = useRef<number>(0);

  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const illustrationTypes: IllustrationType[] = [
      'vase',
      'yarn',
      'scissors',
      'brush',
      'plant',
      'basket',
      'needle',
      'palette',
      'cup',
      'leaf',
    ];

    // Define placement zones around the edges (avoiding center)
    const getPlacementZones = () => {
      const margin = 60; // margin from edge
      const zoneSize = 80; // size of each placement zone

      // 8 zones: 4 corners + 4 edge midpoints
      return [
        // Top-left corner
        { x: margin + zoneSize / 2, y: margin + zoneSize / 2 },
        // Top-right corner
        { x: width - margin - zoneSize / 2, y: margin + zoneSize / 2 },
        // Bottom-left corner
        { x: margin + zoneSize / 2, y: height - margin - zoneSize / 2 },
        // Bottom-right corner
        { x: width - margin - zoneSize / 2, y: height - margin - zoneSize / 2 },
        // Left edge middle
        { x: margin + zoneSize / 2, y: height * 0.5 },
        // Right edge middle
        { x: width - margin - zoneSize / 2, y: height * 0.5 },
        // Top edge middle (offset to sides to avoid header text)
        { x: width * 0.2, y: margin + zoneSize / 2 },
        // Top edge middle right
        { x: width * 0.8, y: margin + zoneSize / 2 },
        // Bottom edge left
        { x: width * 0.25, y: height - margin - zoneSize / 2 },
        // Bottom edge right
        { x: width * 0.75, y: height - margin - zoneSize / 2 },
      ];
    };

    // Initialize illustrations - uniform distribution, no duplicates
    const initIllustrations = () => {
      illustrationsRef.current = [];

      const zones = getPlacementZones();

      // Shuffle illustration types to get random unique ones
      const shuffledTypes = [...illustrationTypes].sort(() => Math.random() - 0.5);
      const count = Math.min(
        mergedConfig.illustrationCount,
        illustrationTypes.length,
        zones.length
      );

      // Shuffle zones too for variety
      const shuffledZones = [...zones].sort(() => Math.random() - 0.5);

      for (let i = 0; i < count; i++) {
        const zone = shuffledZones[i];
        // Add small random offset within zone
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;

        illustrationsRef.current.push({
          x: zone.x + offsetX,
          y: zone.y + offsetY,
          scale: 0.55 + Math.random() * 0.3,
          rotation: Math.random() * Math.PI * 0.2 - Math.PI * 0.1,
          rotationSpeed: (Math.random() - 0.5) * 0.0002,
          type: shuffledTypes[i],
          opacity: 0.8 + Math.random() * 0.2,
          floatPhase: Math.random() * Math.PI * 2,
          floatSpeed: 0.006 + Math.random() * 0.006,
        });
      }
    };

    // Draw handcraft illustrations
    const drawIllustration = (ill: Illustration) => {
      const time = timeRef.current;
      const floatY = Math.sin(ill.floatPhase + time * ill.floatSpeed) * 3;

      ctx.save();
      ctx.translate(ill.x, ill.y + floatY);
      ctx.rotate(ill.rotation);
      ctx.scale(ill.scale, ill.scale);

      ctx.strokeStyle = mergedConfig.lineColor;
      ctx.lineWidth = mergedConfig.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = ill.opacity * mergedConfig.opacity;

      const s = 35; // base size

      switch (ill.type) {
        case 'vase':
          // Simple pottery vase
          ctx.beginPath();
          ctx.moveTo(-s * 0.3, s * 0.5);
          ctx.quadraticCurveTo(-s * 0.5, 0, -s * 0.2, -s * 0.3);
          ctx.quadraticCurveTo(0, -s * 0.5, s * 0.2, -s * 0.3);
          ctx.quadraticCurveTo(s * 0.5, 0, s * 0.3, s * 0.5);
          ctx.lineTo(-s * 0.3, s * 0.5);
          ctx.stroke();
          // Neck
          ctx.beginPath();
          ctx.moveTo(-s * 0.15, -s * 0.3);
          ctx.lineTo(-s * 0.12, -s * 0.45);
          ctx.lineTo(s * 0.12, -s * 0.45);
          ctx.lineTo(s * 0.15, -s * 0.3);
          ctx.stroke();
          break;

        case 'yarn':
          // Ball of yarn
          ctx.beginPath();
          ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
          ctx.stroke();
          // Yarn lines
          ctx.beginPath();
          ctx.arc(s * 0.1, -s * 0.05, s * 0.25, 0.5, 2.5);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(-s * 0.1, s * 0.1, s * 0.2, -0.5, 1.5);
          ctx.stroke();
          // Loose end
          ctx.beginPath();
          ctx.moveTo(s * 0.3, s * 0.15);
          ctx.quadraticCurveTo(s * 0.5, s * 0.3, s * 0.4, s * 0.5);
          ctx.stroke();
          break;

        case 'scissors':
          // Scissors
          ctx.beginPath();
          // Handle 1
          ctx.ellipse(-s * 0.25, s * 0.25, s * 0.15, s * 0.1, Math.PI * 0.25, 0, Math.PI * 2);
          ctx.stroke();
          // Handle 2
          ctx.beginPath();
          ctx.ellipse(s * 0.25, s * 0.25, s * 0.15, s * 0.1, -Math.PI * 0.25, 0, Math.PI * 2);
          ctx.stroke();
          // Blades
          ctx.beginPath();
          ctx.moveTo(-s * 0.15, s * 0.15);
          ctx.lineTo(s * 0.05, -s * 0.4);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s * 0.15, s * 0.15);
          ctx.lineTo(-s * 0.05, -s * 0.4);
          ctx.stroke();
          break;

        case 'brush':
          // Paint brush
          ctx.beginPath();
          // Handle
          ctx.moveTo(0, s * 0.5);
          ctx.lineTo(0, -s * 0.1);
          ctx.stroke();
          // Ferrule
          ctx.beginPath();
          ctx.rect(-s * 0.08, -s * 0.15, s * 0.16, s * 0.1);
          ctx.stroke();
          // Bristles
          ctx.beginPath();
          ctx.moveTo(-s * 0.1, -s * 0.15);
          ctx.lineTo(-s * 0.12, -s * 0.45);
          ctx.quadraticCurveTo(0, -s * 0.5, s * 0.12, -s * 0.45);
          ctx.lineTo(s * 0.1, -s * 0.15);
          ctx.stroke();
          break;

        case 'plant':
          // Potted plant
          // Pot
          ctx.beginPath();
          ctx.moveTo(-s * 0.25, s * 0.1);
          ctx.lineTo(-s * 0.2, s * 0.45);
          ctx.lineTo(s * 0.2, s * 0.45);
          ctx.lineTo(s * 0.25, s * 0.1);
          ctx.closePath();
          ctx.stroke();
          // Pot rim
          ctx.beginPath();
          ctx.rect(-s * 0.28, s * 0.05, s * 0.56, s * 0.08);
          ctx.stroke();
          // Leaves
          ctx.beginPath();
          ctx.moveTo(0, s * 0.05);
          ctx.quadraticCurveTo(-s * 0.3, -s * 0.2, -s * 0.15, -s * 0.4);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, s * 0.05);
          ctx.quadraticCurveTo(s * 0.3, -s * 0.15, s * 0.2, -s * 0.35);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, s * 0.05);
          ctx.quadraticCurveTo(s * 0.1, -s * 0.3, 0, -s * 0.5);
          ctx.stroke();
          break;

        case 'basket':
          // Woven basket
          ctx.beginPath();
          ctx.moveTo(-s * 0.35, s * 0.1);
          ctx.quadraticCurveTo(-s * 0.4, s * 0.4, 0, s * 0.45);
          ctx.quadraticCurveTo(s * 0.4, s * 0.4, s * 0.35, s * 0.1);
          ctx.stroke();
          // Rim
          ctx.beginPath();
          ctx.ellipse(0, s * 0.1, s * 0.35, s * 0.1, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Weave pattern
          ctx.beginPath();
          ctx.moveTo(-s * 0.25, s * 0.25);
          ctx.lineTo(s * 0.25, s * 0.25);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-s * 0.2, s * 0.35);
          ctx.lineTo(s * 0.2, s * 0.35);
          ctx.stroke();
          break;

        case 'needle':
          // Sewing needle with thread
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.5);
          ctx.lineTo(0, s * 0.4);
          ctx.stroke();
          // Eye
          ctx.beginPath();
          ctx.ellipse(0, -s * 0.35, s * 0.03, s * 0.06, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Thread
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.35);
          ctx.quadraticCurveTo(s * 0.3, -s * 0.2, s * 0.2, s * 0.1);
          ctx.quadraticCurveTo(s * 0.1, s * 0.3, s * 0.25, s * 0.45);
          ctx.stroke();
          break;

        case 'palette':
          // Artist palette
          ctx.beginPath();
          ctx.ellipse(0, 0, s * 0.4, s * 0.3, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Thumb hole
          ctx.beginPath();
          ctx.ellipse(-s * 0.2, s * 0.05, s * 0.08, s * 0.06, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Paint spots
          ctx.beginPath();
          ctx.arc(s * 0.15, -s * 0.1, s * 0.06, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(s * 0.05, s * 0.1, s * 0.05, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(s * 0.2, s * 0.08, s * 0.04, 0, Math.PI * 2);
          ctx.stroke();
          break;

        case 'cup':
          // Coffee/tea cup
          ctx.beginPath();
          ctx.moveTo(-s * 0.25, -s * 0.2);
          ctx.lineTo(-s * 0.2, s * 0.25);
          ctx.quadraticCurveTo(0, s * 0.35, s * 0.2, s * 0.25);
          ctx.lineTo(s * 0.25, -s * 0.2);
          ctx.stroke();
          // Rim
          ctx.beginPath();
          ctx.ellipse(0, -s * 0.2, s * 0.25, s * 0.08, 0, 0, Math.PI * 2);
          ctx.stroke();
          // Handle
          ctx.beginPath();
          ctx.moveTo(s * 0.25, -s * 0.1);
          ctx.quadraticCurveTo(s * 0.45, 0, s * 0.25, s * 0.15);
          ctx.stroke();
          // Steam
          ctx.beginPath();
          ctx.moveTo(-s * 0.1, -s * 0.35);
          ctx.quadraticCurveTo(-s * 0.15, -s * 0.45, -s * 0.1, -s * 0.5);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s * 0.05, -s * 0.35);
          ctx.quadraticCurveTo(s * 0.1, -s * 0.45, s * 0.05, -s * 0.55);
          ctx.stroke();
          break;

        case 'leaf':
          // Decorative leaf
          ctx.beginPath();
          ctx.moveTo(0, s * 0.4);
          ctx.quadraticCurveTo(-s * 0.35, s * 0.1, -s * 0.2, -s * 0.3);
          ctx.quadraticCurveTo(0, -s * 0.5, s * 0.2, -s * 0.3);
          ctx.quadraticCurveTo(s * 0.35, s * 0.1, 0, s * 0.4);
          ctx.stroke();
          // Center vein
          ctx.beginPath();
          ctx.moveTo(0, s * 0.35);
          ctx.lineTo(0, -s * 0.35);
          ctx.stroke();
          // Side veins
          ctx.beginPath();
          ctx.moveTo(0, s * 0.1);
          ctx.lineTo(-s * 0.15, -s * 0.05);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, s * 0.1);
          ctx.lineTo(s * 0.15, -s * 0.05);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.1);
          ctx.lineTo(-s * 0.12, -s * 0.22);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.1);
          ctx.lineTo(s * 0.12, -s * 0.22);
          ctx.stroke();
          break;
      }

      ctx.restore();
    };

    // Update illustration rotations
    const updateIllustrations = () => {
      illustrationsRef.current.forEach((ill) => {
        ill.rotation += ill.rotationSpeed * mergedConfig.speed;
      });
    };

    // Handle resize
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      initIllustrations();
    };

    resizeCanvas();

    // Animation loop
    const animate = () => {
      // Fill background
      ctx.fillStyle = mergedConfig.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Update and draw illustrations
      updateIllustrations();
      illustrationsRef.current.forEach(drawIllustration);

      timeRef.current += 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [mergedConfig]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// Preset Configurations
// ============================================================================

/** Subtle preset - light background with visible illustrations */
export const PRESET_SUBTLE: AuthBackgroundConfig = {
  backgroundColor: '#F7F7F7',
  lineColor: '#A0A0A0',
  lineWidth: 1.5,
  illustrationCount: 8,
  speed: 0.3,
  opacity: 0.6,
};

/** Elegant preset - refined look */
export const PRESET_ELEGANT: AuthBackgroundConfig = {
  backgroundColor: '#FAFAFA',
  lineColor: '#9CA3AF',
  lineWidth: 1.5,
  illustrationCount: 8,
  speed: 0.2,
  opacity: 0.55,
};

/** Minimal preset - fewer illustrations */
export const PRESET_MINIMAL: AuthBackgroundConfig = {
  backgroundColor: '#F8F8F8',
  lineColor: '#B0B0B0',
  lineWidth: 1.2,
  illustrationCount: 6,
  speed: 0.2,
  opacity: 0.5,
};

/** Dense preset - more illustrations */
export const PRESET_DENSE: AuthBackgroundConfig = {
  backgroundColor: '#F5F5F5',
  lineColor: '#8B8B8B',
  lineWidth: 1.5,
  illustrationCount: 10,
  speed: 0.25,
  opacity: 0.6,
};

/** Dark preset - dark background */
export const PRESET_DARK: AuthBackgroundConfig = {
  backgroundColor: '#1F2937',
  lineColor: '#6B7280',
  lineWidth: 1.5,
  illustrationCount: 8,
  speed: 0.3,
  opacity: 0.7,
};

/** Warm gray preset */
export const PRESET_WARM_GRAY: AuthBackgroundConfig = {
  backgroundColor: '#FAF9F7',
  lineColor: '#A8A29E',
  lineWidth: 1.5,
  illustrationCount: 8,
  speed: 0.3,
  opacity: 0.6,
};

export default AuthBackground;
