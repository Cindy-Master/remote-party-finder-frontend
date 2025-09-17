import React, { createContext, useContext, useState, useEffect } from 'react';
import { backgroundImageDB } from '../utils/backgroundImageDB';

const BackgroundContext = createContext();

export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
};

export const BackgroundProvider = ({ children }) => {
  const [backgroundType, setBackgroundType] = useState(() => {
    return localStorage.getItem('backgroundType') || 'particles';
  });

  const [customImageFile, setCustomImageFile] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [solidColor, setSolidColor] = useState(() => {
    return localStorage.getItem('solidBackgroundColor') || '#1a1a1a';
  });

  // 初始化时从IndexedDB恢复图片
  useEffect(() => {
    const loadSavedImage = async () => {
      try {
        const savedFile = await backgroundImageDB.getImage();
        if (savedFile) {
          const imageUrl = URL.createObjectURL(savedFile);
          setCustomImageFile(savedFile);
          setCustomImageUrl(imageUrl);
        }
      } catch (error) {
        console.error('Failed to load saved background image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedImage();
  }, []);

  // 保存设置到localStorage
  useEffect(() => {
    localStorage.setItem('backgroundType', backgroundType);
  }, [backgroundType]);

  useEffect(() => {
    localStorage.setItem('solidBackgroundColor', solidColor);
  }, [solidColor]);

  // 清理旧的URL对象
  useEffect(() => {
    return () => {
      if (customImageUrl) {
        URL.revokeObjectURL(customImageUrl);
      }
    };
  }, [customImageUrl]);

  const handleImageUpload = async (file) => {
    if (file && file.type.startsWith('image/')) {
      try {
        // 清理旧的URL
        if (customImageUrl) {
          URL.revokeObjectURL(customImageUrl);
        }

        // 保存到IndexedDB
        await backgroundImageDB.saveImage(file);

        // 创建新的对象URL
        const imageUrl = URL.createObjectURL(file);
        setCustomImageFile(file);
        setCustomImageUrl(imageUrl);
        setBackgroundType('image');
      } catch (error) {
        console.error('Failed to save background image:', error);
      }
    }
  };

  const clearCustomImage = async () => {
    try {
      // 从IndexedDB删除
      await backgroundImageDB.deleteImage();

      // 清理URL对象
      if (customImageUrl) {
        URL.revokeObjectURL(customImageUrl);
      }

      setCustomImageFile(null);
      setCustomImageUrl(null);

      if (backgroundType === 'image') {
        setBackgroundType('particles');
      }
    } catch (error) {
      console.error('Failed to delete background image:', error);
    }
  };

  const changeBackgroundType = (type) => {
    setBackgroundType(type);
  };

  const changeSolidColor = (color) => {
    setSolidColor(color);
  };

  const value = {
    backgroundType,
    customImage: customImageUrl,
    customImageFile,
    solidColor,
    isLoading,
    changeBackgroundType,
    handleImageUpload,
    clearCustomImage,
    changeSolidColor,
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
};