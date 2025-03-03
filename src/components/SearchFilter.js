import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import AnimatedButton from './AnimatedButton';
import JobSelector from './JobSelector';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/SearchFilter.css';

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
  const [query, setQuery] = useState(initialFilters.query || '');
  const [filters, setFilters] = useState({
    server: initialFilters.server || '',
    datacenter: initialFilters.datacenter || '',
    category: initialFilters.category || '',
    jobs: initialFilters.jobs || [],
  });
  const [filtersExpanded, setFiltersExpanded] = useState(
    // 如果有任何初始过滤条件，则展开过滤器
    Object.values(initialFilters).some(value => 
      value && (Array.isArray(value) ? value.length > 0 : true)
    )
  );
  
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
    onSearch({ query, ...filters });
  };
  
  const clearFilters = () => {
    setQuery('');
    setFilters({
      server: '',
      datacenter: '',
      category: '',
      jobs: [],
    });
  };
  
  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };
  
  const clearSearch = () => {
    setQuery('');
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
      <SearchBox isDarkMode={isDarkMode}>
        <SearchIcon isDarkMode={isDarkMode}>
          <FiSearch />
        </SearchIcon>
        <input
          type="text"
          placeholder="搜索招募信息..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <ClearButton 
          isDarkMode={isDarkMode}
          show={query.length > 0}
          onClick={clearSearch}
          whileTap={{ scale: 0.9 }}
        >
          <FiX />
        </ClearButton>
      </SearchBox>
      
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
          </FilterOptions>
          
          <ButtonGroup
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatedButton 
              variant="outline"
              onClick={clearFilters}
              iconLeft={<FiX />}
            >
              清除筛选
            </AnimatedButton>
            
            <AnimatedButton 
              variant="primary"
              onClick={handleSearch}
              iconRight={<FiSearch />}
            >
              搜索
            </AnimatedButton>
          </ButtonGroup>
        </FilterSection>
      )}
    </FilterContainer>
  );
};

export default SearchFilter; 