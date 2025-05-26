import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getListings } from '../services/api';
import { playAlarmSound, sendNotification } from '../services/notificationService';

// 创建上下文
const FavoritesContext = createContext();

// 最大收藏数量
const MAX_FAVORITES = 5;

// 上下文提供者组件
export const FavoritesProvider = ({ children }) => {
  // 存储收藏的招募
  const [favorites, setFavorites] = useState(() => {
    // 从本地存储中加载收藏数据
    const savedFavorites = localStorage.getItem('ffxiv-favorites');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  
  // 存储已满员的招募ID
  const [fulfilledListings, setFulfilledListings] = useState(new Set());
  
  // 存储是否启用通知
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notifications-enabled') === 'true';
  });
  
  // 存储是否启用声音
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('sound-enabled') === 'true';
  });
  
  // 存储音频元素
  const [audioElement, setAudioElement] = useState(null);

  // 将收藏数据保存到本地存储
  useEffect(() => {
    localStorage.setItem('ffxiv-favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  // 保存通知设置
  useEffect(() => {
    localStorage.setItem('notifications-enabled', notificationsEnabled);
  }, [notificationsEnabled]);
  
  // 保存声音设置
  useEffect(() => {
    localStorage.setItem('sound-enabled', soundEnabled);
  }, [soundEnabled]);
  
  // 清理音频元素
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
  }, [audioElement]);
  
  // 添加到收藏
  const addToFavorites = (listing) => {
    setFavorites(prev => {
      // 如果已经在收藏中，不做任何改变
      if (prev.some(item => item.id === listing.id)) {
        return prev;
      }
      
      // 如果收藏已满，提示用户
      if (prev.length >= MAX_FAVORITES) {
        alert(`收藏夹已满，最多可收藏${MAX_FAVORITES}个招募`);
        return prev;
      }
      
      // 添加到收藏，保存必要的信息
      return [...prev, {
        id: listing.id,
        name: listing.name,
        category: listing.category,
        duty: listing.duty,
        home_world: listing.home_world,
        datacenter: listing.datacenter,
        time_left: listing.time_left,
        slots_filled: listing.slots_filled,
        slots_available: listing.slots_available,
        saved_at: new Date().toISOString(),
        fulfilled: false
      }];
    });
  };
  
  // 从收藏中移除
  const removeFromFavorites = (listingId) => {
    setFavorites(prev => prev.filter(item => item.id !== listingId));
    setFulfilledListings(prev => {
      const newSet = new Set(prev);
      newSet.delete(listingId);
      return newSet;
    });
  };
  
  // 清空所有已满员的收藏
  const clearFulfilledFavorites = () => {
    setFavorites(prev => prev.filter(item => !fulfilledListings.has(item.id)));
    setFulfilledListings(new Set());
  };
  
  // 清空全部收藏
  const clearAllFavorites = () => {
    setFavorites([]);
    setFulfilledListings(new Set());
  };
  
  // 检查收藏的招募是否已满员
  const checkFavoritesFulfillment = useCallback(async () => {
    if (favorites.length === 0) return;
    
    try {
      // 为每个收藏的招募创建筛选条件
      const checkPromises = favorites.map(async (favorite) => {
        // 构建查询参数，只筛选同类型和同大区的招募，不包括duty
        const params = {
          category: favorite.category,
          datacenter: favorite.datacenter
        };
        
        // 获取招募列表
        const response = await getListings(params);
        const listings = response.data;
        
        if (!listings || listings.length === 0) return;
        
        // 按照剩余时间排序（从小到大）
        listings.sort((a, b) => a.time_left - b.time_left);
        
        // 找到目标招募在排序后的位置
        const targetIndex = listings.findIndex(l => l.id === favorite.id);
        if (targetIndex === -1) return; // 找不到目标招募
        
        // 寻找整个数组中的满人分界点
        let fulfillmentBoundaryIndex = -1;
        
        for (let i = 1; i < listings.length; i++) {
          if (listings[i].time_left < listings[i-1].time_left) {
            fulfillmentBoundaryIndex = i;
            break;
          }
        }
        
        // 判断是否满员
        let isFulfilled = false;
        
        if (listings.length <= 3) {
          // 如果招募数量少于等于3个，使用updated_at判断
          // 找到更新时间最新的招募
          const newestListing = [...listings].sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          )[0];
          
          // 如果目标招募是最新更新的，则认为未满员，否则认为已满员
          isFulfilled = favorite.id !== newestListing.id;
        } else if (fulfillmentBoundaryIndex !== -1) {
          // 如果找到满人分界点，判断目标招募是否在分界点及之后
          isFulfilled = targetIndex >= fulfillmentBoundaryIndex;
        }
        
        // 如果招募已满员且之前未标记为满员，触发通知
        if (isFulfilled && !fulfilledListings.has(favorite.id)) {
          console.log(`招募已满员: ${favorite.name}`);
          
          // 更新已满员集合
          setFulfilledListings(prev => {
            const newSet = new Set(prev);
            newSet.add(favorite.id);
            return newSet;
          });
          
          // 更新收藏状态
          setFavorites(prev => 
            prev.map(item => 
              item.id === favorite.id 
                ? { ...item, fulfilled: true } 
                : item
            )
          );
          
          // 触发通知
          if (notificationsEnabled) {
            sendNotification(`招募已满员: ${favorite.name}`, {
              body: `任务: ${favorite.duty || '未指定'}\n服务器: ${favorite.home_world}`,
              onClick: () => {
                window.focus();
                // 导航到收藏页面
                window.location.href = '/favorites';
              }
            });
          }
          
          // 播放声音
          if (soundEnabled) {
            const audio = playAlarmSound();
            setAudioElement(audio);
          }
        }
      });
      
      // 等待所有检查完成
      await Promise.all(checkPromises);
      
    } catch (error) {
      console.error('检查收藏招募状态失败:', error);
    }
  }, [favorites, fulfilledListings, notificationsEnabled, soundEnabled]);
  
  // 每分钟检查一次收藏的招募状态
  useEffect(() => {
    // 初始检查
    checkFavoritesFulfillment();
    
    // 设置定时器，每分钟检查一次
    const intervalId = setInterval(checkFavoritesFulfillment, 60000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [checkFavoritesFulfillment]);
  
  // 切换通知开关
  const toggleNotifications = () => {
    console.log('切换通知状态，当前状态:', notificationsEnabled, '→', !notificationsEnabled);
    setNotificationsEnabled(prev => !prev);
  };
  
  // 切换声音开关
  const toggleSound = () => {
    console.log('切换声音状态，当前状态:', soundEnabled, '→', !soundEnabled);
    setSoundEnabled(prev => !prev);
  };
  
  // 检查是否已收藏
  const isFavorite = (listingId) => {
    return favorites.some(item => item.id === listingId);
  };
  
  // 检查是否已满员
  const isFulfilled = (listingId) => {
    return fulfilledListings.has(listingId);
  };
  
  // 提供给上下文的值
  const value = {
    favorites,
    fulfilledListings,
    notificationsEnabled,
    soundEnabled,
    addToFavorites,
    removeFromFavorites,
    clearFulfilledFavorites,
    clearAllFavorites,
    toggleNotifications,
    toggleSound,
    isFavorite,
    isFulfilled,
    MAX_FAVORITES
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

// 自定义钩子用于访问上下文
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}; 