const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

// 모든 관리자 라우트에 인증 및 관리자 권한 확인 미들웨어 적용
router.use(authenticate, isAdmin);

// 대시보드 요약 정보
router.get('/dashboard', adminController.getDashboard);

// 회원 관리
router.get('/members', adminController.getMembers);
router.patch('/members/:id/info', adminController.updateMemberInfo);
router.delete('/members/:id', adminController.deleteMember);

// 상품 관리
router.get('/items', adminController.getItems);

// 주문 관리
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// 주문 상세 조회
router.get('/orders/:id', adminController.getOrderById);


module.exports = router;
