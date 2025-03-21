import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiUsers, FiClock, FiMapPin, FiTag, FiGlobe } from 'react-icons/fi';
import AnimatedCard from './AnimatedCard';
import { formatTimeLeft, isUrgentTime } from '../utils/timeUtils';
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
        <Link to={`/listing/${id}`} className="view-details-btn">
          查看详情
        </Link>
      </div>
    </StyledCard>
  );
};

export default ListingCard; 