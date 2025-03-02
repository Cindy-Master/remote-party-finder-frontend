import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import JobIcon from './JobIcon';
import '../styles/JobIcon.css';
import '../styles/JobSelector.css';

// 职能图标常量
const ROLE_ICONS = {
  '坦克': 'ROLE_TANK',
  '治疗': 'ROLE_HEALER',
  '近战DPS': 'ROLE_MELEE',
  '远程物理DPS': 'ROLE_RANGED',
  '远程魔法DPS': 'ROLE_MAGIC',
  '全部职业': 'ROLE_ALL',
  '生产': 'ROLE_CRAFTER',
  '采集': 'ROLE_GATHERER'
};

const Container = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: var(--card-bg, white);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  color: var(--text-color);
  transition: border-color 0.3s, box-shadow 0.3s;

  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(94, 100, 209, 0.2);
  }
  
  [data-theme="dark"] & {
    background-color: var(--card-bg-dark, #2a2a2a);
  }
`;

const SelectedJobsDisplay = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 40px;
`;

const PlaceholderText = styled.span`
  color: var(--text-secondary);
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background-color: var(--card-bg-dark, #202020);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  padding: 15px;
`;

const JobFilterTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 15px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 10px;
`;

const FilterTab = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'rgba(0, 0, 0, 0.05)'};
  
  &:hover {
    transform: scale(1.1);
    background-color: ${props => props.active ? 'var(--primary-color)' : 'rgba(0, 0, 0, 0.1)'};
  }
  
  .job-icon-image {
    width: 28px !important;
    height: 28px !important;
    border-radius: 6px !important;
  }
`;

const FilterTabTooltip = styled.div`
  position: absolute;
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 1010;
  
  ${FilterTab}:hover & {
    opacity: 1;
    visibility: visible;
  }
`;

const JobsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 10px;
  margin-top: 15px;
`;

const JobItem = styled(motion.div)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  background-color: ${props => props.isSelected ? 'rgba(94, 100, 209, 0.3)' : 'rgba(255, 255, 255, 0.05)'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'rgba(94, 100, 209, 0.4)' : 'rgba(255, 255, 255, 0.1)'};
    transform: translateY(-2px);
  }
`;

const SelectAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  background: var(--primary-color);
  border: none;
  color: white;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 16px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

// 定义职业组和其包含的职业
const JOB_GROUPS = {
  '坦克': ['骑士', '战士', '暗黑骑士', '绝枪战士'],
  '治疗': ['白魔法师', '学者', '占星术士', '贤者'],
  '近战DPS': ['武僧', '龙骑士', '武士', '忍者', '钐镰客', '蝰蛇剑士'],
  '远程物理DPS': ['诗人', '机工士', '舞者'],
  '远程魔法DPS': ['黑魔法师', '召唤师', '赤魔法师', '青魔法师', '绘灵法师'],
  '生产': ['刻木匠', '锻铁匠', '铸甲匠', '雕金匠', '制革匠', '裁衣匠', '炼金术士', '烹调师'],
  '采集': ['采矿工', '园艺工', '捕鱼人']
};

// 获取所有职业列表
const ALL_JOBS = Object.values(JOB_GROUPS).flat();

// 在定义JOB_GROUPS之前添加这个角色名称映射
const ROLE_NAME_MAPPING = {
  '全部': '全部职业',
  '坦克': '坦克职能',
  '治疗': '治疗职能',
  '近战DPS': '近战输出',
  '远程物理DPS': '物理远程',
  '远程魔法DPS': '法系职业',
  '生产': '生产职业',
  '采集': '采集职业'
};

const JobSelector = ({ onChange, value = [], label = "职业" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState(value);
  const [activeFilter, setActiveFilter] = useState('全部');

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleJobClick = (job) => {
    const updatedJobs = selectedJobs.includes(job)
      ? selectedJobs.filter(j => j !== job)
      : [...selectedJobs, job];
    
    setSelectedJobs(updatedJobs);
    onChange && onChange(updatedJobs);
  };

  const handleRemoveJob = (job) => {
    const updatedJobs = selectedJobs.filter(j => j !== job);
    setSelectedJobs(updatedJobs);
    onChange && onChange(updatedJobs);
  };

  const selectAllInGroup = (group) => {
    const groupJobs = group === '全部' ? ALL_JOBS : JOB_GROUPS[group];
    const updatedJobs = [...new Set([...selectedJobs, ...groupJobs])];
    setSelectedJobs(updatedJobs);
    onChange && onChange(updatedJobs);
  };

  const clearAllInGroup = (group) => {
    const groupJobs = group === '全部' ? ALL_JOBS : JOB_GROUPS[group];
    const updatedJobs = selectedJobs.filter(job => !groupJobs.includes(job));
    setSelectedJobs(updatedJobs);
    onChange && onChange(updatedJobs);
  };

  // 检查一个组是否全部选中
  const isGroupAllSelected = (group) => {
    const groupJobs = group === '全部' ? ALL_JOBS : JOB_GROUPS[group];
    return groupJobs.every(job => selectedJobs.includes(job));
  };

  // 获取要显示的职业列表
  const getJobsToDisplay = () => {
    if (activeFilter === '全部') {
      return ALL_JOBS;
    }
    return JOB_GROUPS[activeFilter] || [];
  };

  return (
    <Container className="job-selector">
      <Label>{label}</Label>
      <DropdownContainer>
        <DropdownHeader onClick={toggleDropdown}>
          <SelectedJobsDisplay>
            {selectedJobs.length === 0 ? (
              <PlaceholderText>选择职业...</PlaceholderText>
            ) : (
              selectedJobs.slice(0, 10).map(job => (
                <JobIcon 
                  key={job} 
                  job={job} 
                  size="40px" 
                  showTooltip={true} 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveJob(job);
                  }}
                />
              ))
            )}
            {selectedJobs.length > 10 && (
              <div className="more-jobs-count">
                +{selectedJobs.length - 10}
              </div>
            )}
          </SelectedJobsDisplay>
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </DropdownHeader>
        
        <AnimatePresence>
          {isOpen && (
            <DropdownMenu
              className="job-selector-dropdown"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <JobFilterTabs className="job-filter-tabs">
                <FilterTab 
                  active={activeFilter === '全部'} 
                  onClick={() => setActiveFilter('全部')}
                  className={`filter-tab ${activeFilter === '全部' ? 'active' : ''}`}
                >
                  <JobIcon job={ROLE_ICONS['全部职业']} size="28px" />
                  <div className="filter-tab-tooltip">全部职业</div>
                </FilterTab>
                {Object.keys(JOB_GROUPS).map(group => (
                  <FilterTab 
                    key={group} 
                    active={activeFilter === group} 
                    onClick={() => setActiveFilter(group)}
                    className={`filter-tab ${activeFilter === group ? 'active' : ''}`}
                  >
                    <JobIcon job={ROLE_ICONS[group] || group} size="28px" />
                    <div className="filter-tab-tooltip">{ROLE_NAME_MAPPING[group] || group}</div>
                  </FilterTab>
                ))}
                
                <SelectAllButton onClick={() => {
                  isGroupAllSelected(activeFilter) 
                    ? clearAllInGroup(activeFilter)
                    : selectAllInGroup(activeFilter)
                }}>
                  {isGroupAllSelected(activeFilter) ? '取消全选' : '全选'}
                  {isGroupAllSelected(activeFilter) ? <FiX size={14} /> : <FiCheck size={14} />}
                </SelectAllButton>
              </JobFilterTabs>
              
              <JobsGrid className="job-grid">
                {getJobsToDisplay().map(job => (
                  <JobItem 
                    key={job}
                    className={`job-item ${selectedJobs.includes(job) ? 'selected' : ''}`}
                    isSelected={selectedJobs.includes(job)}
                    onClick={() => handleJobClick(job)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <JobIcon job={job} size="40px" showTooltip={true} />
                    {selectedJobs.includes(job) && (
                      <SelectedBadge>
                        <FiCheck size={12} />
                      </SelectedBadge>
                    )}
                  </JobItem>
                ))}
              </JobsGrid>
            </DropdownMenu>
          )}
        </AnimatePresence>
      </DropdownContainer>
    </Container>
  );
};

export default JobSelector; 