import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const CardContainer = styled(motion.div)`
  background-color: var(--card-bg, white);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  }
`;

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 24,
      mass: 0.5
    }
  },
  hover: { 
    scale: 1.02,
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.3 }
  },
  tap: { 
    scale: 0.98,
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.15 }
  }
};

const AnimatedCard = ({ children, delay = 0, className }) => {
  return (
    <CardContainer
      className={className}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      transition={{ delay }}
    >
      {children}
    </CardContainer>
  );
};

export default AnimatedCard; 