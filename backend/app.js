const express = require('express');
const { sessionMiddleware } = require('./middleware/auth'); // 세션 미들웨어 임포트
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const { logger } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { testConnection } = require('./config/database');

// 기존 라우트 가져오기
const itemRoutes = require('./routes/itemRoutes');
const memberRoutes = require('./routes/memberRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();
const config = require('./config/config');
const PORT = config.app.port;
const fs = require('fs');
const uploadPath = path.join(__dirname, 'uploads');

// 미들웨어
// 1. 세션 미들웨어 최우선 적용
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware); // ★ 반드시 다른 미들웨어보다 먼저 위치해야 함

app.use(cors());
app.use(morgan('dev'));


// uploads 디렉토리 확인 및 생성
fs.access(uploadPath, fs.constants.R_OK, (err) => {
  if (err) {
    console.error('Upload directory is not readable:', err);
    // 디렉토리가 없으면 생성
    fs.mkdir(uploadPath, { recursive: true }, (mkdirErr) => {
      if (mkdirErr) {
        console.error('Failed to create upload directory:', mkdirErr);
      } else {
        console.log('Upload directory created successfully');
      }
    });
  } else {
    console.log('Upload directory is readable');
  }
});

app.use('/uploads', express.static(uploadPath));

// 라우트 설정
app.use('/api/items', itemRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// 기본 라우트
app.get('/api', (req, res) => {
    res.json({ message: 'NHN Cloud Shop API 서버에 오신 것을 환영합니다!' });
});

// 오류 처리 미들웨어
app.use(errorHandler);

// 데이터베이스 연결 테스트
testConnection()
  .then(connected => {
    if (connected) {
      // 서버 시작
      app.listen(PORT, () => {
        logger.info(`서버가 http://localhost:${PORT} 에서 실행 중입니다`);
        console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다`);
      });
    } else {
      logger.error('데이터베이스 연결 실패로 서버를 시작할 수 없습니다.');
      console.error('데이터베이스 연결 실패로 서버를 시작할 수 없습니다.');
    }
  })
  .catch(err => {
    logger.error('서버 시작 중 오류 발생:', err);
    console.error('서버 시작 중 오류 발생:', err);
  });

module.exports = app;
