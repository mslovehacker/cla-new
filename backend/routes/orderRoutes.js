const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticate);

// 주문 생성
router.post('/', orderController.createOrder);

// 주문 목록 조회
router.get('/', orderController.getOrders);

// 주문 상세 조회
router.get('/:id', orderController.getOrderById);

// 주문 취소 라우트 추가
router.post('/:id/cancel', authenticate, orderController.cancelOrder);

module.exports = router;
