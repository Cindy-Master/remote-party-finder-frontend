import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiSun, FiMoon } from 'react-icons/fi';

const ToggleButton = styled(motion.button)`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 100;
  font-size: 20px;
  
  &:focus {
    outline: none;
  }
`;

const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <ToggleButton
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      aria-label={isDarkMode ? "切换到亮色模式" : "切换到暗色模式"}
    >
      {isDarkMode ? <FiSun /> : <FiMoon />}
    </ToggleButton>
  );
};

export default ThemeToggle; 