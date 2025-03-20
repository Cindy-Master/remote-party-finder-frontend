// 副本数据处理工具函数

// 用于存储解析后的副本数据
let dutyCache = null;

/**
 * 加载并解析CSV文件中的副本数据
 * @returns {Promise<Array>} 解析后的副本数据数组
 */
export const loadDutyData = async () => {
  // 如果已经缓存了数据，直接返回
  if (dutyCache !== null) {
    return dutyCache;
  }

  try {
    // 修改为实际的CSV文件名
    const response = await fetch('/data/ContentFinderCondition.csv');
    const csvText = await response.text();
    
    // 按行分割
    const lines = csvText.split('\n');
    
    // 跳过前3行（标题和注释行）
    const dataLines = lines.slice(3);
    
    // 解析每行数据
    const duties = dataLines.map(line => {
      // 使用正则表达式处理CSV，考虑引号内可能包含逗号的情况
      const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
      
      // 确保行有足够的列 且 副本名不为空
      if (columns.length >= 45 && columns[44] && columns[44].trim() !== '' && columns[2] && columns[2].trim() !== '') {
        return {
          id: columns[0].trim(),  // 第3列是副本ID
          name: columns[44].trim() // 第45列是副本名称
        };
      }
      return null;
    }).filter(Boolean); // 过滤掉空行和无效数据
    
    // 按名称排序
    duties.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    
    // 去重（可能有重复ID的数据）
    const uniqueDuties = duties.filter((duty, index, self) => 
      self.findIndex(d => d.id === duty.id) === index
    );
    
    console.log(`成功加载了 ${uniqueDuties.length} 个副本数据`);
    
    // 缓存解析结果
    dutyCache = uniqueDuties;
    
    return uniqueDuties;
  } catch (error) {
    console.error('加载副本数据失败:', error);
    return [];
  }
};

/**
 * 搜索副本数据
 * @param {string} keyword 搜索关键词
 * @returns {Promise<Array>} 匹配的副本数据
 */
export const searchDuties = async (keyword) => {
  const duties = await loadDutyData();
  
  if (!keyword || keyword.trim() === '') {
    return duties;
  }
  
  const searchTerm = keyword.toLowerCase();
  
  return duties.filter(duty => 
    duty.name.toLowerCase().includes(searchTerm) || 
    duty.id.toLowerCase().includes(searchTerm)
  );
};

/**
 * 获取副本ID对应的名称
 * @param {string} id 副本ID
 * @returns {Promise<string>} 副本名称，如果找不到则返回ID
 */
export const getDutyNameById = async (id) => {
  const duties = await loadDutyData();
  const duty = duties.find(d => d.id === id);
  return duty ? duty.name : id;
};

/**
 * 将副本ID数组转换为副本名称数组
 * @param {Array<string>} ids 副本ID数组
 * @returns {Promise<Array<string>>} 副本名称数组
 */
export const getDutyNamesByIds = async (ids) => {
  const duties = await loadDutyData();
  return ids.map(id => {
    const duty = duties.find(d => d.id === id);
    return duty ? duty.name : id;
  });
}; 