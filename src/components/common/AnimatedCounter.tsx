import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * AnimatedCounter - Displays a number with smooth spring animation
 * Uses Framer Motion spring physics for a natural counting effect
 */
export function AnimatedCounter({
  value,
  className = '',
  prefix = '',
  suffix = ''
}: AnimatedCounterProps) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      {prefix}<motion.span>{display}</motion.span>{suffix}
    </span>
  );
}
