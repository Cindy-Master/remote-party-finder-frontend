import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiUsers, FiClock, FiMapPin, FiTag, FiGlobe, FiStar, FiCheckCircle } from 'react-icons/fi';
import AnimatedCard from './AnimatedCard';
import { formatTimeLeft, isUrgentTime } from '../utils/timeUtils';
import { useFavorites } from '../contexts/FavoritesContext';
import '../styles/ListingCard.css';
import { CATEGORY_EN_TO_ZH } from '../services/api';

const StyledCard = styled(AnimatedCard)`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
  color: var(--primary-color);
`;

const TimeLeft = styled.span`
  ${props => props.isUrgent && `
    color: var(--error-color);
    font-weight: bold;
  `}
`;

// 新增收藏按钮样式
const FavoriteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  outline: none;
  
  &:hover {
    transform: scale(1.2);
  }
  
  &:active {
    transform: scale(0.9);
  }
  
  svg {
    font-size: 1.5rem;
    transition: all 0.3s;
    color: ${props => props.isFavorite ? '#ffbf00' : '#ccc'};
    filter: ${props => props.isFavorite ? 'drop-shadow(0 0 3px rgba(255, 191, 0, 0.5))' : 'none'};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: ${props => props.isFavorite ? '120%' : '0'};
    height: ${props => props.isFavorite ? '120%' : '0'};
    background-color: rgba(255, 191, 0, 0.1);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
    transition: all 0.3s;
  }
`;

const FulfilledBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--success-color);
  font-size: 1.2rem;
  margin-left: 10px;
`;

const ListingCard = ({ listing }) => {
  const {
    id,
    name,
    category,
    duty,
    home_world,
    created_world,
    datacenter,
    slots_filled,
    slots_available,
    time_left,
    is_cross_world,
    description
  } = listing;
  
  // 使用收藏上下文
  const { addToFavorites, removeFromFavorites, isFavorite, isFulfilled } = useFavorites();
  
  // 状态来跟踪收藏状态和动画
  const [favorite, setFavorite] = useState(isFavorite(id));
  const [animating, setAnimating] = useState(false);
  
  // 当实际收藏状态变化时更新本地状态
  useEffect(() => {
    setFavorite(isFavorite(id));
  }, [id, isFavorite]);
  
  // 检查是否已满员
  const isListingFulfilled = isFulfilled(id);
  
  // 切换收藏状态
  const toggleFavorite = (e) => {
    e.preventDefault(); // 阻止链接跳转
    e.stopPropagation(); // 阻止事件冒泡
    
    // 如果正在动画中，不响应点击
    if (animating) return;
    
    // 设置动画标志
    setAnimating(true);
    
    // 立即更新UI状态，不等待后端响应
    setFavorite(!favorite);
    
    // 调用实际的添加/移除收藏函数
    if (favorite) {
      removeFromFavorites(id);
    } else {
      addToFavorites(listing);
    }
    
    // 动画结束后重置标志
    setTimeout(() => {
      setAnimating(false);
    }, 500);
  };

  // 判断是否紧急（时间少于5分钟）
  const isUrgent = isUrgentTime(time_left);
  
  // 格式化剩余时间
  const formattedTimeLeft = formatTimeLeft(time_left);
  
  // 获取类别的中文名称
  const getCategoryName = (categoryValue) => {
    if (!categoryValue || categoryValue === 'None') return '无';
    // 如果API已返回中文名称（包含中文字符）则直接使用
    if (/[\u4e00-\u9fa5]/.test(categoryValue)) return categoryValue;
    // 否则尝试翻译
    return CATEGORY_EN_TO_ZH[categoryValue] || categoryValue;
  };

  // 格式化任务名称
  const getDutyName = (dutyValue) => {
    if (!dutyValue || dutyValue === 'None' || dutyValue === '无') return '未指定';
    return dutyValue;
  };

  return (
    <StyledCard>
      <div className="listing-header">
        <h3 className="listing-title">{name}</h3>
        <TimeLeft className={`listing-time ${isUrgent ? 'urgent' : ''}`} isUrgent={isUrgent}>
          <IconWrapper>
            <FiClock />
          </IconWrapper>
          {formattedTimeLeft}
        </TimeLeft>
      </div>
      <div className="listing-body">
        <div className="listing-info">
          <p>
            <IconWrapper>
              <FiMapPin />
            </IconWrapper>
            <span className="info-label">所属服务器：</span>
            <span>{home_world}</span>
          </p>
          <p>
            <IconWrapper>
              <FiMapPin />
            </IconWrapper>
            <span className="info-label">创建服务器：</span>
            <span>{created_world}</span>
            {is_cross_world && 
              <motion.span 
                className="cross-world-tag"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                跨服招募
              </motion.span>
            }
          </p>
          <p>
            <IconWrapper>
              <FiGlobe />
            </IconWrapper>
            <span className="info-label">大区：</span>
            <span>{datacenter}</span>
          </p>
          <p>
            <IconWrapper>
              <FiTag />
            </IconWrapper>
            <span className="info-label">类别：</span>
            <span>{getCategoryName(category)}</span>
          </p>
          <p>
            <span className="info-label">任务：</span>
            <span>{getDutyName(duty)}</span>
          </p>
          {description && (
            <div className="listing-description">
              <p className="description-label">招募说明：</p>
              <p className="description-content">{description}</p>
            </div>
          )}
        </div>
        <div className="slots-info">
          <IconWrapper style={{ fontSize: '24px' }}>
            <FiUsers />
          </IconWrapper>
          <p className="slots">
            {slots_filled}/{slots_available}
            <span className="slots-label">人数</span>
          </p>
        </div>
      </div>
      <div className="listing-footer">
        <div className="listing-actions">
          <FavoriteButton
            isFavorite={favorite}
            onClick={toggleFavorite}
            title={favorite ? "取消收藏" : "添加到收藏"}
            className={animating ? "animating" : ""}
          >
            <FiStar />
          </FavoriteButton>
          
          {isListingFulfilled && (
            <FulfilledBadge title="招募已满员">
              <FiCheckCircle />
            </FulfilledBadge>
          )}
        </div>
        
        <Link to={`/listing/${id}`} className="view-details-btn">
          查看详情
        </Link>
      </div>
    </StyledCard>
  );
};

export default ListingCard; 