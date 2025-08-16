import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { FiCopy, FiCheck, FiTestTube } from 'react-icons/fi';
import { 
  convertUnicodeToChar, 
  charToUnicodeEscape, 
  expandSearchQuery,
  containsFFXIVChars,
  highlightFFXIVChars,
  COMMON_FFXIV_CHARS
} from '../utils/unicodeUtils';

const TestContainer = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 2px solid var(--primary-color);
`;

const TestSection = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: ${props => props.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 8px;
`;

const TestInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: 'FFXIV', monospace;
  font-size: 16px;
  background: var(--card-bg);
  color: var(--text-color);
  margin-bottom: 12px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(94, 100, 209, 0.2);
  }
`;

const TestOutput = styled.div`
  background: var(--bg-color);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  font-family: 'FFXIV', monospace;
  font-size: 16px;
  min-height: 40px;
  word-break: break-all;
`;

const CopyButton = styled.button`
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background: var(--primary-dark);
  }
`;

const CharGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const CharCard = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: var(--primary-color);
  }
`;

const CharDisplay = styled.div`
  font-size: 24px;
  font-family: 'FFXIV', sans-serif;
  margin-bottom: 8px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CharCode = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  font-family: monospace;
`;

const FFXIVCharacterTest = () => {
  const [testInput, setTestInput] = useState('\\uE044');
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleCharCardClick = (char) => {
    setTestInput(charToUnicodeEscape(char));
  };

  // 测试字符转换
  const convertedChar = convertUnicodeToChar(testInput);
  const hasFFXIVChars = containsFFXIVChars(convertedChar);
  const expandedQuery = expandSearchQuery(testInput);
  const highlightedText = highlightFFXIVChars(convertedChar);

  return (
    <TestContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <FiTestTube />
        FF14特殊字符测试工具
      </h3>

      <TestSection>
        <h4>Unicode字符转换测试</h4>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          输入Unicode格式（如：\uE044, \u{E044}, U+E044, 0xE044）
        </p>
        <TestInput
          value={testInput}
          onChange={(e) => setTestInput(e.target.value)}
          placeholder="输入Unicode字符，如 \uE044"
        />
        
        <div style={{ marginBottom: '12px' }}>
          <strong>转换结果：</strong>
          <TestOutput>
            {convertedChar ? (
              <span dangerouslySetInnerHTML={{ __html: highlightedText }} />
            ) : (
              <span style={{ color: 'var(--text-secondary)' }}>无效的Unicode格式</span>
            )}
            <CopyButton onClick={() => copyToClipboard(convertedChar)}>
              {copied === convertedChar ? <FiCheck /> : <FiCopy />}
              复制
            </CopyButton>
          </TestOutput>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <strong>包含FF14字符：</strong>
          <span style={{ color: hasFFXIVChars ? 'var(--success-color)' : 'var(--error-color)' }}>
            {hasFFXIVChars ? '是' : '否'}
          </span>
        </div>

        <div>
          <strong>扩展搜索查询：</strong>
          <TestOutput>
            {expandedQuery}
            <CopyButton onClick={() => copyToClipboard(expandedQuery)}>
              {copied === expandedQuery ? <FiCheck /> : <FiCopy />}
              复制
            </CopyButton>
          </TestOutput>
        </div>
      </TestSection>

      <TestSection>
        <h4>常用FF14特殊字符</h4>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          点击字符卡片将Unicode代码复制到测试框
        </p>
        <CharGrid>
          {Object.entries(COMMON_FFXIV_CHARS).map(([char, description]) => (
            <CharCard key={char} onClick={() => handleCharCardClick(char)}>
              <CharDisplay>{char}</CharDisplay>
              <CharCode>{charToUnicodeEscape(char)}</CharCode>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {description}
              </div>
            </CharCard>
          ))}
        </CharGrid>
      </TestSection>

      <TestSection>
        <h4>搜索测试示例</h4>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>✅ 支持的搜索格式：</p>
          <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
            <li><code>\uE044</code> - 标准Unicode转义</li>
            <li><code>\u{E044}</code> - ES6 Unicode转义</li>
            <li><code>U+E044</code> - Unicode码点表示</li>
            <li><code>0xE044</code> - 十六进制表示</li>
            <li><code>&#xE044;</code> - HTML实体（十六进制）</li>
            <li><code>&#57412;</code> - HTML实体（十进制）</li>
            <li>直接输入FF14特殊字符</li>
          </ul>
        </div>
      </TestSection>
    </TestContainer>
  );
};

export default FFXIVCharacterTest;