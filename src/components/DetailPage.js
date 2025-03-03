import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiArrowLeft, FiClock, FiInfo, FiUsers, FiList, FiMapPin } from 'react-icons/fi';
import { getListingDetails } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import JobIcon from './JobIcon';
import { useTheme } from '../contexts/ThemeContext';
import { formatTimeLeft, isUrgentTime } from '../utils/timeUtils';
import '../styles/DetailPage.css';

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 10px;
  color: var(--primary-color);
`;

const BackButton = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: var(--primary-color);
  font-size: 16px;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

// 用于包裹"剩余时间"、"所属服务器"、"创建服务器"的容器
const MetaInfoContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  margin: 20px 0;
  gap: 20px;
`;

// 每一项信息的样式
const MetaInfoItem = styled.div`
  background: var(--meta-bg, #f9f9f9);
  border-radius: 8px;
  padding: 10px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  color: var(--text-color);

  svg {
    margin-right: 8px;
    font-size: 1.5rem;
    color: var(--primary-color);
  }
  
  strong {
    margin-right: 5px;
  }
  
  /* 黑夜模式下提高对比度 */
  .dark-mode & {
    background: rgba(25, 25, 25, 0.8);
    color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  
  /* 黑夜模式下紧急提示样式 */
  .dark-mode &.urgent {
    background: rgba(229, 57, 53, 0.2);
    color: rgba(255, 255, 255, 0.95);
  }
`;

const JobsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  max-width: 100%;
`;

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  })
};

const DetailPage = () => {
  const { id } = useParams();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchListingDetails();
  }, [id]);

  const fetchListingDetails = async () => {
    setLoading(true);
    try {
      const data = await getListingDetails(id);
      setListing(data);
      setError(null);
    } catch (err) {
      console.error(`获取招募ID ${id} 的详情失败:`, err);
      setError('此招募已不存在');
    } finally {
      setLoading(false);
    }
  };

  // 返回到上一页，而不是直接跳转到首页
  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="loading-container container">
        <LoadingSpinner message="加载招募详情中，请稍候..." />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="error-container container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="error-message">{error}</div>
        <button onClick={handleGoBack} className="back-link">返回</button>
      </motion.div>
    );
  }

  if (!listing) {
    return (
      <motion.div 
        className="not-found container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>招募不存在</h2>
        <p>无法找到ID为 {id} 的招募信息</p>
        <button onClick={handleGoBack} className="back-link">返回</button>
      </motion.div>
    );
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'TANK':
      case '坦克':
      case 'Tank':
        return 'role-tank';
      case 'HEALER':
      case '治疗':
      case 'Healer':
        return 'role-healer';
      case 'DPS':
      case 'Melee DPS':
      case 'Physical Ranged DPS':
      case 'Magical Ranged DPS':
        return 'role-dps';
      case 'CRAFTER':
      case 'Crafter':
      case 'DoH':
      case '生产职业':
      case 'ROLE_CRAFTER':
        return 'role-crafter';
      case 'GATHERER':
      case 'Gatherer':
      case 'DoL':
      case '采集职业':
      case 'ROLE_GATHERER':
        return 'role-gatherer';
      default:
        // 尝试根据职业名称判断类型
        if (/^(CRP|BSM|ARM|GSM|LTW|WVR|ALC|CUL|刻木匠|锻铁匠|铸甲匠|雕金匠|制革匠|裁衣匠|炼金术士|烹调师)$/.test(role)) {
          return 'role-crafter';
        }
        if (/^(MIN|BTN|FSH|采矿工|园艺工|捕鱼人)$/.test(role)) {
          return 'role-gatherer';
        }
        return '';
    }
  };

  // 将逗号分隔的职业字符串转换为数组
  const parseJobString = (jobString) => {
    if (!jobString) return [];
    return jobString.split(',').map(job => job.trim());
  };

  // 获取本地化的职业名称
  const getLocalizedJobName = (job) => {
    if (job === 'ANY') return '任意职业';
    if (job === 'TANK') return '坦克职能';
    if (job === 'HEALER') return '治疗职能';
    if (job === 'DPS') return '输出职能';
    if (job === 'MELEE') return '近战职能';
    if (job === 'RANGED') return '远程职能';
    if (job === 'CASTER') return '法系职能';
    return job;
  };

  const formattedTimeLeft = formatTimeLeft(listing.time_left);
  const isUrgent = isUrgentTime(listing.time_left);

  return (
    <motion.div 
      className={`detail-page container ${isDarkMode ? 'dark-mode' : ''}`}
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <motion.div 
        className="back-navigation"
        variants={fadeIn}
        custom={0}
      >
        <BackButton 
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoBack}
        >
          <FiArrowLeft /> 返回列表
        </BackButton>
      </motion.div>

      <motion.div 
        className="detail-card"
        variants={fadeIn}
        custom={1}
      >
        <motion.div 
          className="detail-header"
          variants={fadeIn}
          custom={2}
        >
          <h1>{listing.name}</h1>
          {/* 新的美观布局 */}
          <MetaInfoContainer>
            <MetaInfoItem className={isUrgent ? 'urgent' : ''}>
              <FiClock />
              <strong>剩余时间:</strong> {formattedTimeLeft}
            </MetaInfoItem>
            <MetaInfoItem>
              <FiMapPin />
              <strong>所属服务器:</strong> {listing.home_world} ({listing.datacenter})
            </MetaInfoItem>
            <MetaInfoItem>
              <FiMapPin />
              <strong>创建服务器:</strong> {listing.created_world}
              {listing.is_cross_world && (
                <motion.span 
                  className="cross-world-badge"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    marginLeft: '8px',
                    fontSize: '0.9rem',
                    background: '#FFA500',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    color: '#fff'
                  }}
                >
                  跨服招募
                </motion.span>
              )}
            </MetaInfoItem>
          </MetaInfoContainer>
        </motion.div>

        <div className="detail-info">
          <motion.div 
            className="info-section"
            variants={fadeIn}
            custom={5}
          >
            <h2>
              <IconWrapper><FiInfo /></IconWrapper>
              招募信息
            </h2>
            <div className="info-grid">
              <motion.div 
                className="info-item"
                variants={fadeIn}
                custom={6}
                whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)" }}
              >
                <span className="info-label">任务：</span>
                <span>{listing.duty || '未指定'}</span>
              </motion.div>
              <motion.div 
                className="info-item"
                variants={fadeIn}
                custom={7}
                whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)" }}
              >
                <span className="info-label">类别：</span>
                <span>{listing.category === 'None' ? '无' : listing.category}</span>
              </motion.div>
              <motion.div 
                className="info-item"
                variants={fadeIn}
                custom={8}
                whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)" }}
              >
                <span className="info-label">最低装等：</span>
                <span>{listing.min_item_level}</span>
              </motion.div>
              <motion.div 
                className="info-item"
                variants={fadeIn}
                custom={9}
                whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)" }}
              >
                <span className="info-label">人数：</span>
                <span>{listing.slots_filled}/{listing.slots_available}</span>
              </motion.div>
              <motion.div 
                className="info-item"
                variants={fadeIn}
                custom={10}
                whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)" }}
              >
                <span className="info-label">更新时间：</span>
                <span>{new Date(listing.updated_at).toLocaleString('zh-CN')}</span>
              </motion.div>
              <motion.div 
                className="info-item"
                variants={fadeIn}
                custom={11}
                whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)" }}
              >
                <span className="info-label">欢迎新人：</span>
                <span>{listing.beginners_welcome ? '是' : '否'}</span>
              </motion.div>
              {listing.description && (
                <motion.div 
                  className="info-item description-item"
                  variants={fadeIn}
                  custom={12}
                  whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)" }}
                >
                  <span className="info-label">招募说明：</span>
                  <span className="description-content">{listing.description}</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div 
            className="info-section"
            variants={fadeIn}
            custom={13}
          >
            <h2>
              <IconWrapper><FiList /></IconWrapper>
              招募条件
            </h2>
            <div className="condition-info">
              <motion.div 
                className="condition-item"
                variants={fadeIn}
                custom={14}
                whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)" }}
              >
                <span className="info-label">目标：</span>
                <span>{listing.objective === 'NONE' ? '无' : listing.objective}</span>
              </motion.div>
              <motion.div 
                className="condition-item"
                variants={fadeIn}
                custom={15}
                whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)" }}
              >
                <span className="info-label">条件：</span>
                <span>{listing.conditions === 'NONE' ? '无' : listing.conditions}</span>
              </motion.div>
              <motion.div 
                className="condition-item"
                variants={fadeIn}
                custom={16}
                whileHover={{ y: -3, boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)" }}
              >
                <span className="info-label">分配规则：</span>
                <span>{listing.loot_rules === 'NONE' ? '无' : listing.loot_rules}</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="slots-section"
            variants={fadeIn}
            custom={17}
          >
            <h2>
              <IconWrapper><FiUsers /></IconWrapper>
              成员配置
            </h2>
            <div className="slots-grid">
              {listing.slots.map((slot, index) => {
                // 根据slot.job判断职业类型
                let roleClass = getRoleColor(slot.role);
                
                // 如果没有获取到职业类型，则尝试从job中判断
                if (!roleClass && slot.job) {
                  roleClass = getRoleColor(slot.job);
                }
                
                return (
                  <motion.div
                    key={index}
                    className={`slot-item ${slot.filled ? 'filled' : 'empty'} ${roleClass}`}
                    variants={fadeIn}
                    custom={18 + index * 0.5}
                    whileHover={{ 
                      y: -5, 
                      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="slot-header">
                      <span className="slot-number">#{index + 1}</span>
                      <span className="slot-status">{slot.filled ? '已加入' : '空'}</span>
                    </div>
                    
                    {slot.filled ? (
                      <div className="job-info">
                        <JobIcon job={slot.job} size="50px" showTooltip={true} />
                      </div>
                    ) : (
                      <div className="available-jobs">
                        <span className="available-label">可选职业：</span>
                        <JobsContainer>
                          {parseJobString(slot.job).map((job, idx) => (
                            <JobIcon key={idx} job={job} size="40px" showTooltip={true} />
                          ))}
                        </JobsContainer>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DetailPage;
