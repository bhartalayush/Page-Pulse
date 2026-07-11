import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Activity, Network } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import TechBackground from '../components/TechBackground';
import NeuronNetwork from '../components/NeuronNetwork';
import BlobCursor from '../components/BlobCursor';

const slideVariants = {
  initial: { opacity: 0, y: 150, scale: 0.9, rotateX: 10 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    rotateX: 0, 
    transition: { duration: 1.2, type: "spring" as const, bounce: 0.3 } 
  },
  exit: { 
    opacity: 0, 
    y: -150, 
    scale: 0.9, 
    rotateX: -10, 
    transition: { duration: 0.6 } 
  }
};

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [introFinished, setIntroFinished] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const isScrolling = useRef(false);
  const numSections = 4;

  // Lock scroll globally so users can't use scrollbar
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle slide-by-slide scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (isScrolling.current || !introFinished) return;
    
    // Sensitivity threshold to prevent magic mouse accidental triggers
    if (Math.abs(e.deltaY) > 20) {
      if (e.deltaY > 0 && activeSection < numSections - 1) {
        // Scroll Down
        isScrolling.current = true;
        setActiveSection(prev => prev + 1);
        setTimeout(() => (isScrolling.current = false), 1500); // 1.5s lock
      } else if (e.deltaY < 0 && activeSection > 0) {
        // Scroll Up
        isScrolling.current = true;
        setActiveSection(prev => prev - 1);
        setTimeout(() => (isScrolling.current = false), 1500); // 1.5s lock
      }
    }
  };

  // Staggered Title Animation Variants for Hero
  const titleText = "PromptDesk";
  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };
  const letterVariants = {
    hidden: { y: 200, rotateX: 90, opacity: 0 },
    visible: { 
      y: 0, 
      rotateX: 0, 
      opacity: 1, 
      transition: { type: "spring" as const, bounce: 0.3, duration: 1.5 } 
    }
  };

  const sections = ["Home", "Iteration", "Scoring", "Comparison"];

  return (
    <div 
      className="w-full h-screen bg-primary flex flex-col transition-colors overflow-hidden relative perspective-[1000px] cursor-none"
      onWheel={handleWheel}
    >
      
      {/* Custom Global Pet Cursor */}
      <BlobCursor />

      {/* Frosted Top Navigation */}
      <motion.div 
        className="absolute top-0 w-full p-6 flex justify-between items-center z-50 bg-primary/40 backdrop-blur-md border-b border-white/5 dark:border-white/5 cursor-none"
        initial={{ opacity: 0, y: -20 }}
        animate={introFinished ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="flex items-center gap-12">
          <div className="w-[140px] flex items-center cursor-pointer" onClick={() => setActiveSection(0)}>
             {activeSection > 0 && (
                <motion.div 
                  layoutId="brand-logo" 
                  className="flex items-center gap-2 text-2xl font-bold tracking-tighter text-txt"
                >
                  <img src="/logo.jpg" alt="Logo" className="w-8 h-8 rounded-full shadow-sm" />
                  PromptDesk
                </motion.div>
             )}
          </div>

          {/* Named Progress Indicators */}
          <div className="flex gap-8">
            {sections.map((name, i) => (
              <button 
                key={i} 
                onClick={() => setActiveSection(i)}
                className="relative text-sm font-mono tracking-widest uppercase py-2 transition-colors duration-300 group"
              >
                <span className={activeSection === i ? "text-accent font-bold" : "text-txt-muted group-hover:text-txt"}>
                  {name}
                </span>
                {/* Active Indicator Line */}
                <div 
                  className={`absolute bottom-0 left-0 h-0.5 bg-accent transition-all duration-300 ${activeSection === i ? "w-full" : "w-0 group-hover:w-full"}`}
                />
              </button>
            ))}
          </div>
        </div>
        <ThemeToggle />
      </motion.div>

      {/* Persistent Background (Slightly shifts based on activeSection) */}
      <motion.div 
        className="absolute inset-0 w-full h-full" 
        animate={introFinished ? { 
          scale: 1, 
          opacity: 1,
          y: activeSection * -50 // Slight parallax shift
        } : { scale: 1.5, opacity: 0, y: 0 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      >
        <TechBackground />
        <NeuronNetwork />
      </motion.div>

      {/* Main Slide Content Area */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-6 md:px-24">
        <AnimatePresence mode="wait">
          
          {/* SLIDE 0: HERO */}
          {activeSection === 0 && (
            <motion.div 
              key="slide-0"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col items-center justify-center text-center max-w-5xl"
            >
              <div className="overflow-hidden pb-4 pt-16">
                <motion.div layoutId="brand-logo" className="flex justify-center">
                  <motion.h1
                    className="text-[100px] md:text-[180px] lg:text-[240px] font-bold mb-4 leading-none text-txt transition-colors cursor-crosshair flex justify-center"
                    variants={titleVariants}
                    initial="hidden"
                    animate={introFinished ? "visible" : "hidden"}
                  >
                    {titleText.split("").map((char, index) => (
                      <motion.span
                        key={index}
                        variants={letterVariants}
                        whileHover={{ 
                          scale: 1.1, 
                          y: -20,
                          textShadow: "0px 0px 40px var(--theme-accent)",
                          color: "var(--theme-accent)"
                        }}
                        className="inline-block transition-colors duration-300"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.h1>
                </motion.div>
              </div>

              <motion.div
                className="text-xl md:text-3xl italic text-txt-muted mb-12 leading-relaxed transition-colors font-mono"
                initial={{ opacity: 0 }}
                animate={introFinished ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 1.2, delay: 1.5, ease: "easeOut" }}
              >
                {introFinished && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '100%' }}
                    transition={{ duration: 2, delay: 1.5, ease: 'linear' }}
                    className="inline-block overflow-hidden whitespace-nowrap border-r-2 border-accent pr-2 animate-pulse"
                  >
                    &gt; Init Version Control...<br/>
                    &gt; Loading Evaluators...
                  </motion.span>
                )}
              </motion.div>

              <motion.button
                onClick={() => navigate('/dashboard')}
                className="btn-primary text-xl px-16 py-6 rounded-full shadow-[0_0_30px_rgba(var(--theme-accent),0.3)] relative overflow-hidden group mb-8 mt-4"
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={introFinished ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
                whileHover={{ scale: 1.05, y: -5, boxShadow: "0 0 50px var(--theme-accent)" }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.8, delay: 2.5, ease: "easeOut" }}
              >
                <span className="relative z-10 uppercase tracking-widest font-mono text-sm font-bold">Access Terminal</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1s_infinite]" />
              </motion.button>

              <motion.div
                className="text-txt-muted text-sm tracking-widest uppercase font-mono transition-colors"
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                [ Scroll Down to Decrypt ]
              </motion.div>
            </motion.div>
          )}

          {/* SLIDE 1: VERSION CONTROL */}
          {activeSection === 1 && (
            <motion.div 
              key="slide-1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-6xl"
            >
              <div className="group relative bg-secondary h-[500px] md:h-[450px] rounded-[60px] overflow-hidden cursor-crosshair shadow-2xl border border-border hover:border-accent hover:shadow-[0_0_80px_var(--theme-accent)] flex flex-col md:flex-row items-center p-12 gap-16 transition-all duration-500 w-full">
                <div className="w-40 h-40 flex-shrink-0 bg-accent/10 rounded-[40px] flex items-center justify-center group-hover:bg-accent transition-colors duration-500 relative overflow-hidden group-hover:scale-110">
                  <GitBranch className="w-20 h-20 text-accent group-hover:text-white transition-colors duration-500 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                </div>
                <div>
                  <span className="px-6 py-2 bg-accent/10 text-accent text-[12px] font-bold tracking-widest uppercase rounded-full mb-6 inline-block transition-colors font-mono">
                    [sys.Iteration]
                  </span>
                  <h3 className="text-6xl font-bold text-txt mb-6 transition-colors">Version Control</h3>
                  <p className="text-txt-muted text-3xl leading-relaxed transition-colors">
                    Store prompts in folders, track changes over time, and never lose progress. Treat your prompts like source code.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SLIDE 2: EVALUATION */}
          {activeSection === 2 && (
            <motion.div 
              key="slide-2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-6xl"
            >
              <div className="group relative bg-secondary h-[500px] md:h-[450px] rounded-[60px] overflow-hidden cursor-crosshair shadow-2xl border border-border hover:border-accent hover:shadow-[0_0_80px_var(--theme-accent)] flex flex-col md:flex-row-reverse items-center p-12 gap-16 transition-all duration-500 w-full">
                <div className="w-40 h-40 flex-shrink-0 bg-accent/10 rounded-[40px] flex items-center justify-center group-hover:bg-accent transition-colors duration-500 relative overflow-hidden group-hover:scale-110">
                  <Activity className="w-20 h-20 text-accent group-hover:text-white transition-colors duration-500 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                </div>
                <div className="text-left md:text-right">
                  <span className="px-6 py-2 bg-accent/10 text-accent text-[12px] font-bold tracking-widest uppercase rounded-full mb-6 inline-block transition-colors font-mono">
                    [sys.Scoring]
                  </span>
                  <h3 className="text-6xl font-bold text-txt mb-6 transition-colors">AI Evaluators</h3>
                  <p className="text-txt-muted text-3xl leading-relaxed transition-colors">
                    Select particular or all prompts and let AI evaluate them automatically. Get immediate feedback on quality and edge cases.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SLIDE 3: ARENA & TERMINAL */}
          {activeSection === 3 && (
            <motion.div 
              key="slide-3"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-6xl flex flex-col items-center"
            >
              <div className="group relative bg-secondary h-[500px] md:h-[400px] rounded-[60px] overflow-hidden cursor-crosshair shadow-2xl border border-border hover:border-accent hover:shadow-[0_0_80px_var(--theme-accent)] flex flex-col md:flex-row items-center p-12 gap-16 transition-all duration-500 w-full mb-16">
                <div className="w-40 h-40 flex-shrink-0 bg-accent/10 rounded-[40px] flex items-center justify-center group-hover:bg-accent transition-colors duration-500 relative overflow-hidden group-hover:scale-110">
                  <Network className="w-20 h-20 text-accent group-hover:text-white transition-colors duration-500 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                </div>
                <div>
                  <span className="px-6 py-2 bg-accent/10 text-accent text-[12px] font-bold tracking-widest uppercase rounded-full mb-6 inline-block transition-colors font-mono">
                    [sys.Comparison]
                  </span>
                  <h3 className="text-6xl font-bold text-txt mb-6 transition-colors">Model Arena</h3>
                  <p className="text-txt-muted text-3xl leading-relaxed transition-colors">
                    Run a single prompt through multiple LLMs (GPT-4, Claude, Gemini) simultaneously. Compare outputs side-by-side.
                  </p>
                </div>
              </div>

              <motion.button
                onClick={() => navigate('/dashboard')}
                className="btn-primary text-2xl px-24 py-10 rounded-full shadow-[0_0_40px_rgba(var(--theme-accent),0.4)] relative overflow-hidden group"
                whileHover={{ scale: 1.05, y: -5, boxShadow: "0 0 80px var(--theme-accent)" }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.4, delay: 0.5 }}
              >
                <span className="relative z-10 tracking-widest uppercase font-mono font-bold">Access Terminal</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1s_infinite]" />
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Landing;
