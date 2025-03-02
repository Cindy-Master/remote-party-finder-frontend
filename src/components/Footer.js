import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiGithub, FiMail, FiHeart } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/Footer.css';

const SocialLinks = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 15px;
`;

const SocialIcon = styled(motion.a)`
  color: white;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.3s;
  
  &:hover {
    background-color: var(--secondary-color);
  }
`;

const HeartIcon = styled(motion.span)`
  display: inline-block;
  color: #ff6b6b;
  margin: 0 5px;
`;

const FooterText = styled(motion.p)`
  margin: 10px 0;
`;

const Footer = () => {
  const { isDarkMode } = useTheme();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`footer ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="container">
        <motion.div 
          className="footer-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            FF14招募查询
          </motion.h3>
          
          
          <FooterText
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <HeartIcon
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.6, 
                duration: 0.5,
                type: "spring",
                stiffness: 300
              }}
              whileHover={{ 
                scale: 1.3, 
                rotate: [0, 10, -10, 10, 0],
                transition: { duration: 0.5 }
              }}
            >
              <FiHeart />
            </HeartIcon>
            
          </FooterText>
          
          <SocialLinks>
            <SocialIcon 
              href="https://github.com/Cindy-Master/remote-party-finder-frontend" 
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <FiGithub />
            </SocialIcon>
            
          </SocialLinks>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 