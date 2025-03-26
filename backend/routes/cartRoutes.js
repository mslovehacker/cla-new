const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticate);

// 장바구니에 상품 추가
router.post('/add', cartController.addToCart);

// 장바구니 목록 조회
router.get('/', cartController.getCartItems);

// 장바구니 상품 수량 업데이트
router.patch('/update/:id', cartController.updateCartItemCount);

// 장바구니 상품 삭제
router.delete('/remove/:id', cartController.removeCartItem);

// 장바구니 비우기
router.delete('/clear', cartController.clearCart);

module.exports = router;
