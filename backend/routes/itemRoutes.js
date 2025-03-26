const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const upload = require('../middleware/upload.middleware');
const { authenticate } = require('../middleware/auth');

// 권한 검사 미들웨어 (판매자/관리자 전용)
const checkSellerOrAdmin = (req, res, next) => {
    if (req.session.user.role !== 'SELLER' && req.session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    next();
};

// 공개 라우트 (인증 불필요)
// 상품 목록 조회
router.get('/', itemController.getItems);

// 인기 상품 조회
router.get('/featured', itemController.getFeaturedItems);

// 상품 상세 조회
router.get('/:id', itemController.getItemById);

// 인증 및 권한 필요 라우트
// 상품 등록 API (판매자/관리자 전용)
router.post('/', authenticate, checkSellerOrAdmin, upload.single('image'), itemController.createItem);

// 상품 수정 API (판매자/관리자 전용)
router.put('/:id', authenticate, checkSellerOrAdmin, upload.single('image'), itemController.updateItem);

// 상품 삭제 API (판매자/관리자 전용)
router.delete('/:id', authenticate, checkSellerOrAdmin, itemController.deleteItem);

module.exports = router;
