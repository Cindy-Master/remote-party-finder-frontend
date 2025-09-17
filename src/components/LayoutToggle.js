import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiGrid, FiList } from 'react-icons/fi';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 80px;
  height: 36px;
  background: ${props => props.isCompact ? '#4a90e2' : '#ddd'};
  border-radius: 18px;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  padding: 0 4px;
`;

const ToggleSlider = styled(motion.div)`
  width: 28px;
  height: 28px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const IconWrapper = styled.div`
  font-size: 14px;
  color: #666;
`;

const LayoutToggle = ({ isCompactView, onToggle }) => {
  const handleToggle = () => {
    onToggle(!isCompactView);
  };

  return (
    <ToggleContainer>
      <ToggleLabel>
        <FiGrid style={{ marginRight: '4px' }} />
        卡片视图
      </ToggleLabel>

      <ToggleSwitch
        isCompact={isCompactView}
        onClick={handleToggle}
      >
        <ToggleSlider
          initial={false}
          animate={{
            x: isCompactView ? 44 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          <IconWrapper>
            {isCompactView ? <FiList /> : <FiGrid />}
          </IconWrapper>
        </ToggleSlider>
      </ToggleSwitch>

      <ToggleLabel>
        <FiList style={{ marginRight: '4px' }} />
        紧凑视图
      </ToggleLabel>
    </ToggleContainer>
  );
};

export default LayoutToggle;