import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check saved preference
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      toast.success('Dark mode enabled');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      toast.success('Light mode enabled');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark(!isDark)}
      className="text-[#a1724e] dark:text-green-400 hover:opacity-80 transition"
    >
      {isDark ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  );
};

export default ThemeToggle;
