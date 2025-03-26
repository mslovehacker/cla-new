// 날짜 포맷 함수
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// 가격 포맷 함수
const formatPrice = (price) => {
  return price.toLocaleString('ko-KR');
};

// 페이지네이션 헬퍼 함수
const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  
  return { limit, offset };
};

// 페이지네이션 응답 데이터 생성 함수
const getPagingData = (data, page, limit, totalItems) => {
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    totalItems,
    items: data,
    totalPages,
    currentPage
  };
};

module.exports = {
  formatDate,
  formatPrice,
  getPagination,
  getPagingData
};
