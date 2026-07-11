import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = (event: React.MouseEvent) => {
    // Fallback for browsers that don't support View Transitions
    if (!(document as any).startViewTransition) {
      setIsDark(!isDark);
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    const transition = (document as any).startViewTransition(() => {
      setIsDark(!isDark);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];

      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: isDark ? '::view-transition-old(root)' : '::view-transition-new(root)'
        }
      );
    });
  };

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
      title="Toggle Theme"
    >
      {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-accent" />}
    </button>
  );
}
