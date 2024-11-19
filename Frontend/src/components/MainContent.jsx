import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainContent = ({ isSidebarOpen, setSidebarOpen, isDark }) => {
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const [isDeviceMobile, setIsDeviceMobile] = useState(false);

  useEffect(() => {
    setIsDeviceMobile(isMobile());
    if (isMobile()) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className="relative pt-16">
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        isDark={isDark}
      />

      <main 
        className={`
          transition-all 
          duration-300 
          ${isDeviceMobile 
            ? 'px-4 py-6 ml-16'  
            : `${isSidebarOpen ? 'ml-64' : 'ml-16'}`
          }
        `}
      >
        <Outlet />
      </main>

      {isDeviceMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainContent; 