/**
 * Reusable animation variants for Framer Motion
 */

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const slideInUp = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
};

export const slideInDown = {
  initial: { y: "-100%" },
  animate: { y: 0 },
  exit: { y: "-100%" },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Transition presets
export const springTransition = {
  type: "spring",
  stiffness: 260,
  damping: 20,
};

export const smoothTransition = {
  duration: 0.3,
  ease: "easeInOut",
};

export const slowTransition = {
  duration: 0.5,
  ease: "easeInOut",
};

// Hover animations
export const hoverScale = {
  scale: 1.05,
  transition: springTransition,
};

export const hoverLift = {
  y: -8,
  transition: springTransition,
};

export const hoverGlow = {
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
  transition: smoothTransition,
};

// Page transitions
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

// Card animations
export const cardHover = {
  scale: 1.02,
  y: -4,
  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
  transition: springTransition,
};

// Button animations
export const buttonTap = {
  scale: 0.95,
};

// Loading animations
export const pulse = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export const spin = {
  rotate: 360,
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: "linear",
  },
};

// Reveal animations
export const revealFromLeft = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export const revealFromRight = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

// Bounce animation
export const bounce = {
  y: [0, -10, 0],
  transition: {
    duration: 0.6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};
