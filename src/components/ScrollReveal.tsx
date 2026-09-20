import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  yOffset?: number;
  className?: string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  yOffset = 16,
  className = '',
  id,
  onClick,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Failsafe timer: ensures content becomes visible even if IntersectionObserver
    // is delayed or doesn't fire inside nested iframes or with reduced-motion preferences
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100 + Math.min(delay * 800, 400));
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: yOffset }}
      animate={isVisible ? { opacity: 1, y: 0 } : undefined}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{
        duration: 0.4,
        delay,
        ease: 'easeOut',
      }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

