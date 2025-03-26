const Member = require('../models/member');
const Item = require('../models/item');
const Order = require('../models/order');
const { pool } = require('../config/database');
const { logger } = require('../utils/logger');

// 대시보드 요약 정보
exports.getDashboard = async (req, res) => {
  console.logout(req);
  console.logout(res);
  try {
    // 각 테이블의 레코드 수를 직접 쿼리로 가져오기
    const [memberResult] = await pool.query('SELECT COUNT(*) as count FROM members');
    const [itemResult] = await pool.query('SELECT COUNT(*) as count FROM items');
    const [orderResult] = await pool.query('SELECT COUNT(*) as count FROM orders');
    
    res.status(200).json({
      totalMembers: memberResult[0].count,
      totalItems: itemResult[0].count,
      totalOrders: orderResult[0].count
    });
  } catch (error) {
    logger.error('대시보드 정보 조회 오류:', error);
    res.status(500).json({ message: '대시보드 정보를 불러오는 중 오류가 발생했습니다.' });
  }
};

// 회원 목록 조회
exports.getMembers = async (req, res) => {
  try {
    // 직접 쿼리로 회원 목록 가져오기 (비밀번호 제외)
    const [members] = await pool.query(`
      SELECT id, name, email, address, role, created_at as createdAt
      FROM members
    `);
    
    res.status(200).json(members);
  } catch (error) {
    logger.error('회원 목록 조회 오류:', error);
    res.status(500).json({ message: '회원 목록을 불러오는 중 오류가 발생했습니다.' });
  }
};

// 회원 정보 수정 (이름 및 역할)
exports.updateMemberInfo = async (req, res) => {
  try {
    const memberId = req.params.id;
    const { name, role } = req.body;
    
    // 역할 유효성 검사
    if (!role || (role !== 'BUYER' && role !== 'SELLER' && role !== 'ADMIN')) {
      return res.status(400).json({ message: '유효한 역할을 지정해주세요.' });
    }

    // 이름 유효성 검사
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: '유효한 이름을 입력해주세요.' });
    }

    // 이름과 역할 함께 업데이트
    const [result] = await pool.query(
      'UPDATE members SET name = ?, role = ? WHERE id = ?',
      [name, role, memberId]
    );
    
    if (result.affectedRows > 0) {
      res.status(200).json({ message: '회원 정보가 성공적으로 수정되었습니다.' });
    } else {
      res.status(404).json({ message: '회원을 찾을 수 없습니다.' });
    }
  } catch (error) {
    logger.error('회원 정보 수정 오류:', error);
    res.status(500).json({ message: '회원 정보를 수정하는 중 오류가 발생했습니다.' });
  }
};


// 회원 삭제
exports.deleteMember = async (req, res) => {
  try {
    const memberId = req.params.id;
    
    const [result] = await pool.query(
      'DELETE FROM members WHERE id = ?',
      [memberId]
    );
    
    if (result.affectedRows > 0) {
      res.status(200).json({ message: '회원이 성공적으로 삭제되었습니다.' });
    } else {
      res.status(404).json({ message: '회원을 찾을 수 없습니다.' });
    }
  } catch (error) {
    logger.error('회원 삭제 오류:', error);
    res.status(500).json({ message: '회원을 삭제하는 중 오류가 발생했습니다.' });
  }
};

// 상품 목록 조회
exports.getItems = async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT id, item_nm as itemNm, price, item_detail as itemDetail, 
             img_url as imgUrl, stock_number as stockNumber, created_at as createdAt
      FROM items
    `);
    
    res.status(200).json(items);
  } catch (error) {
    logger.error('상품 목록 조회 오류:', error);
    res.status(500).json({ message: '상품 목록을 불러오는 중 오류가 발생했습니다.' });
  }
};

// 주문 목록 조회
exports.getOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT id as orderId, member_id as memberId, order_status as orderStatus, 
             total_price as totalPrice, created_at as orderDate
      FROM orders
    `);
    
    // 각 주문의 주문 아이템 조회
    for (let order of orders) {
      const [orderItems] = await pool.query(`
        SELECT id as orderItemId, item_id as itemId, item_nm as itemNm, 
               count, price
        FROM order_items
        WHERE order_id = ?
      `, [order.orderId]);
      
      order.orderItems = orderItems;
    }
    
    res.status(200).json(orders);
  } catch (error) {
    logger.error('주문 목록 조회 오류:', error);
    res.status(500).json({ message: '주문 목록을 불러오는 중 오류가 발생했습니다.' });
  }
};

// 주문 상태 변경
exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    if (!status || !['ORDER', 'CANCEL', 'SHIPPING', 'COMPLETE'].includes(status)) {
      return res.status(400).json({ message: '유효한 주문 상태를 지정해주세요.' });
    }
    
    const [result] = await pool.query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [status, orderId]
    );
    
    if (result.affectedRows > 0) {
      res.status(200).json({ message: '주문 상태가 성공적으로 변경되었습니다.' });
    } else {
      res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
  } catch (error) {
    logger.error('주문 상태 변경 오류:', error);
    res.status(500).json({ message: '주문 상태를 변경하는 중 오류가 발생했습니다.' });
  }
};

// 주문 상세 조회
exports.getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    
    const [order] = await pool.query(`
      SELECT id as orderId, member_id as memberId, order_status as orderStatus, 
             total_price as totalPrice, created_at as orderDate
      FROM orders
      WHERE id = ?
    `, [orderId]);
    
    if (order.length === 0) {
      return res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
    }
    
    // 주문 아이템 조회
    const [orderItems] = await pool.query(`
      SELECT id as orderItemId, item_id as itemId, item_nm as itemNm, 
             count, price
      FROM order_items
      WHERE order_id = ?
    `, [orderId]);
    
    order[0].orderItems = orderItems;
    
    res.status(200).json(order[0]);
  } catch (error) {
    logger.error('주문 상세 조회 오류:', error);
    res.status(500).json({ message: '주문 상세 정보를 불러오는 중 오류가 발생했습니다.' });
  }
};

