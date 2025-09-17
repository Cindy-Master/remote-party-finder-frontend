import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FiImage, FiGrid, FiPalette, FiSettings, FiX, FiUpload, FiTrash2 } from 'react-icons/fi';
import { useBackground } from '../contexts/BackgroundContext';

const SettingsButton = styled.button`
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: translateY(-50%) scale(1.1);
  }

  svg {
    font-size: 20px;
  }
`;

const SettingsPanel = styled(motion.div)`
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 12px;
  padding: 20px;
  width: 320px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1001;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;

  h3 {
    margin: 0;
    font-size: 18px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const OptionGroup = styled.div`
  margin-bottom: 20px;

  h4 {
    margin-bottom: 10px;
    font-size: 14px;
    color: #ccc;
  }
`;

const OptionButton = styled.button`
  width: 100%;
  background: ${props => props.active ? 'rgba(74, 144, 226, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid ${props => props.active ? '#4a90e2' : 'rgba(255, 255, 255, 0.2)'};
  color: white;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileUploadButton = styled.label`
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  color: white;
  padding: 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const ColorInput = styled.input`
  width: 100%;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: none;
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 100px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  margin-bottom: 10px;
  position: relative;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 0, 0, 0.7);
  border: none;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 0, 0, 0.9);
  }
`;

const BackgroundSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    backgroundType,
    customImage,
    solidColor,
    changeBackgroundType,
    handleImageUpload,
    clearCustomImage,
    changeSolidColor
  } = useBackground();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <>
      <SettingsButton onClick={() => setIsOpen(true)}>
        <FiSettings />
      </SettingsButton>

      <AnimatePresence>
        {isOpen && (
          <SettingsPanel
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <PanelHeader>
              <h3>背景设置</h3>
              <CloseButton onClick={() => setIsOpen(false)}>
                <FiX />
              </CloseButton>
            </PanelHeader>

            <OptionGroup>
              <h4>背景类型</h4>

              <OptionButton
                active={backgroundType === 'particles'}
                onClick={() => changeBackgroundType('particles')}
              >
                <FiGrid />
                粒子背景
              </OptionButton>

              <OptionButton
                active={backgroundType === 'image'}
                onClick={() => changeBackgroundType('image')}
                disabled={!customImage}
              >
                <FiImage />
                自定义图片
              </OptionButton>

              <OptionButton
                active={backgroundType === 'solid'}
                onClick={() => changeBackgroundType('solid')}
              >
                <FiPalette />
                纯色背景
              </OptionButton>
            </OptionGroup>

            {backgroundType === 'image' && (
              <OptionGroup>
                <h4>图片设置</h4>

                {customImage && (
                  <ImagePreview src={customImage}>
                    <RemoveImageButton onClick={clearCustomImage}>
                      <FiTrash2 size={12} />
                    </RemoveImageButton>
                  </ImagePreview>
                )}

                <FileUploadButton htmlFor="background-upload">
                  <FiUpload size={24} />
                  <span>{customImage ? '更换图片' : '上传背景图片'}</span>
                  <small>支持 JPG, PNG, GIF 格式</small>
                </FileUploadButton>
                <FileInput
                  id="background-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </OptionGroup>
            )}

            {backgroundType === 'solid' && (
              <OptionGroup>
                <h4>颜色设置</h4>
                <ColorInput
                  type="color"
                  value={solidColor}
                  onChange={(e) => changeSolidColor(e.target.value)}
                />
              </OptionGroup>
            )}
          </SettingsPanel>
        )}
      </AnimatePresence>
    </>
  );
};

export default BackgroundSettings;