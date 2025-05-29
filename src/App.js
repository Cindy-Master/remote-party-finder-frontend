import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ListingsProvider } from './contexts/ListingsContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import DetailPage from './components/DetailPage';
import AboutPage from './components/AboutPage';
import FavoritesPage from './components/FavoritesPage';
import ThemeToggle from './components/ThemeToggle';
import ParticleBackground from './components/ParticleBackground';
import { useTheme } from './contexts/ThemeContext';
import { preloadAlarmSound } from './services/notificationService';
import './styles/global.css';
import './App.css';

// 为组件添加主题切换功能的容器组件
const AppContent = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  // 在组件挂载时预加载音频
  useEffect(() => {
    // 预加载音频文件
    preloadAlarmSound();
  }, []);
  
  return (
    <Router>
      <div className="App">
        <ParticleBackground />
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listing/:id" element={<DetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </main>
        <Footer />
        <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <ListingsProvider>
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </ListingsProvider>
    </ThemeProvider>
  );
}

export default App;
