import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// 英文职业名到中文职业名的映射
const JOB_NAME_MAPPING = {
  // 坦克
  'PLD': '骑士',
  'WAR': '战士',
  'DRK': '暗黑骑士',
  'GNB': '绝枪战士',
  'Paladin': '骑士',
  'Warrior': '战士',
  'Dark Knight': '暗黑骑士',
  'Gunbreaker': '绝枪战士',
  
  // 治疗
  'WHM': '白魔法师',
  'SCH': '学者',
  'AST': '占星术士',
  'SGE': '贤者',
  'White Mage': '白魔法师',
  'Scholar': '学者',
  'Astrologian': '占星术士',
  'Sage': '贤者',
  
  // 近战DPS
  'MNK': '武僧',
  'DRG': '龙骑士',
  'NIN': '忍者',
  'SAM': '武士',
  'RPR': '钐镰客',
  'VPR': '蝰蛇剑士',
  'Monk': '武僧',
  'Dragoon': '龙骑士',
  'Ninja': '忍者',
  'Samurai': '武士',
  'Reaper': '钐镰客',
  'Viper': '蝰蛇剑士',
  
  // 远程物理DPS
  'BRD': '诗人',
  'MCH': '机工士',
  'DNC': '舞者',
  'Bard': '诗人',
  'Machinist': '机工士',
  'Dancer': '舞者',
  
  // 远程魔法DPS
  'BLM': '黑魔法师',
  'SMN': '召唤师',
  'RDM': '赤魔法师',
  'BLU': '青魔法师',
  'PCT': '绘灵法师',
  'Black Mage': '黑魔法师',
  'Summoner': '召唤师',
  'Red Mage': '赤魔法师',
  'Blue Mage': '青魔法师',
  'Pictomancer': '绘灵法师',
  
  // 职能
  'TANK': '坦克',
  'HEALER': '治疗',
  'DPS': 'DPS',
  'Tank': '坦克',
  'Healer': '治疗'
};

// 定义职业角色类型
const JOB_ROLES = {
  // 坦克
  'TANK': ['骑士', '战士', '暗黑骑士', '绝枪战士'],
  // 治疗
  'HEALER': ['白魔法师', '学者', '占星术士', '贤者'],
  // 近战DPS
  'MELEE_DPS': ['武僧', '龙骑士', '武士', '忍者', '钐镰客', '蝰蛇剑士'],
  // 远程物理DPS
  'PHYSICAL_RANGED_DPS': ['诗人', '机工士', '舞者'],
  // 远程魔法DPS
  'MAGICAL_RANGED_DPS': ['黑魔法师', '召唤师', '赤魔法师', '青魔法师', '绘灵法师'],
  // 生产职业
  'CRAFTER': ['刻木匠', '锻铁匠', '铸甲匠', '雕金匠', '制革匠', '裁衣匠', '炼金术士', '烹调师'],
  // 采集职业
  'GATHERER': ['采矿工', '园艺工', '捕鱼人']
};

// 职业对应的英文缩写（用于图标文件名）
const JOB_ABBREVIATIONS = {
  // 坦克
  '骑士': 'PLD',
  '战士': 'WAR',
  '暗黑骑士': 'DRK',
  '绝枪战士': 'GNB',
  // 治疗
  '白魔法师': 'WHM',
  '学者': 'SCH',
  '占星术士': 'AST',
  '贤者': 'SGE',
  // 近战DPS
  '武僧': 'MNK',
  '龙骑士': 'DRG',
  '武士': 'SAM',
  '忍者': 'NIN',
  '钐镰客': 'RPR',
  '蝰蛇剑士': 'VPR',
  // 远程物理DPS
  '诗人': 'BRD',
  '机工士': 'MCH',
  '舞者': 'DNC',
  // 远程魔法DPS
  '黑魔法师': 'BLM',
  '召唤师': 'SMN',
  '赤魔法师': 'RDM',
  '青魔法师': 'BLU',
  '绘灵法师': 'PIC',
  // 生产职业
  '刻木匠': 'CRP',
  '锻铁匠': 'BSM',
  '铸甲匠': 'ARM',
  '雕金匠': 'GSM',
  '制革匠': 'LTW',
  '裁衣匠': 'WVR',
  '炼金术士': 'ALC',
  '烹调师': 'CUL',
  // 采集职业
  '采矿工': 'MIN',
  '园艺工': 'BTN',
  '捕鱼人': 'FSH'
};

// 职业图标URL映射
const JOB_ICONS = {
  // 职能图标
  'ROLE_ALL': 'https://fu5.web.sdo.com/10036/202406/17193719548325.png',
  'ROLE_TANK': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/bordered_tank.png',
  'ROLE_ATTACK': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/062583_hr1.png',
  'ROLE_HEALER': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/bordered_healer.png',
  'ROLE_MELEE': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/bordered_dps.png',
  'ROLE_RANGED': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/bordered_dps_ranged.png',
  'ROLE_MAGIC': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/bordered_dps_magic.png',
  'ROLE_CRAFTER': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob0.png',
  'ROLE_GATHERER': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob1.png',
  
  // 坦克职业图标 - zjob0起始
  '骑士': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob0.png',
  '战士': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob1.png',
  '暗黑骑士': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob2.png',
  '绝枪战士': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob3.png',
  
  // 治疗职业图标 - 继续递增
  '白魔法师': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob4.png',
  '占星术士': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob5.png',
  '学者': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob6.png',
  '贤者': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob7.png',
  
  // 近战DPS
  '武僧': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob8.png',
  '龙骑士': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob9.png',
  '忍者': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob10.png',
  '武士': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob11.png',
  '钐镰客': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob12.png',
  
  // 远程物理DPS
  '诗人': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob13.png',
  '机工士': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob14.png',
  '舞者': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob15.png',
  
  // 远程魔法DPS
  '黑魔法师': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob16.png',
  '召唤师': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob17.png',
  '赤魔法师': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob18.png',
  '青魔法师': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/zjob19.png',
  
  // 特殊职业
  '绘灵法师': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/DoM/PCT.png',
  '蝰蛇剑士': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/DoW/VPR.png',
  
  // 生产职业图标
  '刻木匠': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob0.png',
  '锻铁匠': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob1.png',
  '铸甲匠': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob2.png',
  '雕金匠': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob3.png',
  '制革匠': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob4.png',
  '裁衣匠': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob5.png',
  '炼金术士': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob6.png',
  '烹调师': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob7.png',
  
  // 采集职业图标
  '采矿工': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob8.png',
  '园艺工': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob9.png',
  '捕鱼人': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob10.png',
  
  // 英文对应
  'CRP': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob0.png',
  'BSM': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob1.png',
  'ARM': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob2.png',
  'GSM': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob3.png',
  'LTW': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob4.png',
  'WVR': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob5.png',
  'ALC': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob6.png',
  'CUL': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob7.png',
  'MIN': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob8.png',
  'BTN': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob9.png',
  'FSH': 'https://static.web.sdo.com/jijiamobile/pic/ff14/ffstones/job/sjob10.png'
};

// 添加角色名称的中文映射
const ROLE_NAME_MAPPING = {
  'ROLE_ALL': '全部职业',
  'ROLE_TANK': '坦克职能',
  'ROLE_HEALER': '治疗职能',
  'ROLE_DPS': '输出职能',
  'ROLE_MELEE': '近战输出',
  'ROLE_RANGED': '物理远程',
  'ROLE_MAGIC': '法系职业',
  'ROLE_CRAFTER': '生产职业',
  'ROLE_GATHERER': '采集职业'
};

// 获取职业角色类型
const getRoleType = (jobName) => {
  for (const [role, jobs] of Object.entries(JOB_ROLES)) {
    if (jobs.includes(jobName)) {
      return role;
    }
  }
  return 'UNKNOWN';
};

// 获取职业角色颜色
const getRoleColor = (role) => {
  switch (role) {
    case 'TANK':
    case '坦克':
      return 'var(--tank-color)';
    case 'HEALER':
    case '治疗':
      return 'var(--healer-color)';
    case 'MELEE_DPS':
    case 'PHYSICAL_RANGED_DPS':
    case 'MAGICAL_RANGED_DPS':
    case 'DPS':
      return 'var(--dps-color)';
    default:
      return '#999';
  }
};

// 检查是否是职能组名称
const isRoleName = (job) => {
  return job === 'TANK' || job === '坦克' || 
         job === 'HEALER' || job === '治疗' || 
         job === 'DPS' || 
         job === 'ALL' || job === '全部';
};

// 检查是否应该使用职能图标
const shouldUseRoleIcon = (job) => {
  // 白魔法师职业组
  const healerJobs = ['CNJ', 'WHM', 'SCH', 'AST', 'SGE', 'Conjurer', 'White Mage', 'Scholar', 'Astrologian', 'Sage'];
  // 坦克职业组
  const tankJobs = ['GLA', 'MRD', 'PLD', 'WAR', 'DRK', 'GNB', 'Gladiator', 'Marauder', 'Paladin', 'Warrior', 'Dark Knight', 'Gunbreaker'];
  // DPS职业组
  const dpsJobs = ['LNC', 'PGL', 'ROG', 'ARC', 'THM', 'ACN', 'MNK', 'DRG', 'NIN', 'BRD', 'MCH', 'DNC', 'BLM', 'SMN', 'RDM', 'BLU', 'SAM', 'RPR', 'VPR',
                  'Lancer', 'Pugilist', 'Rogue', 'Archer', 'Thaumaturge', 'Arcanist', 'Monk', 'Dragoon', 'Ninja', 'Bard', 'Machinist', 'Dancer', 
                  'Black Mage', 'Summoner', 'Red Mage', 'Blue Mage', 'Samurai', 'Reaper', 'Viper'];

  if (healerJobs.includes(job)) {
    return 'ROLE_HEALER';
  } else if (tankJobs.includes(job)) {
    return 'ROLE_TANK';
  } else if (dpsJobs.includes(job)) {
    return 'ROLE_ATTACK';
  }
  
  return null;
};

// 检查职业组是否包含所有战斗职业
const isAllCombatJobs = (jobString) => {
  if (!jobString) return false;
  
  // 所有战斗职业的缩写
  const allCombatJobs = [
    'GLA', 'MRD', 'PLD', 'WAR', 'DRK', 'GNB',  // 坦克
    'CNJ', 'WHM', 'SCH', 'AST', 'SGE',         // 治疗
    'PGL', 'LNC', 'ROG', 'SAM', 'MNK', 'DRG', 'NIN', 'RPR', 'VPR',  // 近战DPS
    'ARC', 'BRD', 'MCH', 'DNC',                // 远程物理DPS
    'THM', 'ACN', 'BLM', 'SMN', 'RDM', 'BLU'   // 魔法DPS
  ];
  
  // 将职业字符串分割为数组并检查是否包含所有战斗职业
  const jobs = jobString.split(' ').map(job => job.trim());
  
  // 检查是否包含至少一个来自每个职能的职业
  const hasTank = jobs.some(job => ['GLA', 'MRD', 'PLD', 'WAR', 'DRK', 'GNB'].includes(job));
  const hasHealer = jobs.some(job => ['CNJ', 'WHM', 'SCH', 'AST', 'SGE'].includes(job));
  const hasMeleeDPS = jobs.some(job => ['PGL', 'LNC', 'ROG', 'SAM', 'MNK', 'DRG', 'NIN', 'RPR', 'VPR'].includes(job));
  const hasRangedDPS = jobs.some(job => ['ARC', 'BRD', 'MCH', 'DNC'].includes(job));
  const hasMagicDPS = jobs.some(job => ['THM', 'ACN', 'BLM', 'SMN', 'RDM', 'BLU'].includes(job));
  
  // 如果包含所有职能，或者职业数量超过20个，认为是所有战斗职业
  return (hasTank && hasHealer && hasMeleeDPS && hasRangedDPS && hasMagicDPS) || 
         (jobs.length >= 20 && jobs.some(job => allCombatJobs.includes(job)));
};

// 检查是否包含特定职能的所有职业
const isAllRoleJobs = (jobString, roleJobs) => {
  if (!jobString) return false;
  
  const jobs = jobString.split(' ').map(job => job.trim());
  
  // 检查是否包含指定职能的全部职业
  return roleJobs.every(roleJob => jobs.includes(roleJob));
};

// 获取职业组对应的职能图标
const getJobGroupIcon = (jobString) => {
  if (!jobString) return null;
  
  // 坦克职业组
  const tankJobs = ['GLA', 'MRD', 'PLD', 'WAR', 'DRK', 'GNB'];
  // 治疗职业组
  const healerJobs = ['CNJ', 'WHM', 'SCH', 'AST', 'SGE'];
  // 近战DPS职业组
  const meleeDpsJobs = ['PGL', 'LNC', 'ROG', 'SAM', 'MNK', 'DRG', 'NIN', 'RPR', 'VPR'];
  // 远程物理DPS职业组
  const rangedDpsJobs = ['ARC', 'BRD', 'MCH', 'DNC'];
  // 魔法DPS职业组
  const magicDpsJobs = ['THM', 'ACN', 'BLM', 'SMN', 'RDM', 'BLU'];
  // 生产职业组
  const crafterJobs = ['CRP', 'BSM', 'ARM', 'GSM', 'LTW', 'WVR', 'ALC', 'CUL'];
  // 采集职业组
  const gathererJobs = ['MIN', 'BTN', 'FSH'];
  
  // 检查是否包含所有战斗职业
  if (isAllCombatJobs(jobString)) {
    return 'ROLE_ALL';
  }
  
  // 检查是否包含特定职能的所有职业
  if (isAllRoleJobs(jobString, tankJobs)) {
    return 'ROLE_TANK';
  }
  
  if (isAllRoleJobs(jobString, healerJobs)) {
    return 'ROLE_HEALER';
  }
  
  if (isAllRoleJobs(jobString, meleeDpsJobs)) {
    return 'ROLE_MELEE';
  }
  
  if (isAllRoleJobs(jobString, rangedDpsJobs)) {
    return 'ROLE_RANGED';
  }
  
  if (isAllRoleJobs(jobString, magicDpsJobs)) {
    return 'ROLE_MAGIC';
  }
  
  if (isAllRoleJobs(jobString, crafterJobs)) {
    return 'ROLE_CRAFTER';
  }
  
  if (isAllRoleJobs(jobString, gathererJobs)) {
    return 'ROLE_GATHERER';
  }
  
  return null;
};

// 添加缓存处理函数
const cacheImage = (url, imageData) => {
  try {
    localStorage.setItem(`job_icon_${url}`, imageData);
    localStorage.setItem(`job_icon_${url}_timestamp`, Date.now().toString());
  } catch (error) {
    console.warn('保存图片到本地缓存失败:', error);
  }
};

const getCachedImage = (url) => {
  try {
    const cachedImage = localStorage.getItem(`job_icon_${url}`);
    const timestamp = localStorage.getItem(`job_icon_${url}_timestamp`);
    
    // 缓存一周有效
    const cacheValid = timestamp && (Date.now() - parseInt(timestamp)) < 7 * 24 * 60 * 60 * 1000;
    
    if (cachedImage && cacheValid) {
      return cachedImage;
    }
    return null;
  } catch (error) {
    console.warn('获取图片缓存失败:', error);
    return null;
  }
};

// 获取职业图标URL
const getJobIconUrl = (job) => {
  // 检查是否需要使用职能图标
  const roleIcon = shouldUseRoleIcon(job);
  const iconKey = roleIcon || job;
  
  // 获取图标URL
  const iconUrl = JOB_ICONS[iconKey] || null;
  
  return iconUrl;
};

// 图片加载器函数，负责加载并缓存图片
const loadAndCacheImage = async (url) => {
  if (!url) return null;
  
  // 先检查缓存
  const cachedImage = getCachedImage(url);
  if (cachedImage) {
    return cachedImage;
  }
  
  // 如果没有缓存，则加载图片并缓存
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result;
        cacheImage(url, base64data);
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('加载图片失败:', error);
    return url; // 失败时返回原始URL
  }
};

const IconContainer = styled(motion.div)`
  width: ${props => props.size};
  height: ${props => props.size};
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #333;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
`;

const JobIconText = styled.span`
  z-index: 2;
  font-weight: bold;
  font-size: calc(${props => props.size || '40px'} * 0.5);
  color: white;
`;

const JobIconImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

// 添加职业名称提示组件
const JobTooltip = styled.div`
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  padding: 6px 10px;
  background-color: rgba(0, 0, 0, 0.85);
  color: white;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  border-radius: 6px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 1050;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.85) transparent transparent transparent;
  }
`;

const JobIconContainer = styled.div`
  position: relative;
  display: inline-block;
  
  &:hover ${JobTooltip} {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
  }
`;

const JobIcon = ({ job, size = '40px', showTooltip = false, onClick }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 获取职业图标URL
  const iconUrl = getJobIconUrl(job);
  const roleType = getRoleType(job);
  const roleColor = getRoleColor(roleType);
  const localizedJob = getLocalizedJobName(job);
  const abbr = getJobAbbreviation(job);
  const isJobString = job && job.includes(',');
  const isRole = isRoleName(job) || shouldUseRoleIcon(job) || isJobString;
  
  let tooltipText = localizedJob;
  
  // 如果是角色组，尝试使用角色组的中文名称
  if (isRole && job.startsWith('ROLE_')) {
    tooltipText = ROLE_NAME_MAPPING[job] || localizedJob;
  }
  
  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      if (!iconUrl) {
        setIsLoading(false);
        return;
      }
      
      try {
        const cachedOrLoadedUrl = await loadAndCacheImage(iconUrl);
        if (isMounted) {
          setImageUrl(cachedOrLoadedUrl);
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('无法加载职业图标:', error);
          setIsLoading(false);
        }
      }
    };
    
    loadImage();
    
    return () => {
      isMounted = false;
    };
  }, [iconUrl]);
  
  return (
    <JobIconContainer className="job-icon-container" onClick={onClick}>
      <IconContainer 
        size={size} 
        isRole={isRole}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="job-icon-inner"
      >
        {isLoading ? (
          <div style={{ backgroundColor: '#333', width: '100%', height: '100%' }}></div>
        ) : imageUrl ? (
          <JobIconImage src={imageUrl} alt={tooltipText} isRole={isRole} />
        ) : (
          <div style={{ backgroundColor: roleColor, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <JobIconText size={size}>
              {abbr}
            </JobIconText>
          </div>
        )}
      </IconContainer>
      {showTooltip && (
        <JobTooltip className="job-tooltip">{tooltipText}</JobTooltip>
      )}
    </JobIconContainer>
  );
};

// 添加本地化职业名称获取函数
const getLocalizedJobName = (job) => {
  if (!job) return '';
  
  // 首先检查JOB_NAME_MAPPING中是否存在映射
  if (JOB_NAME_MAPPING[job]) {
    return JOB_NAME_MAPPING[job];
  }

  // 处理特殊角色名称
  if (job === 'ANY') return '任意职业';
  if (job === 'TANK') return '坦克职能';
  if (job === 'HEALER') return '治疗职能';
  if (job === 'DPS') return '输出职能';
  if (job === 'MELEE') return '近战职能';
  if (job === 'RANGED') return '远程职能';
  if (job === 'CASTER') return '法系职能';
  
  // 处理ROLE_前缀的角色组
  if (job.startsWith('ROLE_')) {
    return ROLE_NAME_MAPPING[job] || job.replace('ROLE_', '');
  }
  
  return job;
};

// 添加职业缩写获取函数
const getJobAbbreviation = (job) => {
  if (!job) return '';
  
  // 首先检查JOB_ABBREVIATIONS中是否存在映射
  if (JOB_ABBREVIATIONS[job]) {
    return JOB_ABBREVIATIONS[job];
  }
  
  // 处理ROLE_前缀的角色组
  if (job.startsWith('ROLE_')) {
    const roleType = job.replace('ROLE_', '');
    return roleType.substring(0, 3).toUpperCase();
  }
  
  // 默认返回职业名称的前三个字符
  return job.substring(0, 3).toUpperCase();
};

export default JobIcon; 