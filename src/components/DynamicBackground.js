import React from 'react';
import styled from 'styled-components';
import ParticleBackground from './ParticleBackground';
import { useBackground } from '../contexts/BackgroundContext';

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

const SolidBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${props => props.color};
  z-index: -1;
`;

const ImageBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  z-index: -1;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 0;
  }
`;

const DynamicBackground = () => {
  const { backgroundType, customImage, solidColor } = useBackground();

  const renderBackground = () => {
    switch (backgroundType) {
      case 'solid':
        return <SolidBackground color={solidColor} />;
      case 'image':
        return customImage ? <ImageBackground image={customImage} /> : <ParticleBackground />;
      case 'particles':
      default:
        return <ParticleBackground />;
    }
  };

  return <BackgroundContainer>{renderBackground()}</BackgroundContainer>;
};

export default DynamicBackground;