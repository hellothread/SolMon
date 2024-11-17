import React from 'react';
import { Sun, Moon } from 'lucide-react';


const ThemeToggle = ({ isDark, setIsDark }) => {
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={`p-2 rounded-lg transition-all duration-200 ${
        isDark 
          ? 'hover:bg-gray-800 text-yellow-400 hover:text-yellow-300' 
          : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
      }`}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default ThemeToggle;