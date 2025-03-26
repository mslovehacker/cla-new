const { pool } = require('../config/database');

class Cart {
  // 장바구니에 상품 추가
  static async addItem(memberId, itemId, count) {
    // 먼저 이미 장바구니에 있는지 확인
    const checkQuery = `
      SELECT id, count
      FROM cart_items
      WHERE member_id = ? AND item_id = ?
    `;
    
    try {
      const [existingItems] = await pool.query(checkQuery, [memberId, itemId]);
      
      if (existingItems.length > 0) {
        // 이미 있으면 수량 업데이트
        const cartItemId = existingItems[0].id;
        const newCount = existingItems[0].count + count;
        
        const updateQuery = `
          UPDATE cart_items
          SET count = ?
          WHERE id = ?
        `;
        
        await pool.query(updateQuery, [newCount, cartItemId]);
        return cartItemId;
      } else {
        // 없으면 새로 추가
        const insertQuery = `
          INSERT INTO cart_items (member_id, item_id, count)
          VALUES (?, ?, ?)
        `;
        
        const [result] = await pool.query(insertQuery, [memberId, itemId, count]);
        return result.insertId;
      }
    } catch (error) {
      throw error;
    }
  }
  
  // 회원의 장바구니 조회
  static async findByMemberId(memberId) {
    const query = `
      SELECT 
        ci.id as cartItemId,
        i.id as itemId,
        i.item_nm as itemNm,
        i.price,
        i.img_url as imgUrl,
        ci.count
      FROM cart_items ci
      JOIN items i ON ci.item_id = i.id
      WHERE ci.member_id = ?
    `;
    
    try {
      const [rows] = await pool.query(query, [memberId]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // 장바구니 아이템 수량 업데이트
  static async updateItemCount(cartItemId, count, memberId) {
    const query = `
      UPDATE cart_items
      SET count = ?
      WHERE id = ? AND member_id = ?
    `;
    
    try {
      const [result] = await pool.query(query, [count, cartItemId, memberId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // 장바구니 아이템 삭제
  static async removeItem(cartItemId, memberId) {
    const query = `
      DELETE FROM cart_items
      WHERE id = ? AND member_id = ?
    `;
    
    try {
      const [result] = await pool.query(query, [cartItemId, memberId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // 장바구니 아이템 조회
  static async findById(cartItemId) {
    const query = `
      SELECT 
        ci.id as cartItemId,
        ci.member_id as memberId,
        ci.item_id as itemId,
        i.item_nm as itemNm,
        i.price,
        ci.count
      FROM cart_items ci
      JOIN items i ON ci.item_id = i.id
      WHERE ci.id = ?
    `;
    
    try {
      const [rows] = await pool.query(query, [cartItemId]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  // 장바구니 비우기
  static async clearCart(memberId) {
    const query = `
      DELETE FROM cart_items
      WHERE member_id = ?
    `;
    
    try {
      const [result] = await pool.query(query, [memberId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
  
  // 장바구니 아이템 여러 개 삭제
  static async removeItems(cartItemIds, memberId) {
    if (!cartItemIds.length) return true;
    
    const placeholders = cartItemIds.map(() => '?').join(',');
    const query = `
      DELETE FROM cart_items
      WHERE id IN (${placeholders}) AND member_id = ?
    `;
    
    try {
      const [result] = await pool.query(query, [...cartItemIds, memberId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Cart;
