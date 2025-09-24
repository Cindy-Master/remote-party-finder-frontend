import React, { createContext, useContext, useState } from 'react';

// 创建上下文
const ListingsContext = createContext();

// 上下文提供者组件
export const ListingsProvider = ({ children }) => {
  // 存储招募列表数据
  const [listings, setListings] = useState([]);
  // 存储分页信息
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 0
  });
  // 存储筛选条件
  const [filters, setFilters] = useState({
    datacenter: '陆行鸟,猫小胖,莫古力,豆豆柴'
  });
  // 存储是否已加载数据的标志
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // 更新列表数据
  const updateListings = (newListings, newPagination) => {
    setListings(newListings);
    setPagination(newPagination);
    setHasLoadedData(true);
  };

  // 更新筛选条件
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // 更新页码
  const updatePage = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  // 重置所有数据
  const resetListingsData = () => {
    setListings([]);
    setPagination({
      total: 0,
      page: 1,
      per_page: 20,
      total_pages: 0
    });
    setFilters({
      datacenter: '陆行鸟,猫小胖,莫古力,豆豆柴'
    });
    setHasLoadedData(false);
  };

  // 提供给上下文的值
  const value = {
    listings,
    pagination,
    filters,
    hasLoadedData,
    updateListings,
    updateFilters,
    updatePage,
    resetListingsData
  };

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
};

// 自定义钩子用于访问上下文
export const useListings = () => {
  const context = useContext(ListingsContext);
  if (context === undefined) {
    throw new Error('useListings must be used within a ListingsProvider');
  }
  return context;
};