import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface IntroLoaderProps {
  onComplete: () => void;
}

export default function IntroLoader({ onComplete }: IntroLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Clean minimal timeout for the geometric intro
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setTimeout(onComplete, 1200); // Trigger completion after curtain lifts
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isLoaded && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
          exit={{ y: "-100%" }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }} // Cinematic awwwards bezier
        >
          <div className="relative flex flex-col items-center justify-center">
            {/* Minimalist Pulsing Ring */}
            <motion.div
              className="w-32 h-32 border-[1px] border-white/20 rounded-full flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.2, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
            >
              <motion.div 
                className="w-16 h-16 bg-white/10 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, delay: 0.2 }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
