/**
 * FF14特殊字符处理工具
 * 支持形如 '\uE044' 的Unicode字符搜索和转换
 */

// FF14私有Unicode区间
const FFXIV_UNICODE_RANGE = {
  start: 0xE020,
  end: 0xE0DB
};

/**
 * 检查是否为FF14私有Unicode字符
 * @param {number} codePoint - Unicode码点
 * @returns {boolean}
 */
export const isFFXIVUnicodeChar = (codePoint) => {
  return codePoint >= FFXIV_UNICODE_RANGE.start && codePoint <= FFXIV_UNICODE_RANGE.end;
};

/**
 * 将Unicode转义序列转换为实际字符
 * 支持格式：\uE044, \u{E044}, U+E044, 0xE044
 * @param {string} unicodeStr - Unicode字符串
 * @returns {string} 转换后的字符
 */
export const convertUnicodeToChar = (unicodeStr) => {
  if (!unicodeStr) return '';
  
  // 匹配不同格式的Unicode表示
  const patterns = [
    /\\u([0-9A-Fa-f]{4})/g,           // \uE044
    /\\u\{([0-9A-Fa-f]+)\}/g,        // \u{E044}
    /U\+([0-9A-Fa-f]+)/gi,           // U+E044
    /0x([0-9A-Fa-f]+)/gi,            // 0xE044
    /&#x([0-9A-Fa-f]+);/gi,          // &#xE044;
    /&#(\d+);/g                       // &#57412;
  ];
  
  let result = unicodeStr;
  
  patterns.forEach(pattern => {
    result = result.replace(pattern, (match, code) => {
      try {
        let codePoint;
        
        // 处理十进制格式
        if (pattern.toString().includes('(\\d+)')) {
          codePoint = parseInt(code, 10);
        } else {
          codePoint = parseInt(code, 16);
        }
        
        // 检查是否在FF14范围内
        if (isFFXIVUnicodeChar(codePoint)) {
          return String.fromCodePoint(codePoint);
        }
        
        return match; // 如果不在范围内，保持原样
      } catch (error) {
        console.warn('Unicode转换失败:', match, error);
        return match;
      }
    });
  });
  
  return result;
};

/**
 * 将字符转换为Unicode转义序列
 * @param {string} char - 字符
 * @returns {string} Unicode转义序列
 */
export const charToUnicodeEscape = (char) => {
  if (!char) return '';
  
  const codePoint = char.codePointAt(0);
  
  if (isFFXIVUnicodeChar(codePoint)) {
    return `\\u${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
  }
  
  return char;
};

/**
 * 扩展搜索查询，支持Unicode字符搜索
 * @param {string} query - 搜索查询
 * @returns {string} 扩展后的搜索查询
 */
export const expandSearchQuery = (query) => {
  if (!query) return '';
  
  // 转换Unicode转义序列为实际字符
  const convertedQuery = convertUnicodeToChar(query);
  
  // 如果转换后的查询与原查询不同，说明包含Unicode字符
  if (convertedQuery !== query) {
    // 同时搜索原始格式和转换后的格式
    return `${query} ${convertedQuery}`;
  }
  
  return query;
};

/**
 * 检查文本是否包含FF14特殊字符
 * @param {string} text - 要检查的文本
 * @returns {boolean}
 */
export const containsFFXIVChars = (text) => {
  if (!text) return false;
  
  for (let i = 0; i < text.length; i++) {
    const codePoint = text.codePointAt(i);
    if (isFFXIVUnicodeChar(codePoint)) {
      return true;
    }
  }
  
  return false;
};

/**
 * 高亮显示FF14特殊字符
 * @param {string} text - 文本
 * @returns {string} 带有高亮标记的HTML字符串
 */
export const highlightFFXIVChars = (text) => {
  if (!text) return '';
  
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const codePoint = char.codePointAt(0);
    
    if (isFFXIVUnicodeChar(codePoint)) {
      result += `<span class="ffxiv-char" title="FF14特殊字符: ${charToUnicodeEscape(char)}">${char}</span>`;
    } else {
      result += char;
    }
  }
  
  return result;
};

/**
 * 模糊匹配FF14字符
 * 同时匹配Unicode转义和实际字符
 * @param {string} searchTerm - 搜索词
 * @param {string} targetText - 目标文本
 * @returns {boolean}
 */
export const fuzzyMatchFFXIVChars = (searchTerm, targetText) => {
  if (!searchTerm || !targetText) return false;
  
  const normalizedSearch = searchTerm.toLowerCase();
  const normalizedTarget = targetText.toLowerCase();
  
  // 直接匹配
  if (normalizedTarget.includes(normalizedSearch)) {
    return true;
  }
  
  // 转换Unicode后匹配
  const convertedSearch = convertUnicodeToChar(searchTerm).toLowerCase();
  if (convertedSearch !== normalizedSearch && normalizedTarget.includes(convertedSearch)) {
    return true;
  }
  
  // 将目标文本中的FF14字符转换为Unicode转义后匹配
  let unicodeEscapedTarget = '';
  for (let i = 0; i < targetText.length; i++) {
    const char = targetText[i];
    const codePoint = char.codePointAt(0);
    
    if (isFFXIVUnicodeChar(codePoint)) {
      unicodeEscapedTarget += charToUnicodeEscape(char).toLowerCase();
    } else {
      unicodeEscapedTarget += char.toLowerCase();
    }
  }
  
  return unicodeEscapedTarget.includes(normalizedSearch);
};

// 常用的FF14特殊字符映射（示例）
export const COMMON_FFXIV_CHARS = {
  '\uE044': '坦克职业图标',
  '\uE045': '治疗职业图标', 
  '\uE046': '物理DPS图标',
  '\uE047': '魔法DPS图标',
  '\uE048': '生产职业图标',
  '\uE049': '采集职业图标',
  // 可以根据需要添加更多映射
};

/**
 * 获取FF14字符的描述
 * @param {string} char - FF14字符
 * @returns {string} 字符描述
 */
export const getFFXIVCharDescription = (char) => {
  return COMMON_FFXIV_CHARS[char] || `FF14特殊字符 (${charToUnicodeEscape(char)})`;
};