import axios from 'axios';

const API_URL = 'https://xivpf.littlenightmare.top/api';

// 中文类别名称到英文的映射
export const CATEGORY_ZH_TO_EN = {
  '随机任务': 'DutyRoulette',
  '迷宫挑战': 'Dungeons',
  '行会令': 'Guildhests',
  '讨伐歼灭战': 'Trials',
  '大型任务': 'Raids',
  '高难度任务': 'HighEndDuty',
  '玩家对战': 'Pvp',
  '金碟游乐场': 'GoldSaucer',
  '危命任务': 'Fates',
  '寻宝': 'TreasureHunt',
  '怪物狩猎': 'TheHunt',
  '采集活动': 'GatheringForays',
  '深层迷宫': 'DeepDungeons',
  '特殊场景探索': 'FieldOperations',
  '特殊迷宫探索': 'VariantAndCriterionDungeonFinder',
  '无': 'None'
};

// 英文类别名称到中文的映射
export const CATEGORY_EN_TO_ZH = {
  'DutyRoulette': '随机任务',
  'Dungeons': '迷宫挑战',
  'Guildhests': '行会令',
  'Trials': '讨伐歼灭战',
  'Raids': '大型任务',
  'HighEndDuty': '高难度任务',
  'Pvp': '玩家对战',
  'GoldSaucer': '金碟游乐场',
  'Fates': '危命任务',
  'TreasureHunt': '寻宝',
  'TheHunt': '怪物狩猎',
  'GatheringForays': '采集活动',
  'DeepDungeons': '深层迷宫',
  'FieldOperations': '特殊场景探索',
  'VariantAndCriterionDungeonFinder': '特殊迷宫探索',
  'None': '无'
};

// 创建axios实例
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 获取列表数据
export const getListings = async (params = {}) => {
  try {
    // 如果有类别参数，将中文类别转为英文
    if (params.category && CATEGORY_ZH_TO_EN[params.category]) {
      params.category = CATEGORY_ZH_TO_EN[params.category];
    }
    
    // 将 query 参数重命名为 search
    if (params.query !== undefined) {
      params.search = params.query;
      delete params.query;
    }
    
    // 将 server 参数重命名为 world
    if (params.server !== undefined) {
      params.world = params.server;
      delete params.server;
    }
    
    // 处理副本ID数组参数
    if (params.duty && Array.isArray(params.duty) && params.duty.length > 0) {
      // API需要duty[]格式，无需修改，axios会自动处理数组参数
      console.log('正在按副本筛选:', params.duty);
    }
    
    const response = await api.get('/listings', { params });
    
    // 处理响应数据，将英文类别转为中文
    if (response.data && Array.isArray(response.data.listings)) {
      response.data.listings = response.data.listings.map(listing => {
        if (listing.category && CATEGORY_EN_TO_ZH[listing.category]) {
          listing.category = CATEGORY_EN_TO_ZH[listing.category];
        } else if (listing.category) {
          // 处理可能未包含在映射中的类别名称
          console.log('未找到类别映射:', listing.category);
        }
        return listing;
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('获取列表数据失败:', error);
    throw error;
  }
};

// 获取单个列表详情
export const getListingDetails = async (id) => {
  try {
    const response = await api.get(`/listing/${id}`);
    
    // 处理响应数据，将英文类别转为中文
    if (response.data && response.data.category && CATEGORY_EN_TO_ZH[response.data.category]) {
      response.data.category = CATEGORY_EN_TO_ZH[response.data.category];
    } else if (response.data && response.data.category) {
      // 处理可能未包含在映射中的类别名称
      console.log('未找到类别映射:', response.data.category);
    }
    
    return response.data;
  } catch (error) {
    console.error(`获取列表ID ${id} 的详情失败:`, error);
    throw error;
  }
};

export default api; 