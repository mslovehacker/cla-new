const { pool } = require('../config/database');

class Order {
  // 주문 생성
  static async create(orderData, connection = null) {
    const conn = connection || await pool.getConnection();
    
    try {
      if (!connection) await conn.beginTransaction();
      
      // 주문 생성
      const orderQuery = `
        INSERT INTO orders (
          member_id, order_status, total_price
        ) VALUES (?, ?, ?)
      `;
      
      const [orderResult] = await conn.query(orderQuery, [
        orderData.memberId,
        'ORDER', // 기본 상태는 'ORDER'
        orderData.totalPrice
      ]);
      
      const orderId = orderResult.insertId;
      
      // 주문 아이템 생성
      const orderItemQuery = `
        INSERT INTO order_items (
          order_id, item_id, item_nm, count, price
        ) VALUES (?, ?, ?, ?, ?)
      `;
      
      for (const item of orderData.orderItems) {
        await conn.query(orderItemQuery, [
          orderId,
          item.itemId,
          item.itemNm,
          item.count,
          item.price
        ]);
      }
      
      if (!connection) await conn.commit();
      
      return orderId;
    } catch (error) {
      if (!connection) await conn.rollback();
      throw error;
    } finally {
      if (!connection) conn.release();
    }
  }
  
  // 회원의 주문 목록 조회
  static async findByMemberId(memberId) {
    const query = `
      SELECT 
        o.id as orderId,
        o.order_status as orderStatus,
        o.total_price as totalPrice,
        o.created_at as orderDate
      FROM orders o
      WHERE o.member_id = ?
      ORDER BY o.created_at DESC
    `;
    
    try {
      const [orders] = await pool.query(query, [memberId]);
      
      // 각 주문의 주문 아이템 조회
      for (let order of orders) {
        const orderItemsQuery = `
          SELECT 
            oi.id as orderItemId,
            oi.item_id as itemId,
            oi.item_nm as itemNm,
            oi.count,
            oi.price
          FROM order_items oi
          WHERE oi.order_id = ?
        `;
        
        const [orderItems] = await pool.query(orderItemsQuery, [order.orderId]);
        order.orderItems = orderItems;
      }
      
      return orders;
    } catch (error) {
      throw error;
    }
  }
  
  // 주문 상세 조회
  static async findById(orderId, memberId = null) {
    let query = `
      SELECT 
        o.id as orderId,
        o.member_id as memberId,
        o.order_status as orderStatus,
        o.total_price as totalPrice,
        o.created_at as orderDate
      FROM orders o
      WHERE o.id = ?
    `;
    
    const params = [orderId];
    
    if (memberId) {
      query += ` AND o.member_id = ?`;
      params.push(memberId);
    }
    
    try {
      const [orders] = await pool.query(query, params);
      
      if (orders.length === 0) {
        return null;
      }
      
      const order = orders[0];
      
            // 주문 아이템 조회
      const orderItemsQuery = `
        SELECT 
          oi.id as orderItemId,
          oi.item_id as itemId,
          oi.item_nm as itemNm,
          oi.count,
          oi.price
        FROM order_items oi
        WHERE oi.order_id = ?
      `;
      
      const [orderItems] = await pool.query(orderItemsQuery, [order.orderId]);
      order.orderItems = orderItems;
      
      return order;
    } catch (error) {
      throw error;
    }
  }
  
  // 주문 상태 업데이트
  static async updateStatus(orderId, status, memberId = null) {
    let query = `
      UPDATE orders
      SET order_status = ?
      WHERE id = ?
    `;
    
    const params = [status, orderId];
    
    if (memberId) {
      query += ` AND member_id = ?`;
      params.push(memberId);
    }
    
    try {
      const [result] = await pool.query(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // 주문 취소
  static async cancel(orderId, memberId) {
    return this.updateStatus(orderId, 'CANCEL', memberId);
  }
}

module.exports = Order;

