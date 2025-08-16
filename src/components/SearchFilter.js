import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiSearch, FiFilter, FiX, FiChevronDown, FiInfo } from 'react-icons/fi';
import AnimatedButton from './AnimatedButton';
import JobSelector from './JobSelector';
import DutySelector from './DutySelector';
import { useTheme } from '../contexts/ThemeContext';
import { expandSearchQuery, containsFFXIVChars } from '../utils/unicodeUtils';
import '../styles/SearchFilter.css';

// 本地存储键
const STORAGE_KEY = 'ff14_pf_filter_settings';

// 保存筛选条件到本地存储
const saveFiltersToLocalStorage = (filters, query) => {
  try {
    const filterData = {
      ...filters,
      query,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filterData));
    console.log('筛选条件已保存到本地存储');
  } catch (error) {
    console.error('保存筛选条件失败:', error);
  }
};

// 从本地存储读取筛选条件
const loadFiltersFromLocalStorage = () => {
  try {
    const filterData = localStorage.getItem(STORAGE_KEY);
    if (!filterData) return null;
    
    const parsedData = JSON.parse(filterData);
    // 移除时间戳字段
    const { timestamp, ...filters } = parsedData;
    
    // 检查保存时间是否超过7天
    const now = Date.now();
    const isExpired = now - timestamp > 7 * 24 * 60 * 60 * 1000; // 7天过期时间
    
    if (isExpired) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    console.log('已从本地存储加载筛选条件');
    return filters;
  } catch (error) {
    console.error('读取筛选条件失败:', error);
    return null;
  }
};

const FilterContainer = styled(motion.div)`
  background-color: ${props => props.isDarkMode ? 'rgba(25, 25, 25, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
`;

const SearchBox = styled(motion.div)`
  position: relative;
  margin-bottom: 15px;
  
  input {
    width: 100%;
    padding: 12px 20px 12px 45px;
    border-radius: 6px;
    border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    background-color: ${props => props.isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
    color: ${props => props.isDarkMode ? 'white' : 'black'};
    font-size: 16px;
    transition: all 0.3s ease;
    
    &:focus {
      box-shadow: 0 0 0 2px var(--primary-color-light);
      border-color: var(--primary-color);
      outline: none;
    }
  }
`;

const SearchIcon = styled(motion.div)`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
  font-size: 20px;
`;

const ClearButton = styled(motion.button)`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
  cursor: pointer;
  display: ${props => props.show ? 'block' : 'none'};
  padding: 0;
  font-size: 18px;
`;

const UnicodeHint = styled(motion.div)`
  position: absolute;
  right: 45px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
  font-size: 14px;
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  gap: 4px;
  pointer-events: none;
`;

const SearchHint = styled(motion.div)`
  font-size: 12px;
  color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
  margin-top: 5px;
  padding: 8px 12px;
  background-color: ${props => props.isDarkMode ? 'rgba(30, 30, 30, 0.5)' : 'rgba(255, 255, 255, 0.5)'};
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
`;

const FilterSection = styled(motion.div)`
  margin-top: 15px;
`;

const FilterHeader = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  
  h3 {
    display: flex;
    align-items: center;
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    
    svg {
      margin-right: 8px;
    }
  }
`;

const ChevronIcon = styled(motion.div)`
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0)'};
  transition: transform 0.3s ease;
`;

const FilterOptions = styled(motion.div)`
  padding: 10px 0;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
`;

const ButtonGroup = styled(motion.div)`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const SearchFilter = ({ onSearch, initialFilters = {} }) => {
  const { isDarkMode } = useTheme();
  
  // 在组件初始化时，尝试从本地存储读取筛选条件
  const loadedFilters = loadFiltersFromLocalStorage() || initialFilters;
  
  const [query, setQuery] = useState(loadedFilters.query || '');
  const [filters, setFilters] = useState({
    server: loadedFilters.server || '',
    datacenter: loadedFilters.datacenter || '',
    category: loadedFilters.category || '',
    jobs: loadedFilters.jobs || [],
    duty: loadedFilters.duty || [],
  });
  
  // 新增状态：检测Unicode字符
  const [hasUnicodeChars, setHasUnicodeChars] = useState(false);
  const [showUnicodeHint, setShowUnicodeHint] = useState(false);
  
  const [filtersExpanded, setFiltersExpanded] = useState(
    // 如果有任何初始过滤条件，则展开过滤器
    Object.values(loadedFilters).some(value => 
      value && (Array.isArray(value) ? value.length > 0 : true)
    )
  );
  
  // 组件挂载时，如果有本地存储的筛选条件，自动执行搜索
  useEffect(() => {
    if (loadedFilters && Object.keys(loadedFilters).length > 0) {
      // 如果有本地存储的筛选条件，使用这些条件执行搜索
      onSearch({ query, ...filters });
    }
  }, []);
  
  // 国服大区
  const datacenters = ['陆行鸟', '莫古力', '猫小胖', '豆豆柴'];
  
  // 国服服务器列表（根据大区分组）
  const servers = {
    '陆行鸟': ['红玉海', '神意之地', '拉诺西亚', '幻影群岛', '萌芽池', '宇宙和音', '沃仙曦染', '晨曦王座'],
    '莫古力': ['白银乡', '白金幻象', '神拳痕', '潮风亭', '旅人栈桥', '拂晓之间', '龙巢神殿', '梦羽宝境'],
    '猫小胖': ['紫水栈桥', '延夏', '静语庄园', '摩杜纳', '海猫茶屋', '柔风海湾', '琥珀原'],
    '豆豆柴': ['水晶塔', '银泪湖', '太阳海岸', '伊修加德', '红茶川']
  };
  
  // 类别选项（汉化后）
  const categories = [
    '随机任务', 
    '迷宫挑战', 
    '行会令', 
    '讨伐歼灭战', 
    '大型任务', 
    '高难度任务',
    '玩家对战',
    '金碟游乐场',
    '危命任务',
    '寻宝',
    '怪物狩猎',
    '采集活动',
    '深层迷宫',
    '特殊场景探索',
    '特殊迷宫探索',
    '无'
  ];
  
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };
  
  const handleSearch = () => {
    console.log("提交搜索条件:", { query, ...filters });
    
    // 处理Unicode字符的搜索查询
    const expandedQuery = expandSearchQuery(query);
    const finalFilters = { 
      ...filters,
      query: expandedQuery !== query ? expandedQuery : query 
    };
    
    // 执行搜索
    onSearch(finalFilters);
    
    // 保存筛选条件到本地存储
    saveFiltersToLocalStorage(filters, query);
  };
  
  const clearFilters = () => {
    setQuery('');
    setFilters({
      server: '',
      datacenter: '',
      category: '',
      jobs: [],
      duty: [],
    });
    
    // 清除本地存储的筛选条件
    localStorage.removeItem(STORAGE_KEY);
  };
  
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };
  
  const clearSearch = () => {
    setQuery('');
    setHasUnicodeChars(false);
    setShowUnicodeHint(false);
  };
  
  // 监听搜索框输入，检测Unicode字符
  const handleQueryChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // 检测是否包含Unicode转义序列或FF14字符
    const hasUnicode = /\\u[0-9A-Fa-f]{4}|\\u\{[0-9A-Fa-f]+\}|U\+[0-9A-Fa-f]+|0x[0-9A-Fa-f]+/.test(newQuery) || 
                      containsFFXIVChars(newQuery);
    setHasUnicodeChars(hasUnicode);
    
    // 显示转换提示
    if (hasUnicode && newQuery.length > 0) {
      setShowUnicodeHint(true);
      // 3秒后自动隐藏提示
      setTimeout(() => setShowUnicodeHint(false), 3000);
    } else {
      setShowUnicodeHint(false);
    }
  };
  
  useEffect(() => {
    // 如果选择了大区但没有选择服务器，重置服务器选择
    if (filters.datacenter && !servers[filters.datacenter]?.includes(filters.server)) {
      setFilters(prevFilters => ({
        ...prevFilters,
        server: ''
      }));
    }
  }, [filters.datacenter]);
  
  return (
    <FilterContainer 
      isDarkMode={isDarkMode}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <SearchBox isDarkMode={isDarkMode} style={{ flex: 1, marginBottom: 0 }}>
          <SearchIcon isDarkMode={isDarkMode}>
            <FiSearch />
          </SearchIcon>
          <input
            type="text"
            placeholder="搜索招募信息... (支持 \\uE044 等FF14特殊字符)"
            value={query}
            onChange={handleQueryChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <UnicodeHint 
            isDarkMode={isDarkMode}
            show={hasUnicodeChars}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <FiInfo size={12} />
            Unicode
          </UnicodeHint>
          <ClearButton 
            isDarkMode={isDarkMode}
            show={query.length > 0}
            onClick={clearSearch}
            whileTap={{ scale: 0.9 }}
          >
            <FiX />
          </ClearButton>
        </SearchBox>
        
        <AnimatedButton 
          variant="primary"
          onClick={() => handleSearch()}
          iconRight={<FiSearch />}
        >
          搜索
        </AnimatedButton>
      </div>
      
      {/* Unicode字符搜索提示 */}
      {showUnicodeHint && (
        <SearchHint
          isDarkMode={isDarkMode}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          💡 检测到FF14特殊字符！支持搜索格式：\\uE044, \\u{'{E044}'}, U+E044, 0xE044
        </SearchHint>
      )}
      
      <FilterHeader onClick={toggleFilters}>
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <FiFilter />
          <span>高级筛选</span>
        </motion.h3>
        <ChevronIcon expanded={filtersExpanded}>
          <FiChevronDown />
        </ChevronIcon>
      </FilterHeader>
      
      {filtersExpanded && (
        <FilterSection
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FilterOptions>
            <FiltersGrid>
              <div className="filter-group">
                <label>大区</label>
                <select 
                  value={filters.datacenter}
                  onChange={(e) => handleFilterChange('datacenter', e.target.value)}
                >
                  <option value="">所有大区</option>
                  {datacenters.map(dc => (
                    <option key={dc} value={dc}>{dc}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>服务器</label>
                <select 
                  value={filters.server}
                  onChange={(e) => handleFilterChange('server', e.target.value)}
                  disabled={!filters.datacenter}
                >
                  <option value="">所有服务器</option>
                  {filters.datacenter && servers[filters.datacenter]?.map(server => (
                    <option key={server} value={server}>{server}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>类别</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">所有类别</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </FiltersGrid>
            
            {/* 职业选择器 */}
            <div style={{ marginTop: '15px' }}>
              <JobSelector
                label="职业筛选"
                value={filters.jobs}
                onChange={(selectedJobs) => handleFilterChange('jobs', selectedJobs)}
              />
            </div>
            
            {/* 副本选择器 */}
            <div style={{ marginTop: '15px' }}>
              <DutySelector
                label="副本筛选"
                value={filters.duty}
                onChange={(selectedDuties) => handleFilterChange('duty', selectedDuties)}
              />
            </div>
          </FilterOptions>
          
          <ButtonGroup
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatedButton 
              variant="outline"
              onClick={() => clearFilters()}
              iconLeft={<FiX />}
            >
              清除筛选
            </AnimatedButton>
          </ButtonGroup>
        </FilterSection>
      )}
    </FilterContainer>
  );
};

export default SearchFilter; 