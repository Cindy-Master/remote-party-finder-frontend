import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getListings } from '../services/api';
import { playAlarmSound } from '../services/notificationService';

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
  
  // 存储已过期的招募ID
  const [expiredListings, setExpiredListings] = useState(new Set());
  
  // 存储是否启用声音
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('sound-enabled') === 'true';
  });
  
  // 存储音频元素
  const [audioElement, setAudioElement] = useState(null);
  
  // 添加一个锁状态来防止重叠执行
  const [isChecking, setIsChecking] = useState(false);
  
  // 用于取消定时器的引用
  const intervalRef = React.useRef(null);
  
  // 使用ref存储最新状态，避免闭包问题
  const favoritesRef = React.useRef(favorites);
  const fulfilledListingsRef = React.useRef(fulfilledListings);
  const expiredListingsRef = React.useRef(expiredListings);
  const soundEnabledRef = React.useRef(soundEnabled);
  
  // 更新ref值
  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);
  
  useEffect(() => {
    fulfilledListingsRef.current = fulfilledListings;
  }, [fulfilledListings]);
  
  useEffect(() => {
    expiredListingsRef.current = expiredListings;
  }, [expiredListings]);
  
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);
  
  // 将收藏数据保存到本地存储
  useEffect(() => {
    localStorage.setItem('ffxiv-favorites', JSON.stringify(favorites));
  }, [favorites]);
  
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
  const addToFavorites = async (listing) => {
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
      const newFavorite = {
        id: listing.id,
        name: listing.name,
        category: listing.category,
        duty: listing.duty,
        description: listing.description || '',
        home_world: listing.home_world,
        datacenter: listing.datacenter,
        time_left: listing.time_left,
        slots_filled: listing.slots_filled,
        slots_available: listing.slots_available,
        saved_at: new Date().toISOString(),
        fulfilled: false
      };
      
      // 添加收藏后立即检查该招募是否已满
      checkFavoriteFullStatus(newFavorite);
      
      return [...prev, newFavorite];
    });
  };
  
  // 添加一个新函数，用于检查单个收藏的满员状态
  const checkFavoriteFullStatus = async (favorite) => {
    try {
      console.log(`[满人检查] 开始检查收藏招募满员状态: ${favorite.name} (ID: ${favorite.id})`);
      // 构建查询参数，只筛选同类型和同大区的招募
      const params = {
        category: favorite.category,
        datacenter: favorite.datacenter,
        per_page: 100  // 增加每页数量，确保能获取足够的招募数据
      };
      
      console.log(`[满人检查] 请求参数: `, params);
      
      // 获取招募列表
      const response = await getListings(params);
      const listings = response.data;
      
      // 打印API响应数据
      console.log(`[满人检查] API响应数据:`, response);
      console.log(`[满人检查] 招募列表数据:`, listings);
      
      if (!listings || listings.length === 0) {
        console.log(`[满人检查] 未找到符合条件的招募列表`);
        return;
      }
      
      console.log(`[满人检查] 共找到 ${listings.length} 个相关招募`);
      
      // 不再对数据进行排序，直接使用API返回的顺序
      
      // 找到目标招募在列表中的位置
      const targetIndex = listings.findIndex(l => l.id === favorite.id);
      if (targetIndex === -1) {
        console.log(`[满人检查] 在招募列表中未找到目标招募 ID: ${favorite.id}`);
        return; // 找不到目标招募
      }
      
      console.log(`[满人检查] 目标招募在列表中的位置: ${targetIndex + 1}/${listings.length}`);
      
      // 打印招募列表的time_left值，用于分析
      console.log(`[满人检查] 招募列表time_left值:`);
      listings.forEach((listing, idx) => {
        console.log(`  [${idx + 1}] ID: ${listing.id}, time_left: ${listing.time_left}秒${listing.id === favorite.id ? ' (目标招募)' : ''}`);
      });
      
      // 寻找整个数组中的满人分界点 - 直接使用API返回的顺序查找time_left突然变小的位置
      let fulfillmentBoundaryIndex = -1;
      
      for (let i = 1; i < listings.length; i++) {
        if (listings[i].time_left < listings[i-1].time_left) {
          fulfillmentBoundaryIndex = i;
          console.log(`[满人检查] 找到满人分界点: 位置=${fulfillmentBoundaryIndex + 1}, 剩余时间=${listings[i].time_left}秒 < ${listings[i-1].time_left}秒`);
          break;
        }
      }
      
      // 判断是否满员
      let isFulfilled = false;
      let fulfillmentReason = '';
      
      if (fulfillmentBoundaryIndex !== -1) {
        // 如果找到满人分界点，判断目标招募是否在分界点及之后
        isFulfilled = targetIndex >= fulfillmentBoundaryIndex;
        fulfillmentReason = `目标招募位置(${targetIndex + 1}) ${isFulfilled ? '>=' : '<'} 分界点位置(${fulfillmentBoundaryIndex + 1})`;
      } else {
        // 特殊情况: 未找到满人分界点，则检查更新时间是否超过5分钟
        console.log(`[满人检查] 未找到满人分界点，使用更新时间判断`);
        
        const currentTime = new Date();
        const listing = listings.find(l => l.id === favorite.id);
        
        if (listing && listing.updated_at) {
          const updatedTime = new Date(listing.updated_at);
          const timeDiffMinutes = (currentTime - updatedTime) / (1000 * 60);
          
          console.log(`[满人检查] 招募更新时间: ${updatedTime.toLocaleString()}`);
          console.log(`[满人检查] 当前时间: ${currentTime.toLocaleString()}`);
          console.log(`[满人检查] 时间差: ${timeDiffMinutes.toFixed(2)} 分钟`);
          
          isFulfilled = timeDiffMinutes > 5;
          fulfillmentReason = `招募更新时间距离现在 ${timeDiffMinutes.toFixed(2)} 分钟, ${isFulfilled ? '>' : '<='} 5分钟`;
        } else {
          console.log(`[满人检查] 找不到招募的更新时间，无法判断满员状态`);
        }
      }
      
      console.log(`[满人检查] 招募"${favorite.name}"满员状态: ${isFulfilled ? '已满员' : '未满员'}, 原因: ${fulfillmentReason}`);
      
      // 如果招募已满员，标记为满员
      if (isFulfilled) {
        console.log(`[满人检查] 标记招募"${favorite.name}"为已满员`);
        
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
      }
      
    } catch (error) {
      console.error('[满人检查] 检查收藏招募状态失败:', error);
    }
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
  
  // 清空所有已过期的收藏
  const clearExpiredFavorites = () => {
    setFavorites(prev => prev.filter(item => !expiredListings.has(item.id)));
    setExpiredListings(new Set());
  };
  
  // 清空全部收藏
  const clearAllFavorites = () => {
    setFavorites([]);
    setFulfilledListings(new Set());
    setExpiredListings(new Set());
  };
  
  // 检查收藏的招募是否已满员 - 使用ref值而不是依赖注入
  const checkFavoritesFulfillment = useCallback(async () => {
    // 如果已经在检查中，跳过此次检查
    if (isChecking) {
      console.log('[定时检查] 上一次检查尚未完成，跳过此次检查');
      return;
    }
    
    // 使用ref中的最新值
    const currentFavorites = favoritesRef.current;
    const currentFulfilledListings = fulfilledListingsRef.current;
    const currentExpiredListings = expiredListingsRef.current;
    const isSoundEnabled = soundEnabledRef.current;
    
    if (currentFavorites.length === 0) {
      console.log('[定时检查] 没有收藏的招募，跳过检查');
      return;
    }
    
    // 设置锁，防止重叠执行
    setIsChecking(true);
    console.log(`[定时检查] 开始检查 ${currentFavorites.length} 个收藏招募的满员状态`);
    
    try {
      // 过滤掉已满员和已过期的招募，只检查活跃招募
      const activeListings = currentFavorites.filter(
        favorite => !currentFulfilledListings.has(favorite.id) && !currentExpiredListings.has(favorite.id)
      );
      
      if (activeListings.length === 0) {
        console.log('[定时检查] 没有需要检查的活跃招募，全部已满员或已过期');
        return;
      }
      
      console.log(`[定时检查] 过滤后需要检查的活跃招募数量: ${activeListings.length}`);
      
      // 按category和datacenter分组，减少重复请求
      const groupedListings = {};
      activeListings.forEach(listing => {
        const key = `${listing.category}-${listing.datacenter}`;
        if (!groupedListings[key]) {
          groupedListings[key] = {
            params: {
              category: listing.category,
              datacenter: listing.datacenter,
              per_page: 100
            },
            listings: []
          };
        }
        groupedListings[key].listings.push(listing);
      });
      
      console.log(`[定时检查] 分组后的请求数量: ${Object.keys(groupedListings).length}`);
      
      // 为每组创建请求
      const groupPromises = Object.values(groupedListings).map(async (group) => {
        console.log(`[定时检查] 请求参数: `, group.params);
        
        // 获取招募列表
        const response = await getListings(group.params);
        const apiListings = response.data;
        
        // 打印API响应数据
        console.log(`[定时检查] API响应数据:`, response);
        console.log(`[定时检查] 招募列表数据:`, apiListings);
        
        if (!apiListings || apiListings.length === 0) {
          console.log(`[定时检查] 未找到符合条件的招募列表`);
          
          // 如果API没有返回任何招募，将此组中的所有招募标记为过期
          group.listings.forEach(favorite => {
            console.log(`[定时检查] 标记招募为已过期 (无数据): ${favorite.name} (ID: ${favorite.id})`);
            setExpiredListings(prev => {
              const newSet = new Set(prev);
              newSet.add(favorite.id);
              return newSet;
            });
            
            setFavorites(prev => 
              prev.map(item => 
                item.id === favorite.id 
                  ? { ...item, expired: true } 
                  : item
              )
            );
          });
          
          return;
        }
        
        console.log(`[定时检查] 共找到 ${apiListings.length} 个相关招募`);
        
        // 打印招募列表的time_left值，用于分析
        console.log(`[定时检查] 招募列表time_left值:`);
        apiListings.forEach((listing, idx) => {
          console.log(`  [${idx + 1}] ID: ${listing.id}, time_left: ${listing.time_left}秒`);
        });
        
        // 寻找满人分界点
        let fulfillmentBoundaryIndex = -1;
        for (let i = 1; i < apiListings.length; i++) {
          if (apiListings[i].time_left < apiListings[i-1].time_left) {
            fulfillmentBoundaryIndex = i;
            console.log(`[定时检查] 找到满人分界点: 位置=${fulfillmentBoundaryIndex + 1}, 剩余时间=${apiListings[i].time_left}秒 < ${apiListings[i-1].time_left}秒`);
            break;
          }
        }
        
        // 处理此组中的每个收藏招募
        await Promise.all(group.listings.map(async (favorite) => {
          // 找到目标招募在API返回列表中的位置
          const targetIndex = apiListings.findIndex(l => l.id === favorite.id);
          
          if (targetIndex === -1) {
            console.log(`[定时检查] 在招募列表中未找到目标招募 ID: ${favorite.id}，标记为已过期`);
            
            // 更新已过期集合
            setExpiredListings(prev => {
              const newSet = new Set(prev);
              newSet.add(favorite.id);
              return newSet;
            });
            
            // 更新收藏状态
            setFavorites(prev => 
              prev.map(item => 
                item.id === favorite.id 
                  ? { ...item, expired: true } 
                  : item
              )
            );
            
            return; // 找不到目标招募，不继续检查
          }
          
          // 招募存在，更新最新数据
          const updatedListing = apiListings[targetIndex];
          setFavorites(prev => 
            prev.map(item => 
              item.id === favorite.id 
                ? { 
                    ...item, 
                    time_left: updatedListing.time_left,
                    slots_filled: updatedListing.slots_filled,
                    slots_available: updatedListing.slots_available,
                    updated_at: updatedListing.updated_at,
                    expired: false
                  } 
                : item
            )
          );
          
          console.log(`[定时检查] 目标招募在列表中的位置: ${targetIndex + 1}/${apiListings.length}`);
          
          // 判断是否满员
          let isFulfilled = false;
          let fulfillmentReason = '';
          
          if (fulfillmentBoundaryIndex !== -1) {
            // 如果找到满人分界点，判断目标招募是否在分界点及之后
            isFulfilled = targetIndex >= fulfillmentBoundaryIndex;
            fulfillmentReason = `目标招募位置(${targetIndex + 1}) ${isFulfilled ? '>=' : '<'} 分界点位置(${fulfillmentBoundaryIndex + 1})`;
          } else {
            // 特殊情况: 未找到满人分界点，则检查更新时间是否超过5分钟
            console.log(`[定时检查] 未找到满人分界点，使用更新时间判断`);
            
            const currentTime = new Date();
            const listing = apiListings[targetIndex];
            
            if (listing && listing.updated_at) {
              const updatedTime = new Date(listing.updated_at);
              const timeDiffMinutes = (currentTime - updatedTime) / (1000 * 60);
              
              console.log(`[定时检查] 招募更新时间: ${updatedTime.toLocaleString()}`);
              console.log(`[定时检查] 当前时间: ${currentTime.toLocaleString()}`);
              console.log(`[定时检查] 时间差: ${timeDiffMinutes.toFixed(2)} 分钟`);
              
              isFulfilled = timeDiffMinutes > 5;
              fulfillmentReason = `招募更新时间距离现在 ${timeDiffMinutes.toFixed(2)} 分钟, ${isFulfilled ? '>' : '<='} 5分钟`;
            } else {
              console.log(`[定时检查] 找不到招募的更新时间，无法判断满员状态`);
            }
          }
          
          console.log(`[定时检查] 招募"${favorite.name}"满员状态: ${isFulfilled ? '已满员' : '未满员'}, 原因: ${fulfillmentReason}`);
          
          // 如果招募已满员且之前未标记为满员
          if (isFulfilled && !currentFulfilledListings.has(favorite.id)) {
            console.log(`[定时检查] 新发现满员招募: ${favorite.name}`);
            
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
            
            // 播放声音
            if (isSoundEnabled) {
              console.log(`[定时检查] 播放满员提示音`);
              const audio = playAlarmSound();
              setAudioElement(audio);
            }
          } else if (isFulfilled) {
            console.log(`[定时检查] 招募已在之前被标记为满员: ${favorite.name}`);
          }
        }));
      });
      
      // 等待所有组的检查完成
      await Promise.all(groupPromises);
      console.log(`[定时检查] 所有收藏招募检查完成`);
      
    } catch (error) {
      console.error('[定时检查] 检查收藏招募状态失败:', error);
    } finally {
      // 无论成功与否，最后释放锁
      setIsChecking(false);
    }
  }, [setIsChecking, setFavorites, setFulfilledListings, setExpiredListings, setAudioElement]); // 只依赖设置函数，这些在组件生命周期内不会变化
  
  // 启动和停止定时检查 - 只在组件挂载和卸载时运行一次
  useEffect(() => {
    console.log('[定时器] 组件挂载，设置定时检查');
    
    // 初始检查
    checkFavoritesFulfillment();
    
    // 设置定时器，每分钟检查一次
    intervalRef.current = setInterval(() => {
      // 检查是否有活跃的收藏招募
      const currentFavorites = favoritesRef.current;
      const currentFulfilledListings = fulfilledListingsRef.current;
      const currentExpiredListings = expiredListingsRef.current;
      
      const hasActiveListings = currentFavorites.some(
        favorite => !currentFulfilledListings.has(favorite.id) && !currentExpiredListings.has(favorite.id)
      );
      
      if (!hasActiveListings) {
        console.log('[定时器] 没有活跃的收藏招募，跳过检查');
        return;
      }
      
      console.log('[定时器] 执行定时检查');
      checkFavoritesFulfillment();
    }, 60000);
    
    // 清理函数
    return () => {
      if (intervalRef.current) {
        console.log('[定时器] 组件卸载，清除定时器');
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // 空依赖数组，确保只在组件挂载和卸载时运行
  
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
  
  // 检查是否已过期
  const isExpired = (listingId) => {
    return expiredListings.has(listingId);
  };
  
  // 提供给上下文的值
  const value = {
    favorites,
    fulfilledListings,
    expiredListings,
    soundEnabled,
    addToFavorites,
    removeFromFavorites,
    clearFulfilledFavorites,
    clearExpiredFavorites,
    clearAllFavorites,
    toggleSound,
    isFavorite,
    isFulfilled,
    isExpired,
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