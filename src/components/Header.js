import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiHome, FiInfo, FiMenu, FiX, FiStar } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/Header.css';

const MenuIcon = styled(motion.div)`
  display: none;
  cursor: pointer;
  font-size: 24px;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  ul {
    list-style: none;
    padding: 0;
    width: 100%;
    text-align: center;
  }
  
  li {
    margin: 20px 0;
  }
  
  a {
    font-size: 24px;
    color: white;
    display: block;
    padding: 15px;
  }
  
  .close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    color: white;
    font-size: 30px;
    cursor: pointer;
  }
`;

const NavLink = styled(motion.li)`
  position: relative;
  
  &.active::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: var(--secondary-color);
    border-radius: 3px;
  }
`;

const Logo = styled(motion.div)`
  font-weight: bold;
  font-size: 24px;
  
  a {
    display: flex;
    align-items: center;
  }
  
  span {
    margin-left: 8px;
  }
`;

const Header = () => {
  const { isDarkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className={`header ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        <nav className="nav">
          <Logo
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                FF14招募查询
              </motion.div>
            </Link>
          </Logo>
          
          <MenuIcon
            whileTap={{ scale: 0.9 }}
            onClick={toggleMobileMenu}
          >
            <FiMenu />
          </MenuIcon>

          <ul className="nav-links">
            <NavLink 
              className={isActive('/') ? 'active' : ''}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link to="/">
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ y: 0 }}
                  className="nav-item"
                >
                  <FiHome className="nav-icon" />
                  <span>首页</span>
                </motion.div>
              </Link>
            </NavLink>
            
            <NavLink 
              className={isActive('/favorites') ? 'active' : ''}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Link to="/favorites">
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ y: 0 }}
                  className="nav-item"
                >
                  <FiStar className="nav-icon" />
                  <span>我的收藏</span>
                </motion.div>
              </Link>
            </NavLink>
            
            <NavLink 
              className={isActive('/about') ? 'active' : ''}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link to="/about">
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ y: 0 }}
                  className="nav-item"
                >
                  <FiInfo className="nav-icon" />
                  <span>关于</span>
                </motion.div>
              </Link>
            </NavLink>
          </ul>
        </nav>
      </div>

      {mobileMenuOpen && (
        <MobileMenu
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="close-button"
            whileTap={{ scale: 0.9 }}
            onClick={closeMobileMenu}
          >
            <FiX />
          </motion.div>
          <ul>
            <motion.li
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/" onClick={closeMobileMenu}>
                <FiHome className="nav-icon" />
                <span>首页</span>
              </Link>
            </motion.li>
            
            <motion.li
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/favorites" onClick={closeMobileMenu}>
                <FiStar className="nav-icon" />
                <span>我的收藏</span>
              </Link>
            </motion.li>
            
            <motion.li
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/about" onClick={closeMobileMenu}>
                <FiInfo className="nav-icon" />
                <span>关于</span>
              </Link>
            </motion.li>
          </ul>
        </MobileMenu>
      )}
    </header>
  );
};

export default Header; 