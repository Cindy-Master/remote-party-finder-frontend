import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FiTrash2, FiUser, FiUsers, FiClock, FiCheckCircle, FiVolume2, FiVolumeX, FiInfo, FiChevronDown, FiChevronUp, FiAlertTriangle, FiBell, FiBellOff } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { playAlarmSound } from '../services/notificationService';
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
  
  ${props => props.$fulfilled && `
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

const ExpiredBadge = styled.div`
  background-color: var(--warning-color);
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

// 添加一个新的使用说明组件
const HelpPanel = styled(motion.div)`
  background-color: var(--card-bg);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--info-color);
  
  .help-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding-bottom: 8px;
  }
  
  .help-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--primary-color);
    font-weight: 600;
  }
  
  .help-content {
    padding-top: 10px;
    border-top: 1px solid var(--border-color);
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  .help-item {
    margin-bottom: 8px;
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }
  
  .help-item-icon {
    color: var(--primary-color);
    margin-top: 3px;
  }
`;

// 可点击的收藏卡片
const ClickableCard = styled(StyledCard)`
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  ${props => props.$expired && `
    border-left: 4px solid var(--warning-color);
    opacity: 0.8;
  `}
`;

const FavoritesPage = () => {
  const { isDarkMode } = useTheme();
  const { 
    favorites, 
    fulfilledListings, 
    expiredListings,
    soundEnabled,
    repeatAlarmEnabled,
    removeFromFavorites, 
    clearFulfilledFavorites, 
    clearExpiredFavorites,
    clearAllFavorites, 
    toggleSound,
    toggleRepeatAlarm,
    isExpired 
  } = useFavorites();
  
  // 添加使用说明的展开/折叠状态
  const [helpExpanded, setHelpExpanded] = useState(false);
  
  // 处理声音开关切换
  const handleToggleSound = () => {
    toggleSound();
    // 添加临时反馈
    const btn = document.querySelector('.toggle-sound-btn');
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
  
  // 处理重复提醒开关切换
  const handleToggleRepeatAlarm = () => {
    toggleRepeatAlarm();
    // 添加临时反馈
    const btn = document.querySelector('.toggle-repeat-btn');
    if (btn) {
      btn.classList.add('toggled');
      setTimeout(() => btn.classList.remove('toggled'), 500);
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
        
        {/* 添加使用说明面板 */}
        <HelpPanel
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div 
            className="help-header"
            onClick={() => setHelpExpanded(!helpExpanded)}
          >
            <div className="help-title">
              <FiInfo /> 使用说明
            </div>
            {helpExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </div>
          
          <AnimatePresence>
            {helpExpanded && (
              <motion.div 
                className="help-content"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="help-item">
                  <FiCheckCircle className="help-item-icon" />
                  <span>点击收藏卡片可以跳转到招募详情页查看更多信息</span>
                </div>
                <div className="help-item">
                  <FiCheckCircle className="help-item-icon" />
                  <span>已满员的招募会显示"已满员"标记，并在左侧边框显示绿色提示</span>
                </div>
                <div className="help-item">
                  <FiCheckCircle className="help-item-icon" />
                  <span>已过期的招募会显示"已过期"标记，并在左侧边框显示黄色提示</span>
                </div>
                <div className="help-item">
                  <FiCheckCircle className="help-item-icon" />
                  <span>收藏的招募信息每分钟自动更新一次</span>
                </div>
                <div className="help-item">
                  <FiCheckCircle className="help-item-icon" />
                  <span>开启声音后，当收藏的招募满员时会播放提示音</span>
                </div>
                <div className="help-item">
                  <FiCheckCircle className="help-item-icon" />
                  <span>开启重复提醒后，招募满员时会每3秒重复提示音，直到满员招募被清除</span>
                </div>
                <div className="help-item">
                  <FiCheckCircle className="help-item-icon" />
                  <span>使用"清除已满员"按钮可以一键移除所有已满员的招募</span>
                </div>
                <div className="help-item">
                  <FiCheckCircle className="help-item-icon" />
                  <span>使用"清除已过期"按钮可以一键移除所有已过期的招募</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </HelpPanel>
        
        <motion.div 
          className="settings-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="settings-group">
            <button 
              className={`toggle-btn toggle-sound-btn ${soundEnabled ? 'active' : ''}`}
              onClick={handleToggleSound}
            >
              {soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
              {soundEnabled ? '声音已开启' : '声音已关闭'}
            </button>
            
            <button 
              className={`toggle-btn toggle-repeat-btn ${repeatAlarmEnabled ? 'active' : ''}`}
              onClick={handleToggleRepeatAlarm}
              disabled={!soundEnabled}
              title={!soundEnabled ? "请先开启声音" : ""}
            >
              {repeatAlarmEnabled ? <FiBell /> : <FiBellOff />}
              {repeatAlarmEnabled ? '重复提醒已开启' : '重复提醒已关闭'}
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
              
              {Array.from(expiredListings).length > 0 && (
                <motion.button 
                  className="clear-expired-btn"
                  onClick={clearExpiredFavorites}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiAlertTriangle /> 清除已过期
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
                const isListingExpired = isExpired(favorite.id);
                
                return (
                  <Link
                    to={`/listing/${favorite.id}`}
                    key={favorite.id}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <ClickableCard
                      $fulfilled={isFulfilled}
                      $expired={isListingExpired}
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
                      
                      {isListingExpired && (
                        <ExpiredBadge>
                          <FiAlertTriangle /> 已过期
                        </ExpiredBadge>
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
                            {isListingExpired ? '已过期' : formatTimeLeft(favorite.time_left)}
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
                        
                        {favorite.description && (
                          <div className="info-row description-row">
                            <span className="info-label">描述:</span>
                            <span className="info-value description-text">
                              {favorite.description}
                            </span>
                          </div>
                        )}
                        
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
                          onClick={(e) => {
                            e.preventDefault(); // 阻止链接跳转
                            removeFromFavorites(favorite.id);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="移除收藏"
                        >
                          <FiTrash2 />
                        </IconButton>
                      </div>
                    </ClickableCard>
                  </Link>
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