import { Compass, Twitter, Github } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Header = ({ isDark, setIsDark }) => {


  return (
    <header className={`fixed top-0 left-0 right-0 z-10 transition-colors duration-200 ${
      isDark 
        ? 'bg-slate-800/95 border-b border-slate-700/50'
        : 'bg-white/80 border-b border-gray-100'
    } backdrop-blur-sm`}>
      <div className="mx-auto p-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Compass className="w-8 h-8 text-blue-500 mr-3" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              SolMon
            </h1>
          </div>

          {/* 右侧按钮 */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
            <a
              href="https://github.com/hellothread/chainnav"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDark 
                  ? 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Github size={20} />
            </a>

            <a
              href="https://x.com/mthread_"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDark 
                  ? 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Twitter size={20} />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 