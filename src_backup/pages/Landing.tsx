import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Activity, Network } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-parchment flex flex-col">
      {/* Hero Section */}
      <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black text-white">
        
        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.h1
            className="text-6xl md:text-[120px] font-bold mb-6 tracking-tighter leading-tight text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          >
            PromptDesk
          </motion.h1>

          <motion.p
            className="text-xl md:text-3xl italic text-gray-400 mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
          >
            Version and test LLM prompts with eval dashboards. <br/>
            Stop guessing, start measuring.
          </motion.p>

          <motion.button
            onClick={() => navigate('/dashboard')}
            className="btn-primary text-xl px-16 py-5 rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          >
            Get Started
          </motion.button>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 text-gray-500 text-sm tracking-widest uppercase font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
        >
          Scroll to explore features
        </motion.div>
      </div>

      {/* Feature Cards Section (Scroll Reveal) */}
      <div className="w-full max-w-7xl mx-auto px-8 md:px-24 py-32 space-y-32">
        <div className="flex flex-col items-center text-center space-y-6">
          <h2 className="text-6xl md:text-7xl font-bold text-ink">Built for AI Engineers</h2>
          <div className="w-32 h-1.5 bg-gold rounded-full" />
        </div>

        <div className="grid grid-cols-1 gap-24">
          {/* Feature 1: Version Control */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ y: -15 }}
            className="group relative bg-white h-[500px] md:h-[400px] rounded-[60px] overflow-hidden cursor-pointer shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-2 border-gold/10 flex flex-col md:flex-row items-center p-12 gap-12"
          >
            <div className="w-32 h-32 flex-shrink-0 bg-gold/10 rounded-[40px] flex items-center justify-center group-hover:bg-gold transition-colors duration-500">
              <GitBranch className="w-16 h-16 text-gold group-hover:text-white transition-colors duration-500" />
            </div>
            <div>
              <span className="px-6 py-2 bg-gold/10 text-gold text-[12px] font-bold tracking-widest uppercase rounded-full mb-6 inline-block">
                Iteration
              </span>
              <h3 className="text-5xl font-bold text-ink mb-6">Version Control</h3>
              <p className="text-ink/60 text-2xl leading-relaxed">
                Store prompts in folders, track changes over time, and never lose progress. Treat your prompts like source code.
              </p>
            </div>
          </motion.div>

          {/* Feature 2: Evaluation */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            whileHover={{ y: -15 }}
            className="group relative bg-white h-[500px] md:h-[400px] rounded-[60px] overflow-hidden cursor-pointer shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-2 border-gold/10 flex flex-col md:flex-row items-center p-12 gap-12"
          >
            <div className="w-32 h-32 flex-shrink-0 bg-gold/10 rounded-[40px] flex items-center justify-center group-hover:bg-gold transition-colors duration-500">
              <Activity className="w-16 h-16 text-gold group-hover:text-white transition-colors duration-500" />
            </div>
            <div>
              <span className="px-6 py-2 bg-gold/10 text-gold text-[12px] font-bold tracking-widest uppercase rounded-full mb-6 inline-block">
                Scoring
              </span>
              <h3 className="text-5xl font-bold text-ink mb-6">AI Evaluators</h3>
              <p className="text-ink/60 text-2xl leading-relaxed">
                Select particular or all prompts and let AI evaluate them automatically. Get immediate feedback on quality and edge cases.
              </p>
            </div>
          </motion.div>

          {/* Feature 3: LLM Arena */}
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            whileHover={{ y: -15 }}
            className="group relative bg-white h-[500px] md:h-[400px] rounded-[60px] overflow-hidden cursor-pointer shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-2 border-gold/10 flex flex-col md:flex-row items-center p-12 gap-12"
          >
            <div className="w-32 h-32 flex-shrink-0 bg-gold/10 rounded-[40px] flex items-center justify-center group-hover:bg-gold transition-colors duration-500">
              <Network className="w-16 h-16 text-gold group-hover:text-white transition-colors duration-500" />
            </div>
            <div>
              <span className="px-6 py-2 bg-gold/10 text-gold text-[12px] font-bold tracking-widest uppercase rounded-full mb-6 inline-block">
                Comparison
              </span>
              <h3 className="text-5xl font-bold text-ink mb-6">Model Arena</h3>
              <p className="text-ink/60 text-2xl leading-relaxed">
                Run a single prompt through multiple LLMs (GPT-4, Claude, Gemini) simultaneously. Compare outputs side-by-side to find the perfect match.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="py-20 flex justify-center">
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="btn-primary text-2xl px-20 py-8 rounded-full shadow-[0_30px_60px_-15px_rgba(201,163,78,0.5)]"
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
