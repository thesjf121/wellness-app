import { useInView } from 'framer-motion';
import { useRef } from 'react';

interface StaggerOptions {
  threshold?: number;
  margin?: string;
  once?: boolean;
  staggerDelay?: number;
  totalItems?: number;
}

export const useScrollStagger = (
  index: number = 0,
  options: StaggerOptions = {}
) => {
  const {
    threshold = 0.1,
    margin = "-50px 0px -50px 0px",
    once = true,
    staggerDelay = 0.1,
    totalItems = 1
  } = options;

  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
    margin
  });

  const delay = index * staggerDelay;
  
  const variants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
      filter: 'blur(4px)'
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  };

  return {
    ref,
    isInView,
    variants,
    containerVariants,
    initial: "hidden",
    animate: isInView ? "visible" : "hidden",
    delay
  };
};

export const useScrollReveal = (options: Omit<StaggerOptions, 'staggerDelay' | 'totalItems'> = {}) => {
  const {
    threshold = 0.1,
    margin = "-50px 0px -50px 0px",
    once = true
  } = options;

  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
    margin
  });

  const variants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.95,
      filter: 'blur(4px)'
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return {
    ref,
    isInView,
    variants,
    initial: "hidden",
    animate: isInView ? "visible" : "hidden"
  };
};