import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getListings } from '../services/api';
import ListingCard from './ListingCard';
import SearchFilter from './SearchFilter';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';
import { useListings } from '../contexts/ListingsContext';
import '../styles/HomePage.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
};

const HomePage = () => {
  const { isDarkMode } = useTheme();
  const {
    listings,
    pagination,
    filters,
    hasLoadedData,
    updateListings,
    updateFilters,
    updatePage
  } = useListings();
  
  const [loading, setLoading] = useState(!hasLoadedData);
  const [error, setError] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(!hasLoadedData);
  const isManualSearchRef = useRef(false);

  useEffect(() => {
    // 只在首次加载时获取数据
    const isInitialMount = !hasLoadedData;
    if (isInitialMount) {
      console.log("初始加载数据");
      fetchListings();
    }
  }, []);  // 移除依赖，仅在组件挂载时执行一次

  // 单独监听筛选条件和页码变化，防止重复请求
  useEffect(() => {
    // 如果是手动搜索触发的更新，跳过这次useEffect的执行
    if (hasLoadedData && !isManualSearchRef.current) {  
      console.log("筛选条件或页码变化，重新加载数据");
      fetchListings();
    }
    // 重置手动搜索标志
    isManualSearchRef.current = false;
  }, [pagination.page, JSON.stringify(filters)]);  // 使用JSON.stringify确保对象比较

  const handleSearch = (searchFilters) => {
    // 搜索时更新筛选条件并立即触发数据加载
    console.log("搜索条件:", searchFilters);
    updatePage(1);
    updateFilters(searchFilters);
    // 设置手动搜索标志，防止useEffect再次触发请求
    isManualSearchRef.current = true;
    // 使用最新的搜索条件直接调用fetchListings
    fetchListingsWithFilters(searchFilters);
  };

  // 新增：使用指定筛选条件的获取函数
  const fetchListingsWithFilters = async (specificFilters) => {
    setLoading(true);
    try {
      // 使用传入的筛选条件，而不是从状态中获取
      const currentPage = pagination.page;
      
      // 构建API请求参数
      const params = {
        page: currentPage,
        per_page: pagination.per_page,
        ...specificFilters
      };
      
      // 清理空字符串的过滤条件
      Object.keys(params).forEach(key => 
        params[key] === '' && delete params[key]
      );

      console.log("API请求参数:", params);
      const data = await getListings(params);
      updateListings(data.data, data.pagination);
      setError(null);
      // 首次加载后关闭标志，后续刷新不会重新触发入场动画
      if (isFirstLoad) setIsFirstLoad(false);
    } catch (err) {
      console.error('获取招募列表失败:', err);
      setError('获取招募信息时发生错误，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchListings = async () => {
    setLoading(true);
    try {
      // 获取最新的filters和pagination状态
      const currentFilters = filters;
      const currentPage = pagination.page;
      
      // 构建API请求参数
      const params = {
        page: currentPage,
        per_page: pagination.per_page,
        ...currentFilters
      };
      
      // 清理空字符串的过滤条件
      Object.keys(params).forEach(key => 
        params[key] === '' && delete params[key]
      );

      console.log("API请求参数:", params);
      const data = await getListings(params);
      updateListings(data.data, data.pagination);
      setError(null);
      // 首次加载后关闭标志，后续刷新不会重新触发入场动画
      if (isFirstLoad) setIsFirstLoad(false);
    } catch (err) {
      console.error('获取招募列表失败:', err);
      setError('获取招募信息时发生错误，请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    updatePage(page);
    // 翻页时滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div 
      className={`home-page ${isDarkMode ? 'dark-mode' : ''}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container">
        <motion.div 
          className="page-header"
          variants={headerVariants}
        >
          <h1>最终幻想14招募列表</h1>
          <p>浏览当前服务器上的所有招募信息</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SearchFilter onSearch={handleSearch} initialFilters={filters} />
        </motion.div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.div>
        ) : listings.length === 0 ? (
          <motion.div 
            className="no-results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p>没有找到符合条件的招募信息</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div 
              className="listings-container"
              variants={containerVariants}
            >
              {listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                >
                  <ListingCard listing={listing} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && !error && listings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default HomePage; 