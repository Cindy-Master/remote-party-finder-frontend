import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ListingsProvider } from './contexts/ListingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import DetailPage from './components/DetailPage';
import AboutPage from './components/AboutPage';
import ThemeToggle from './components/ThemeToggle';
import ParticleBackground from './components/ParticleBackground';
import { useTheme } from './contexts/ThemeContext';
import './styles/global.css';
import './App.css';

// 为组件添加主题切换功能的容器组件
const AppContent = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
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
        <AppContent />
      </ListingsProvider>
    </ThemeProvider>
  );
}

export default App;
