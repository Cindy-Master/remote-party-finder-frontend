import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { FiTrash2, FiUser, FiUsers, FiClock, FiCheckCircle, FiBell, FiVolume2, FiVolumeX, FiBellOff } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { requestNotificationPermission, sendNotification, playAlarmSound } from '../services/notificationService';
import { formatTimeLeft } from '../utils/timeUtils';
import '../styles/FavoritesPage.css';

const StyledCard = styled(motion.div)`
  background-color: var(--card-bg);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  
  ${props => props.fulfilled && `
    border-left: 4px solid var(--success-color);
  `}
`;

const FulfillmentBadge = styled.div`
  background-color: var(--success-color);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  position: absolute;
  top: 10px;
  right: 10px;
`;

const IconButton = styled(motion.button)`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
  font-size: 1.2rem;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s, color 0.3s;
  
  &:hover {
    background-color: var(--hover-color);
  }
  
  &.active {
    color: var(--primary-color);
  }
  
  &.danger {
    color: var(--error-color);
  }
  
  &.success {
    color: var(--success-color);
  }
`;

const ToggleButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--card-bg)'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-dark)' : 'var(--hover-color)'};
  }
`;

const FavoritesPage = () => {
  const { isDarkMode } = useTheme();
  const { 
    favorites, 
    fulfilledListings, 
    notificationsEnabled, 
    soundEnabled,
    removeFromFavorites, 
    clearFulfilledFavorites, 
    clearAllFavorites, 
    toggleNotifications, 
    toggleSound 
  } = useFavorites();
  
  // 处理通知权限请求
  useEffect(() => {
    if (notificationsEnabled) {
      requestNotificationPermission();
    }
  }, [notificationsEnabled]);
  
  // 处理通知开关切换
  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      try {
        // 如果要开启通知，先请求权限
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
          toggleNotifications();
          // 添加临时反馈
          const btn = document.querySelector('.toggle-btn:nth-child(1)');
          if (btn) {
            btn.classList.add('toggled');
            setTimeout(() => btn.classList.remove('toggled'), 500);
          }
          
          // 触发一次通知，作为测试
          sendNotification('通知测试', {
            body: '通知功能已开启，收藏的招募满员时会收到提醒',
            onClick: () => {
              window.focus();
            }
          });
        } else {
          alert('需要通知权限才能开启此功能。请在浏览器设置中允许通知。');
        }
      } catch (error) {
        console.error('请求通知权限失败:', error);
        alert('请求通知权限失败，请检查浏览器设置或刷新页面重试。');
      }
    } else {
      // 关闭通知
      toggleNotifications();
      // 添加临时反馈
      const btn = document.querySelector('.toggle-btn:nth-child(1)');
      if (btn) {
        btn.classList.add('toggled');
        setTimeout(() => btn.classList.remove('toggled'), 500);
      }
    }
  };
  
  // 处理声音开关切换
  const handleToggleSound = () => {
    toggleSound();
    // 添加临时反馈
    const btn = document.querySelector('.toggle-btn:nth-child(2)');
    if (btn) {
      btn.classList.add('toggled');
      setTimeout(() => btn.classList.remove('toggled'), 500);
    }
    
    // 如果是开启声音，播放一次声音作为测试
    if (!soundEnabled) {
      const audio = playAlarmSound();
      // 播放1秒后停止
      setTimeout(() => {
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      }, 1000);
    }
  };
  
  return (
    <motion.div
      className={`favorites-page ${isDarkMode ? 'dark-mode' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="container">
        <motion.div 
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1>我的收藏</h1>
          <p>管理您收藏的招募信息</p>
        </motion.div>
        
        <motion.div 
          className="settings-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="settings-group">
            <button 
              className={`toggle-btn ${notificationsEnabled ? 'active' : ''}`}
              onClick={handleToggleNotifications}
            >
              {notificationsEnabled ? <FiBell /> : <FiBellOff />}
              {notificationsEnabled ? '通知已开启' : '通知已关闭'}
            </button>
            
            <button 
              className={`toggle-btn ${soundEnabled ? 'active' : ''}`}
              onClick={handleToggleSound}
            >
              {soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
              {soundEnabled ? '声音已开启' : '声音已关闭'}
            </button>
          </div>
          
          {favorites.length > 0 && (
            <div className="actions-group">
              {Array.from(fulfilledListings).length > 0 && (
                <motion.button 
                  className="clear-fulfilled-btn"
                  onClick={clearFulfilledFavorites}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiCheckCircle /> 清除已满员
                </motion.button>
              )}
              
              <motion.button 
                className="clear-all-btn"
                onClick={clearAllFavorites}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiTrash2 /> 清空全部
              </motion.button>
            </div>
          )}
        </motion.div>
        
        {favorites.length === 0 ? (
          <motion.div 
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p>您还没有收藏任何招募</p>
            <p className="hint">浏览招募列表并点击收藏按钮来添加</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div className="favorites-list">
              {favorites.map((favorite, index) => {
                const isFulfilled = fulfilledListings.has(favorite.id);
                
                return (
                  <StyledCard
                    key={favorite.id}
                    fulfilled={isFulfilled}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    {isFulfilled && (
                      <FulfillmentBadge>
                        <FiCheckCircle /> 已满员
                      </FulfillmentBadge>
                    )}
                    
                    <div className="favorite-header">
                      <h3>{favorite.name}</h3>
                    </div>
                    
                    <div className="favorite-info">
                      <div className="info-row">
                        <span className="info-label">
                          <FiClock /> 剩余时间:
                        </span>
                        <span className="info-value">
                          {formatTimeLeft(favorite.time_left)}
                        </span>
                      </div>
                      
                      <div className="info-row">
                        <span className="info-label">
                          <FiUsers /> 人数:
                        </span>
                        <span className="info-value">
                          {favorite.slots_filled}/{favorite.slots_available}
                        </span>
                      </div>
                      
                      <div className="info-row">
                        <span className="info-label">任务:</span>
                        <span className="info-value">
                          {favorite.duty || '未指定'}
                        </span>
                      </div>
                      
                      <div className="info-row">
                        <span className="info-label">服务器:</span>
                        <span className="info-value">
                          {favorite.home_world} ({favorite.datacenter})
                        </span>
                      </div>
                    </div>
                    
                    <div className="favorite-actions">
                      <IconButton
                        className="danger"
                        onClick={() => removeFromFavorites(favorite.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="移除收藏"
                      >
                        <FiTrash2 />
                      </IconButton>
                    </div>
                  </StyledCard>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default FavoritesPage; 