const Cart = require('../models/cart');
const Item = require('../models/item');
const { logger } = require('../utils/logger');

// 장바구니에 상품 추가
exports.addToCart = async (req, res) => {
  try {
    const memberId = req.session.user.id;
    const { itemId, count } = req.body;
    
    // 필수 필드 검증
    if (!itemId || !count) {
      return res.status(400).json({ message: '상품 ID와 수량은 필수 입력 항목입니다.' });
    }
    
    // 상품 존재 확인
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    
    // 재고 확인
    if (item.stockNumber < count) {
      return res.status(400).json({ message: '재고가 부족합니다.' });
    }
    
    // 장바구니에 추가
    const cartItemId = await Cart.addItem(memberId, itemId, count);
    
    res.status(200).json({
      message: '상품이 장바구니에 추가되었습니다.',
      cartItemId
    });
  } catch (error) {
    logger.error('장바구니 추가 오류:', error);
    res.status(500).json({ message: '장바구니에 상품을 추가하는 중 오류가 발생했습니다.' });
  }
};

// 장바구니 목록 조회
exports.getCartItems = async (req, res) => {
  try {
    const memberId = req.session.user.id;
    
    const cartItems = await Cart.findByMemberId(memberId);
    
    res.status(200).json(cartItems);
  } catch (error) {
    logger.error('장바구니 조회 오류:', error);
    res.status(500).json({ message: '장바구니를 불러오는 중 오류가 발생했습니다.' });
  }
};

// 장바구니 상품 수량 업데이트
exports.updateCartItemCount = async (req, res) => {
  try {
    const memberId = req.session.user.id;
    const cartItemId = req.params.id;
    const { count } = req.body;
    
    // 필수 필드 검증
    if (!count || count < 1) {
      return res.status(400).json({ message: '유효한 수량을 입력해주세요.' });
    }
    
    // 장바구니 아이템 존재 확인
    const cartItem = await Cart.findById(cartItemId);
    if (!cartItem) {
      return res.status(404).json({ message: '장바구니 항목을 찾을 수 없습니다.' });
    }
    
        // 권한 확인
    if (cartItem.memberId !== memberId) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    // 재고 확인
    const item = await Item.findById(cartItem.itemId);
    if (!item) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    
    if (item.stockNumber < count) {
      return res.status(400).json({ message: '재고가 부족합니다.' });
    }
    
    // 수량 업데이트
    const success = await Cart.updateItemCount(cartItemId, count, memberId);
    
    if (success) {
      res.status(200).json({ message: '장바구니 상품 수량이 업데이트되었습니다.' });
    } else {
      res.status(500).json({ message: '장바구니 상품 수량 업데이트에 실패했습니다.' });
    }
  } catch (error) {
    logger.error('장바구니 수량 업데이트 오류:', error);
    res.status(500).json({ message: '장바구니 상품 수량을 업데이트하는 중 오류가 발생했습니다.' });
  }
};

// 장바구니 상품 삭제
exports.removeCartItem = async (req, res) => {
  try {
    const memberId = req.session.user.id;
    const cartItemId = req.params.id;
    
    // 장바구니 아이템 존재 확인
    const cartItem = await Cart.findById(cartItemId);
    if (!cartItem) {
      return res.status(404).json({ message: '장바구니 항목을 찾을 수 없습니다.' });
    }
    
    // 권한 확인
    if (cartItem.memberId !== memberId) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    // 상품 삭제
    const success = await Cart.removeItem(cartItemId, memberId);
    
    if (success) {
      res.status(200).json({ message: '장바구니에서 상품이 삭제되었습니다.' });
    } else {
      res.status(500).json({ message: '장바구니에서 상품 삭제에 실패했습니다.' });
    }
  } catch (error) {
    logger.error('장바구니 상품 삭제 오류:', error);
    res.status(500).json({ message: '장바구니에서 상품을 삭제하는 중 오류가 발생했습니다.' });
  }
};

// 장바구니 비우기
exports.clearCart = async (req, res) => {
  try {
    const memberId = req.session.user.id;
    
    await Cart.clearCart(memberId);
    
    res.status(200).json({ message: '장바구니가 비워졌습니다.' });
  } catch (error) {
    logger.error('장바구니 비우기 오류:', error);
    res.status(500).json({ message: '장바구니를 비우는 중 오류가 발생했습니다.' });
  }
};

