const { pool } = require('../config/database');

class OrderItem {
  // 주문 아이템 생성
  static async create(orderItemData, connection = null) {
    const conn = connection || await pool.getConnection();
    
    try {
      if (!connection) await conn.beginTransaction();
      
      const query = `
        INSERT INTO order_items (
          order_id, item_id, item_nm, count, price
        ) VALUES (?, ?, ?, ?, ?)
      `;
      
      const [result] = await conn.query(query, [
        orderItemData.orderId,
        orderItemData.itemId,
        orderItemData.itemNm,
        orderItemData.count,
        orderItemData.price
      ]);
      
      if (!connection) await conn.commit();
      
      return result.insertId;
    } catch (error) {
      if (!connection) await conn.rollback();
      throw error;
    } finally {
      if (!connection) conn.release();
    }
  }
  
  // 주문 ID로 주문 아이템 조회
  static async findByOrderId(orderId) {
    const query = `
      SELECT 
        id as orderItemId,
        order_id as orderId,
        item_id as itemId,
        item_nm as itemNm,
        count,
        price
      FROM order_items
      WHERE order_id = ?
    `;
    
    try {
      const [rows] = await pool.query(query, [orderId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = OrderItem;
