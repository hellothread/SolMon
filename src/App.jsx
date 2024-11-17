import { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';

function App() {
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // 创建主题
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDark ? 'dark' : 'light',
          background: {
            default: isDark ? '#0f172a' : '#f9fafb', // 更深的背景色
            paper: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.5)', // 更不透明的卡片背景
          },
          primary: {
            main: '#60a5fa', // 更亮的蓝色
          },
          secondary: {
            main: '#a78bfa', // 更亮的紫色
          },
          success: {
            main: '#34d399', // 更亮的绿色
          },
          error: {
            main: '#f87171', // 更亮的红色
          },
          warning: {
            main: '#fbbf24', // 更亮的橙色
          },
          info: {
            main: '#60a5fa', // 更亮的信息蓝
          },
          text: {
            primary: isDark ? '#f8fafc' : '#111827', // 更亮的主要文字
            secondary: isDark ? '#cbd5e1' : '#4b5563', // 更亮的次要文字
          },
          divider: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(229, 231, 235, 0.5)',
          action: {
            hover: isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(59, 130, 246, 0.04)',
            selected: isDark ? 'rgba(96, 165, 250, 0.25)' : 'rgba(59, 130, 246, 0.08)',
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                backdropFilter: 'blur(8px)',
                borderRadius: 8,
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 6,
              },
              colorSuccess: {
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : undefined,
              },
              colorError: {
                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : undefined,
              },
            },
          },
        },
      }),
    [isDark]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="min-h-screen flex flex-col">
        <Header 
          isDark={isDark} 
          setIsDark={setIsDark}
        />
        
        <div className="flex-1">
          <MainContent 
            isSidebarOpen={isSidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isDark={isDark}
          />
        </div>

        <Footer 
          isSidebarOpen={isSidebarOpen} 
          isDark={isDark} 
        />
      </div>
    </ThemeProvider>
  );
}

export default App; 