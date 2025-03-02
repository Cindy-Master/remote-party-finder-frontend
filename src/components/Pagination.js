import React from 'react';
import '../styles/Pagination.css';

const Pagination = ({ pagination, onPageChange }) => {
  const { page, total_pages } = pagination;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= total_pages) {
      onPageChange(newPage);
    }
  };

  // 创建页码数组
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(total_pages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  if (total_pages <= 1) return null;

  return (
    <div className="pagination-container">
      <ul className="pagination">
        <li className={page === 1 ? 'disabled' : ''}>
          <button onClick={() => handlePageChange(1)} disabled={page === 1}>
            首页
          </button>
        </li>
        <li className={page === 1 ? 'disabled' : ''}>
          <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
            上一页
          </button>
        </li>

        {getPageNumbers().map(num => (
          <li key={num} className={page === num ? 'active' : ''}>
            <button onClick={() => handlePageChange(num)}>
              {num}
            </button>
          </li>
        ))}

        <li className={page === total_pages ? 'disabled' : ''}>
          <button onClick={() => handlePageChange(page + 1)} disabled={page === total_pages}>
            下一页
          </button>
        </li>
        <li className={page === total_pages ? 'disabled' : ''}>
          <button onClick={() => handlePageChange(total_pages)} disabled={page === total_pages}>
            末页
          </button>
        </li>
      </ul>
      <div className="pagination-info">
        第 {page} 页，共 {total_pages} 页
      </div>
    </div>
  );
};

export default Pagination; 