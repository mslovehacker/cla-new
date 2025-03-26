const { logger } = require('../utils/logger');

// 오류 처리 미들웨어
const errorHandler = (err, req, res, next) => {
  logger.error('오류 발생:', err);
  
  // 기본 오류 메시지
  let statusCode = 500;
  let message = '서버 오류가 발생했습니다.';
  
  // 특정 오류 유형에 따른 처리
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = '인증이 필요합니다.';
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403;
    message = '권한이 없습니다.';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    message = '요청한 리소스를 찾을 수 없습니다.';
  }
  
  // 개발 환경에서는 상세 오류 정보 제공
  const error = process.env.NODE_ENV === 'development' ? {
    message,
    stack: err.stack,
    details: err.message
  } : {
    message
  };
  
  res.status(statusCode).json(error);
};

module.exports = errorHandler;
