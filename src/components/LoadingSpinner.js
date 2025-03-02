import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 40px;
  min-height: 200px;
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const Spinner = styled(motion.div)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 4px solid var(--primary-color);
  border-top-color: transparent;
`;

const Message = styled(motion.p)`
  color: var(--text-color);
  font-size: 18px;
  text-align: center;
  margin-top: 15px;
`;

const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      repeat: Infinity,
      ease: "linear",
      duration: 1
    }
  }
};

const messageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      delay: 0.3,
      duration: 0.5
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5
    }
  })
};

const LoadingSpinner = ({ message = "加载中，请稍候..." }) => {
  const characters = message.split('');

  return (
    <LoadingContainer>
      <SpinnerContainer>
        <Spinner 
          variants={spinnerVariants}
          animate="animate"
        />
      </SpinnerContainer>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {characters.map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            variants={itemVariants}
            initial="initial"
            animate="animate"
            custom={i}
            style={{ display: 'inline-block' }}
          >
            {char}
          </motion.span>
        ))}
      </div>
    </LoadingContainer>
  );
};

export default LoadingSpinner; 