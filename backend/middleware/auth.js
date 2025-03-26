const session = require('express-session');
const config = require('../config/config');
const { logger } = require('../utils/logger');
const Member = require('../models/member'); // 사용자 정보 조회를 위한 모델

// ✅ 세션 미들웨어 설정
exports.sessionMiddleware = session({
  secret: config.session.secret, // ✅ 환경 변수에서 가져오기
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax', // CSRF 보호
    httpOnly: true,  // XSS 방지
    secure: process.env.NODE_ENV === 'production', // HTTPS 환경에서만 쿠키 전송
    maxAge: 24 * 60 * 60 * 1000 // 1일
  }
});

// 인증 미들웨어
exports.authenticate = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ 
      success: false,
      message: '인증이 필요합니다.' 
    });
  }
  next();
};

// 관리자 권한 확인 미들웨어
exports.isAdmin = (req, res, next) => {
  if (req.session.user?.role !== 'ADMIN') {
    return res.status(403).json({ 
      success: false,
      message: '관리자 권한이 필요합니다.' 
    });
  }
  next();
};

// ✅ 로그인 처리
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 사용자가 입력한 이메일로 DB 조회
    const user = await Member.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 검증
    const isPasswordValid = await Member.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // ✅ 세션에 사용자 정보 저장
    req.session.user = {
      id: user.id,
      username: user.name,
      role: user.role
    };

    // ✅ 세션 저장 후 응답
    req.session.save((err) => {
      if (err) {
        logger.error('세션 저장 오류:', err);
        return res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
      }

      // ✅ 헤더가 이미 전송되지 않았다면 응답 보내기
      if (!res.headersSent) {
        return res.json({ message: '로그인 성공', user: req.session.user });
      }
    });
  } catch (error) {
    logger.error('로그인 오류:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
    }
  }
};

// ✅ 현재 로그인 상태 확인 API
exports.checkSession = (req, res) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  } else {
    return res.status(401).json({ loggedIn: false });
  }
};

// ✅ 로그아웃 처리
exports.logout = (req, res) => {
  if (!req.session.user) {
    return res.status(200).json({ message: '이미 로그아웃 상태입니다.' });
  }

  req.session.destroy((err) => {
    if (err) {
      logger.error('로그아웃 오류:', err);
      return res.status(500).json({ message: '로그아웃 처리 중 오류가 발생했습니다.' });
    }
    
    // ✅ 쿠키 삭제 (path, sameSite 고려)
    res.clearCookie('connect.sid', { path: '/' });

    res.status(200).json({ message: '로그아웃 성공' });
  });
};
