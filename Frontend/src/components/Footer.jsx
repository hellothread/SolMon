import { Heart } from 'lucide-react';

const Footer = ({ isSidebarOpen, isDark }) => {
  return (
    <footer className={`transition-all duration-200 ${
      isSidebarOpen ? 'ml-64' : 'ml-16'
    } px-4 py-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
      <p>Made with <Heart className="inline-block w-4 h-4 text-red-400" /> by Thread</p>
    </footer>
  );
};

export default Footer; 