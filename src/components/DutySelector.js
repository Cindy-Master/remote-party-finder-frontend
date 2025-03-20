import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FiChevronDown, FiChevronUp, FiCheck, FiX, FiSearch } from 'react-icons/fi';
import { searchDuties, getDutyNameById } from '../utils/dutyData';
import { useTheme } from '../contexts/ThemeContext';

// 样式定义
const Container = styled.div`
  position: relative;
  width: 100%;
  font-family: 'Roboto', sans-serif;
  margin-bottom: 15px;
`;

const Label = styled.div`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-color);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: ${props => props.isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
  border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
  color: ${props => props.isDarkMode ? 'white' : 'black'};
  
  &:hover {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(94, 100, 209, 0.2);
  }
`;

const SelectedDisplay = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 24px;
`;

const PlaceholderText = styled.span`
  color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
`;

const SelectedDutyTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background-color: ${props => props.isDarkMode ? 'rgba(94, 100, 209, 0.3)' : 'rgba(94, 100, 209, 0.1)'};
  color: ${props => props.isDarkMode ? 'white' : 'black'};
  border-radius: 4px;
  font-size: 13px;
  
  &:hover {
    background-color: ${props => props.isDarkMode ? 'rgba(94, 100, 209, 0.4)' : 'rgba(94, 100, 209, 0.2)'};
  }
  
  .remove-icon {
    cursor: pointer;
    display: flex;
    align-items: center;
    
    &:hover {
      color: var(--primary-color);
    }
  }
`;

const MoreCount = styled.div`
  background-color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  color: ${props => props.isDarkMode ? 'white' : 'black'};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
`;

const ChevronIcon = styled(motion.div)`
  display: flex;
  align-items: center;
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownMenu = styled(motion.div)`
  position: fixed;
  background-color: ${props => props.isDarkMode ? 'rgba(25, 25, 25, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  max-height: 80vh;
  display: flex;
  flex-direction: column;
`;

const SearchContainer = styled.div`
  padding: 12px;
  border-bottom: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 36px;
  border-radius: 6px;
  border: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  background-color: ${props => props.isDarkMode ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
  color: ${props => props.isDarkMode ? 'white' : 'black'};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 22px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
`;

const ClearButton = styled.button`
  position: absolute;
  right: 22px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
  cursor: pointer;
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  padding: 5px;
`;

const DutyList = styled.div`
  padding: 0;
  overflow-y: auto;
  max-height: 300px;
`;

const DutyItem = styled(motion.div)`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.isSelected ? 
    (props.isDarkMode ? 'rgba(75, 81, 192, 0.2)' : 'rgba(75, 81, 192, 0.1)') : 
    'transparent'
  };
  
  &:hover {
    background-color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  }
`;

const DutyName = styled.div`
  font-size: 14px;
  flex: 1;
`;

const DutyId = styled.div`
  font-size: 12px;
  color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'};
  margin-left: 8px;
`;

const CheckIcon = styled.div`
  color: var(--primary-color);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
`;

const SelectedBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  background-color: var(--primary-color);
  color: white;
  position: absolute;
  top: -5px;
  right: -5px;
  font-size: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px;
  border-top: 1px solid ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  gap: 8px;
`;

const Button = styled.button`
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ClearAllButton = styled(Button)`
  background-color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  color: ${props => props.isDarkMode ? 'white' : 'black'};
`;

const SelectAllButton = styled(Button)`
  background-color: var(--primary-color);
  color: white;
`;

const EmptyState = styled.div`
  padding: 30px 20px;
  text-align: center;
  color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
  font-size: 14px;
`;

const LoadingState = styled.div`
  padding: 30px 20px;
  text-align: center;
  color: ${props => props.isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)'};
  font-size: 14px;
`;

// 假设我们按类型分组副本
const DUTY_CATEGORIES = {
  '迷宫挑战': [],
  '讨伐歼灭战': [],
  '大型任务': [],
  '高难度任务': [],
  '其他': []
};

// 获取副本名称的缓存
const dutyNamesCache = new Map();

// 根据ID获取副本名称（带缓存）
const getCachedDutyName = async (id) => {
  if (dutyNamesCache.has(id)) {
    return dutyNamesCache.get(id);
  }
  const name = await getDutyNameById(id);
  dutyNamesCache.set(id, name);
  return name;
};

const DutySelector = ({ onChange, value = [], label = "副本筛选" }) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDuties, setFilteredDuties] = useState([]);
  const [selectedDuties, setSelectedDuties] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayNames, setDisplayNames] = useState([]); // 用于显示已选择的副本名称
  
  const headerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // 当外部传入的 value 变化时，同步内部状态
  useEffect(() => {
    setSelectedDuties(value);
    
    // 加载已选择副本的名称
    const loadDutyNames = async () => {
      if (value.length > 0) {
        const names = await Promise.all(value.map(id => getCachedDutyName(id)));
        setDisplayNames(names.map((name, index) => ({ id: value[index], name })));
      } else {
        setDisplayNames([]);
      }
    };
    
    loadDutyNames();
  }, [value]);

  // 加载和搜索副本数据
  useEffect(() => {
    let isMounted = true;
    
    const loadDuties = async () => {
      setIsLoading(true);
      try {
        const duties = await searchDuties(searchTerm);
        if (isMounted) {
          setFilteredDuties(duties);
        }
      } catch (error) {
        console.error('搜索副本失败:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadDuties();
    
    return () => {
      isMounted = false;
    };
  }, [searchTerm]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    
    if (!isOpen) {
      updateDropdownPosition();
    }
  };

  const updateDropdownPosition = () => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 5,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  // 点击外部区域时关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        headerRef.current && !headerRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 页面滚动或窗口变化时关闭下拉框
  useEffect(() => {
    const handleScrollOrResize = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener('scroll', handleScrollOrResize);
    window.addEventListener('resize', handleScrollOrResize);
    
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleDutyClick = (dutyId) => {
    let newSelection;
    
    if (selectedDuties.includes(dutyId)) {
      newSelection = selectedDuties.filter(id => id !== dutyId);
    } else {
      newSelection = [...selectedDuties, dutyId];
    }
    
    setSelectedDuties(newSelection);
    onChange(newSelection);
  };

  const handleRemoveDuty = (dutyId, e) => {
    if (e) {
      e.stopPropagation(); // 防止触发下拉框切换
    }
    
    const newSelection = selectedDuties.filter(id => id !== dutyId);
    setSelectedDuties(newSelection);
    onChange(newSelection);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };
  
  const clearAllSelection = () => {
    setSelectedDuties([]);
    setDisplayNames([]);
    onChange([]);
  };
  
  const selectAllVisible = () => {
    if (filteredDuties.length === 0) return;
    
    const visibleDutyIds = filteredDuties.map(duty => duty.id);
    const newSelection = [...new Set([...selectedDuties, ...visibleDutyIds])];
    
    setSelectedDuties(newSelection);
    onChange(newSelection);
    
    // 更新显示名称
    const loadDutyNames = async () => {
      const names = await Promise.all(newSelection.map(id => getCachedDutyName(id)));
      setDisplayNames(names.map((name, index) => ({ id: newSelection[index], name })));
    };
    
    loadDutyNames();
  };

  return (
    <Container>
      <Label>{label}</Label>
      <Header 
        ref={headerRef} 
        onClick={toggleDropdown} 
        isDarkMode={isDarkMode}
      >
        <SelectedDisplay>
          {selectedDuties.length === 0 ? (
            <PlaceholderText isDarkMode={isDarkMode}>选择副本...</PlaceholderText>
          ) : (
            <>
              {displayNames.slice(0, 3).map(duty => (
                <SelectedDutyTag 
                  key={duty.id} 
                  isDarkMode={isDarkMode}
                >
                  {duty.name}
                  <span 
                    className="remove-icon"
                    onClick={(e) => handleRemoveDuty(duty.id, e)}
                  >
                    <FiX size={14} />
                  </span>
                </SelectedDutyTag>
              ))}
              {selectedDuties.length > 3 && (
                <MoreCount isDarkMode={isDarkMode}>
                  +{selectedDuties.length - 3}
                </MoreCount>
              )}
            </>
          )}
        </SelectedDisplay>
        <ChevronIcon>
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </ChevronIcon>
      </Header>
      
      <DropdownContainer>
        {isOpen && 
          createPortal(
            <AnimatePresence>
              <DropdownMenu
                ref={dropdownRef}
                isDarkMode={isDarkMode}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ 
                  top: dropdownPosition.top, 
                  left: dropdownPosition.left,
                  width: dropdownPosition.width
                }}
              >
                <SearchContainer isDarkMode={isDarkMode}>
                  <SearchIcon isDarkMode={isDarkMode}>
                    <FiSearch />
                  </SearchIcon>
                  <SearchInput
                    isDarkMode={isDarkMode}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索副本..."
                    autoFocus
                  />
                  <ClearButton 
                    isDarkMode={isDarkMode}
                    show={searchTerm.length > 0}
                    onClick={clearSearch}
                  >
                    <FiX />
                  </ClearButton>
                </SearchContainer>
                
                <DutyList>
                  {isLoading ? (
                    <LoadingState isDarkMode={isDarkMode}>
                      加载中...
                    </LoadingState>
                  ) : filteredDuties.length === 0 ? (
                    <EmptyState isDarkMode={isDarkMode}>
                      {searchTerm ? '找不到匹配的副本' : '没有可用的副本数据'}
                    </EmptyState>
                  ) : (
                    filteredDuties.map(duty => (
                      <DutyItem
                        key={duty.id}
                        isSelected={selectedDuties.includes(duty.id)}
                        isDarkMode={isDarkMode}
                        onClick={() => handleDutyClick(duty.id)}
                        whileTap={{ scale: 0.98 }}
                      >
                        <DutyName>{duty.name}</DutyName>
                        <DutyId isDarkMode={isDarkMode}>{duty.id}</DutyId>
                        <CheckIcon show={selectedDuties.includes(duty.id)}>
                          <FiCheck />
                        </CheckIcon>
                      </DutyItem>
                    ))
                  )}
                </DutyList>
                
                <ButtonsContainer isDarkMode={isDarkMode}>
                  {selectedDuties.length > 0 && (
                    <ClearAllButton 
                      isDarkMode={isDarkMode}
                      onClick={clearAllSelection}
                    >
                      <FiX size={14} />
                      清除所有
                    </ClearAllButton>
                  )}
                  
                  {filteredDuties.length > 0 && (
                    <SelectAllButton 
                      onClick={selectAllVisible}
                    >
                      <FiCheck size={14} />
                      全选当前
                    </SelectAllButton>
                  )}
                </ButtonsContainer>
              </DropdownMenu>
            </AnimatePresence>,
            document.body
          )
        }
      </DropdownContainer>
    </Container>
  );
};

export default DutySelector; 