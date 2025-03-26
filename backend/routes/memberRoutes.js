const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { authenticate } = require('../middleware/auth');

// 세션 상태 확인
router.get('/session', authenticate, (req, res) => {
  res.status(200).json({ 
    success: true,
    user: req.session.user,
    role: req.session.role  
  });
});

// 회원가입
router.post('/register', memberController.register);

// 로그인
router.post('/login', memberController.login);

// 회원 정보 조회
router.get('/info', authenticate, memberController.getMemberInfo);

// 회원 정보 수정
router.put('/info', authenticate, memberController.updateMemberInfo);

// 로그아웃
router.post('/logout', memberController.logout);

module.exports = router;
