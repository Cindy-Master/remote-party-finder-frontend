import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // 如果还没有加载过数据，或者筛选条件/页码变化，则获取数据
    if (!hasLoadedData || pagination.page !== 1) {
      fetchListings();
    }
  }, [pagination.page, filters, hasLoadedData]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      // 构建API请求参数
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
        ...filters
      };
      
      // 清理空字符串的过滤条件
      Object.keys(params).forEach(key => 
        params[key] === '' && delete params[key]
      );

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

  const handleSearch = (searchFilters) => {
    // 搜索时重置页码并更新筛选条件
    updatePage(1);
    updateFilters(searchFilters);
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