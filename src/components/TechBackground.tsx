import React from 'react';
import { motion } from 'motion/react';

export default function TechBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated Perspective Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--theme-border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--theme-border) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 100%)',
        }}
      />
      
      {/* Vertical Data Streams (Matrix-lite) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`stream-${i}`}
          className="absolute w-[1px] bg-gradient-to-b from-transparent via-accent to-transparent opacity-40"
          style={{
            left: `${10 + i * 11}%`,
            height: '300px',
            top: '-300px'
          }}
          animate={{
            y: ['0vh', '150vh'],
          }}
          transition={{
            duration: Math.random() * 4 + 4,
            repeat: Infinity,
            ease: 'linear',
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Horizontal Scanner */}
      <motion.div
        className="absolute top-0 left-0 w-full h-[1px] bg-accent opacity-30 shadow-[0_0_20px_2px_var(--theme-accent)]"
        animate={{ y: ['-10vh', '110vh'] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Glowing Tech Nodes */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`node-${i}`}
          className="absolute bg-accent rounded-full"
          style={{
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: '0 0 10px 2px var(--theme-accent)'
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}
