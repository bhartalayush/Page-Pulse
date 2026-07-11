import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const NeuronNetwork: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    const connectionDistance = 150;
    const mouseRepelDistance = 150;
    const particleCount = 80;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.05, // Ultra slow (barely move)
          vy: (Math.random() - 0.5) * 0.05,
          radius: Math.random() * 2 + 1
        });
      }
    };

    const getNeuronColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      // Dark mode: slightly lighter blue than the background (e.g., slate/blue-gray)
      // Light mode: light grey
      return isDark ? '60, 80, 110' : '200, 200, 200';
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const color = getNeuronColor();

      // Update and draw particles
      particles.forEach((p, index) => {
        // Movement
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse interaction (attract)
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseRepelDistance) {
          const force = (mouseRepelDistance - dist) / mouseRepelDistance;
          // Add velocity towards mouse (Attract)
          p.vx += (dx / dist) * force * 0.1;
          p.vy += (dy / dist) * force * 0.1;
        }

        // Apply friction to prevent infinite acceleration from mouse attraction
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 0.5) {
          p.vx *= 0.95;
          p.vy *= 0.95;
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, 0.8)`;
        ctx.fill();

        // Connect particles
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const ddx = p.x - p2.x;
          const ddy = p.y - p2.y;
          const distance = Math.sqrt(ddx * ddx + ddy * ddy);

          if (distance < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            // Opacity based on distance
            const opacity = 1 - (distance / connectionDistance);
            ctx.strokeStyle = `rgba(${color}, ${opacity * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80 z-0"
    />
  );
};

export default NeuronNetwork;
