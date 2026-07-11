import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';

export default function BlobCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Smooth physics for the pet blob effect
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      cursorX.set(e.clientX - 16); // Center offset
      cursorY.set(e.clientY - 16); // Center offset
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Detect if hovering over something clickable
      const isClickable = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        target.classList.contains('cursor-pointer') ||
        getComputedStyle(target).cursor === 'pointer';
        
      setIsHovering(isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 z-[1000] pointer-events-none"
      style={{
        x: cursorX,
        y: cursorY,
      }}
    >
      <motion.div
        className="bg-accent rounded-full flex items-center justify-center"
        animate={{
          width: isHovering ? 64 : 32,
          height: isHovering ? 64 : 32,
          x: isHovering ? -16 : 0, // Adjust centering based on size change
          y: isHovering ? -16 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <motion.div 
          className="bg-accent blur-md absolute inset-0 rounded-full"
          animate={{ opacity: isHovering ? 0.8 : 0.4 }}
        />
      </motion.div>
    </motion.div>
  );
}
