import React from 'react';
import { ChevronLeft, ChevronRight, Home, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen, isDark }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    {
      path: '/',
      name: '首页',
      icon: <Home size={20} />
    },
    {
      path: '/address',
      name: '地址管理',
      icon: <MapPin size={20} />
    }
  ];

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out ${
      isDark 
        ? 'bg-slate-800/95 backdrop-blur-sm border-r border-slate-700/50' 
        : 'bg-white/50 backdrop-blur-sm border-r border-gray-100'
    } ${isOpen ? 'w-64' : 'w-16'}`}>
      <nav className="p-2 relative h-full">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute -right-3 bottom-10 p-1.5 rounded-full transition-all duration-300 ease-in-out ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-white hover:bg-gray-100 text-gray-600 shadow-md'
          }`}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="h-[calc(100vh-5rem)] overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center p-3 mb-1 rounded-lg transition-all duration-300 ease-in-out ${
                !isOpen && 'justify-center'
              } ${
                (item.path === '/' 
                  ? location.pathname === '/' 
                  : location.pathname.startsWith(item.path))
                  ? isDark 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gray-100 text-gray-900'
                  : isDark
                    ? 'text-gray-400 hover:bg-gray-700/50'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {isOpen && <span className="ml-3 whitespace-nowrap transition-opacity duration-300">{item.name}</span>}
            </button>
          ))}
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;