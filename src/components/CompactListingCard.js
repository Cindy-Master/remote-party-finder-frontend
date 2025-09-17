import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiUsers, FiClock, FiMapPin, FiGlobe, FiStar, FiCheckCircle } from 'react-icons/fi';
import { formatTimeLeft, isUrgentTime } from '../utils/timeUtils';
import { useFavorites } from '../contexts/FavoritesContext';
import { highlightFFXIVChars, containsFFXIVChars } from '../utils/unicodeUtils';
import { CATEGORY_EN_TO_ZH } from '../services/api';
import '../styles/CompactListingCard.css';

const CompactCard = styled.div`
  background: ${props => props.isEven ? '#3a3a3a' : '#333333'};
  color: #e0e0e0;
  padding: 12px 16px;
  margin: 0;
  border-bottom: 1px solid #555;
  transition: background 0.2s ease;
  cursor: pointer;
  min-height: 60px;

  &:hover {
    background: ${props => props.isEven ? '#404040' : '#393939'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const CompactRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.isLast ? '0' : '6px'};
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
`;

const TitleSection = styled.div`
  min-width: 200px;

  .category {
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.2;
    margin-bottom: 2px;
  }

  .duty {
    color: #aaaaaa;
    margin-top: 2px;
    font-size: 12px;
  }
`;

const NameWorldSection = styled.div`
  min-width: 200px;
  font-size: 12px;

  .name {
    color: #cccccc;
    font-weight: 500;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.2;
    margin-bottom: 2px;
  }

  .world {
    font-size: 11px;
    color: #aaaaaa;
    font-weight: 400;
  }
`;

const ServerSection = styled.div`
  min-width: 100px;
  font-size: 12px;

  .datacenter {
    color: #cccccc;
    font-weight: 500;
  }
`;

const InfoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
`;

const SlotsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;

  .slots {
    font-weight: 600;
    color: #ffffff;
  }
`;

const TimeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;

  .time {
    font-weight: 500;
    color: ${props => props.isUrgent ? '#ff4757' : '#2ed573'};
  }
`;

const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
`;

const FavoriteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }

  svg {
    font-size: 16px;
    color: ${props => props.isFavorite ? '#ffbf00' : '#ccc'};
  }
`;

const DetailButton = styled.button`
  background: #4a90e2;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  font-size: 11px;
  font-weight: 500;
  transition: background 0.2s;
  cursor: pointer;

  &:hover {
    background: #357abd;
  }
`;

const CrossWorldTag = styled.span`
  background: #f59e0b;
  color: white;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 9px;
  font-weight: 500;
  margin-left: 4px;
`;

const FulfilledIcon = styled.div`
  color: #4ade80;
  font-size: 16px;
`;

const FFXIVCharText = styled.span`
  .ffxiv-char {
    background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: bold;
  }
`;

const CompactListingCard = ({ listing, index }) => {
  const navigate = useNavigate();
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

  const { addToFavorites, removeFromFavorites, isFavorite, isFulfilled } = useFavorites();

  const [favorite, setFavorite] = useState(isFavorite(id));
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(id));
  }, [id, isFavorite]);

  const isEven = (index + 1) % 2 === 0;
  const isListingFulfilled = isFulfilled(id);
  const isUrgent = isUrgentTime(time_left);
  const formattedTimeLeft = formatTimeLeft(time_left);

  const getCategoryName = (categoryValue) => {
    if (!categoryValue || categoryValue === 'None') return '无';
    if (/[\u4e00-\u9fa5]/.test(categoryValue)) return categoryValue;
    return CATEGORY_EN_TO_ZH[categoryValue] || categoryValue;
  };

  const getDutyName = (dutyValue) => {
    if (!dutyValue || dutyValue === 'None' || dutyValue === '无') return '未指定';
    return dutyValue;
  };

  // 提取大区名称（去除地区后缀）
  const getDatacenterShortName = (datacenterName) => {
    if (!datacenterName) return '未知';
    // 提取大区名称，去除地区后缀
    const shortName = datacenterName.split(' - ')[0] || datacenterName.split('-')[0] || datacenterName;
    return shortName.trim();
  };

  const renderTextWithFFXIVChars = (text) => {
    if (!text) return text;

    if (containsFFXIVChars(text)) {
      return (
        <FFXIVCharText
          dangerouslySetInnerHTML={{ __html: highlightFFXIVChars(text) }}
        />
      );
    }

    return text;
  };

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (animating) return;

    setAnimating(true);
    setFavorite(!favorite);

    if (favorite) {
      removeFromFavorites(id);
    } else {
      addToFavorites(listing);
    }

    setTimeout(() => {
      setAnimating(false);
    }, 300);
  };

  const handleCardClick = (e) => {
    // 防止点击收藏按钮等子元素时触发卡片点击
    if (e.target.closest('button')) {
      return;
    }
    // 跳转到详情页
    navigate(`/listing/${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <CompactCard onClick={handleCardClick} isEven={isEven}>
        {/* 第一行：类别+任务 + 招募名称+世界 + 大区 + 基本信息 */}
        <CompactRow>
          <LeftSection>
            <TitleSection>
              <div className="category">
                {getCategoryName(category)}
              </div>
              <div className="duty">
                {renderTextWithFFXIVChars(getDutyName(duty))}
              </div>
            </TitleSection>

            <NameWorldSection>
              <div className="name">
                {renderTextWithFFXIVChars(name)}
              </div>
              <div className="world">
                {home_world}
              </div>
            </NameWorldSection>

            <ServerSection>
              <div className="datacenter">
                {getDatacenterShortName(datacenter)}
                {is_cross_world && <CrossWorldTag>跨服</CrossWorldTag>}
              </div>
            </ServerSection>
          </LeftSection>

          <InfoSection>
            <SlotsSection>
              <FiUsers />
              <span className="slots">{slots_filled}/{slots_available}</span>
            </SlotsSection>

            <TimeSection isUrgent={isUrgent}>
              <FiClock />
              <span className="time">{formattedTimeLeft}</span>
            </TimeSection>
          </InfoSection>

          <ActionsSection>
            {isListingFulfilled && (
              <FulfilledIcon title="招募已满员">
                <FiCheckCircle />
              </FulfilledIcon>
            )}

            <FavoriteButton
              isFavorite={favorite}
              onClick={toggleFavorite}
              title={favorite ? "取消收藏" : "添加到收藏"}
            >
              <FiStar />
            </FavoriteButton>
          </ActionsSection>
        </CompactRow>

        {/* 第二行：简介（如果有的话） */}
        {description && (
          <CompactRow isLast>
            <div style={{
              fontSize: '11px',
              color: '#aaaaaa',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1
            }}>
              {renderTextWithFFXIVChars(description)}
            </div>
          </CompactRow>
        )}
      </CompactCard>
    </motion.div>
  );
};

export default CompactListingCard;