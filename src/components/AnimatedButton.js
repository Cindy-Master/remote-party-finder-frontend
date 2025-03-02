import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

// 按钮样式变体
const VARIANTS = {
  primary: {
    background: 'var(--primary-color)',
    color: 'white',
    hoverBackground: 'var(--primary-color-dark)',
  },
  secondary: {
    background: 'var(--secondary-color)',
    color: 'white',
    hoverBackground: 'var(--secondary-color-dark)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--primary-color)',
    border: '2px solid var(--primary-color)',
    hoverBackground: 'rgba(0, 0, 0, 0.05)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-color)',
    hoverBackground: 'rgba(0, 0, 0, 0.05)',
  },
  danger: {
    background: '#ff4d4f',
    color: 'white',
    hoverBackground: '#ff1f1f',
  },
  success: {
    background: '#52c41a',
    color: 'white',
    hoverBackground: '#389e0d',
  }
};

// 按钮大小
const SIZES = {
  small: {
    padding: '6px 12px',
    fontSize: '12px',
  },
  medium: {
    padding: '8px 16px',
    fontSize: '14px',
  },
  large: {
    padding: '12px 24px',
    fontSize: '16px',
  }
};

const ButtonContainer = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.size === 'small' ? '8px 16px' : '12px 20px'};
  border-radius: 6px;
  font-size: ${props => props.size === 'small' ? '14px' : '16px'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;
  position: relative;
  overflow: hidden;
  
  /* 变体样式 */
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: var(--primary-color);
          color: white;
          
          &:hover {
            background-color: var(--primary-dark);
          }
        `;
      case 'secondary':
        return `
          background-color: var(--secondary-color);
          color: white;
          
          &:hover {
            background-color: var(--secondary-dark);
          }
        `;
      case 'success':
        return `
          background-color: var(--success-color);
          color: white;
          
          &:hover {
            background-color: #2e7d32;
          }
        `;
      case 'danger':
        return `
          background-color: var(--error-color);
          color: white;
          
          &:hover {
            background-color: #c62828;
          }
        `;
      case 'outline':
        return `
          background-color: transparent;
          color: var(--text-color);
          border: 1px solid var(--border-color);
          
          &:hover {
            background-color: ${props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
          }
        `;
      default:
        return `
          background-color: var(--primary-color);
          color: white;
          
          &:hover {
            background-color: var(--primary-dark);
          }
        `;
    }
  }}
  
  /* 禁用状态 */
  ${props => props.disabled && `
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      transform: none !important;
      box-shadow: none !important;
    }
  `}
  
  /* 图标间距 */
  svg {
    ${props => props.iconLeft && 'margin-right: 8px;'}
    ${props => props.iconRight && 'margin-left: 8px;'}
    font-size: ${props => props.size === 'small' ? '16px' : '18px'};
  }
  
  /* 波纹效果 */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%, -50%);
    transform-origin: 50% 50%;
  }

  &:focus:not(:active)::after {
    animation: ripple 1s ease-out;
  }

  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 1;
    }
    20% {
      transform: scale(25, 25);
      opacity: 1;
    }
    100% {
      transform: scale(50, 50);
      opacity: 0;
    }
  }
`;

const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  iconLeft,
  iconRight,
  disabled = false,
  onClick,
  className,
  style,
  type = 'button',
  isDarkMode = false,
  ...props
}) => {
  return (
    <ButtonContainer
      variant={variant}
      size={size}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={className}
      style={style}
      type={type}
      iconLeft={iconLeft}
      iconRight={iconRight}
      isDarkMode={isDarkMode}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1.0]
      }}
      {...props}
    >
      {iconLeft}
      {children}
      {iconRight}
    </ButtonContainer>
  );
};

export default AnimatedButton; 