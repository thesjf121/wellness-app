import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  offset?: number;
}

interface ParallaxContainerProps {
  children: React.ReactNode;
  className?: string;
  backgroundGradient?: string;
}

export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed = 0.5,
  className = '',
  offset = 0
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, offset + (speed * 100)]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  children,
  className = '',
  backgroundGradient = 'from-blue-50 via-white to-purple-50'
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
        setMousePosition({ x: x * 20, y: y * 20 });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${backgroundGradient} ${className}`}
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
      >
        {/* Floating geometric shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl" />
        <div className="absolute top-32 right-20 w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-15 blur-2xl" />
        <div className="absolute bottom-40 left-20 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-25 blur-lg" />
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 blur-xl" />
        
        {/* Additional ambient shapes */}
        <div className="absolute top-1/3 left-1/3 w-12 h-12 bg-gradient-to-r from-indigo-400 to-cyan-500 rounded-full opacity-10 blur-lg" />
        <div className="absolute top-2/3 right-1/3 w-28 h-28 bg-gradient-to-r from-rose-400 to-orange-500 rounded-full opacity-15 blur-2xl" />
      </motion.div>

      {/* Content with parallax layers */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        initial={{ opacity: 1, y: 0 }}
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="flex flex-col items-center space-y-2 text-gray-400">
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-gray-400 rounded-full mt-2"
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
          <span className="text-xs font-medium">Scroll</span>
        </div>
      </motion.div>
    </div>
  );
};

// Hook for scroll-based animations
export const useParallaxScroll = (speed: number = 0.5) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 0.8, 0.6, 0.4]);
  
  return { y, opacity, scrollYProgress };
};

// Preset parallax configurations
export const parallaxPresets = {
  homepage: {
    backgroundGradient: 'from-green-50 via-blue-50 to-purple-50',
    layers: [
      { speed: 0.2, offset: -50 },
      { speed: 0.5, offset: 0 },
      { speed: 0.8, offset: 50 }
    ]
  },
  dashboard: {
    backgroundGradient: 'from-blue-50 via-indigo-50 to-purple-50',
    layers: [
      { speed: 0.3, offset: -30 },
      { speed: 0.6, offset: 0 },
      { speed: 0.9, offset: 30 }
    ]
  },
  food: {
    backgroundGradient: 'from-green-50 via-emerald-50 to-teal-50',
    layers: [
      { speed: 0.25, offset: -40 },
      { speed: 0.55, offset: 0 },
      { speed: 0.85, offset: 40 }
    ]
  },
  training: {
    backgroundGradient: 'from-purple-50 via-blue-50 to-indigo-50',
    layers: [
      { speed: 0.35, offset: -35 },
      { speed: 0.65, offset: 0 },
      { speed: 0.95, offset: 35 }
    ]
  },
  steps: {
    backgroundGradient: 'from-orange-50 via-yellow-50 to-red-50',
    layers: [
      { speed: 0.3, offset: -25 },
      { speed: 0.6, offset: 0 },
      { speed: 0.9, offset: 25 }
    ]
  },
  groups: {
    backgroundGradient: 'from-pink-50 via-purple-50 to-indigo-50',
    layers: [
      { speed: 0.4, offset: -45 },
      { speed: 0.7, offset: 0 },
      { speed: 1.0, offset: 45 }
    ]
  },
  profile: {
    backgroundGradient: 'from-gray-50 via-blue-50 to-purple-50',
    layers: [
      { speed: 0.2, offset: -20 },
      { speed: 0.5, offset: 0 },
      { speed: 0.8, offset: 20 }
    ]
  }
};