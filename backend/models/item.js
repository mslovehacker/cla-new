const { pool } = require('../config/database');

class Item {
  // 모든 상품 조회
  static async findAll(page = 0, size = 10, sort = 'newest', search = '') {
    const offset = page * size;
    
    let orderBy = 'i.id DESC'; // 기본 정렬: 최신순
    if (sort === 'priceAsc') {
      orderBy = 'i.price ASC';
    } else if (sort === 'priceDesc') {
      orderBy = 'i.price DESC';
    }
    
    let query = `
      SELECT 
        i.id, i.item_nm as itemNm, i.price, i.item_detail as itemDetail, 
        i.img_url as imgUrl, i.stock_number as stockNumber, i.created_at as createdAt
      FROM items i
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM items i
    `;
    
    let params = [];
    
    if (search) {
      query += ` WHERE i.item_nm LIKE ? `;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    params.push(size, offset);
    
    try {
      const [rows] = await pool.query(query, params);
      const [countResult] = await pool.query(search ? 
        `${countQuery} WHERE i.item_nm LIKE ?` : countQuery, 
        search ? [`%${search}%`] : []);
      
      const total = countResult[0].total;
      
      return {
        content: rows,
        page,
        size,
        totalElements: total,
        totalPages: Math.ceil(total / size)
      };
    } catch (error) {
      throw error;
    }
  }
  
  // 인기 상품 조회 (임시로 최신 8개 상품 반환)
  static async findFeatured() {
    const query = `
      SELECT 
        i.id, i.item_nm as itemNm, i.price, i.item_detail as itemDetail, 
        i.img_url as imgUrl, i.stock_number as stockNumber, i.created_at as createdAt
      FROM items i
      ORDER BY i.id DESC
      LIMIT 8
    `;
    
    try {
      const [rows] = await pool.query(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
  
  // 상품 상세 조회
  static async findById(id) {
    const query = `
      SELECT 
        i.id, i.item_nm as itemNm, i.price, i.item_detail as itemDetail, 
        i.img_url as imgUrl, i.stock_number as stockNumber, i.created_at as createdAt
      FROM items i
      WHERE i.id = ?
    `;
    
    try {
      const [rows] = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  // 상품 생성
  static async create(itemData) {
      const query = `
      INSERT INTO items (item_nm, price, item_detail, img_url, stock_number, original_file_name, hashed_file_name) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      const params = [
          itemData.itemNm,
          itemData.price,
          itemData.itemDetail,
          itemData.imgUrl,
          itemData.stockNumber,
          itemData.originalFileName,
          itemData.hashedFileName
      ];
      try {
          const [result] = await pool.query(query, params);
          return result.insertId;
      } catch (error) {
          throw error;
      }
  }
  
  // 상품 수정
    static async update(id, itemData) {
        const { itemNm, price, stockNumber, itemDetail, imgUrl, originalFileName, hashedFileName } = itemData;
        console.log("update value:" + itemData);
        // 이미지 관련 필드가 있는 경우 함께 업데이트
        let query = 'UPDATE items SET item_nm = ?, price = ?, stock_number = ?, item_detail = ?';
        let params = [itemNm, price, stockNumber, itemDetail];
        // imgUrl이 있으면 이미지 관련 필드 업데이트
        if (imgUrl) {
            query += ', img_url = ?';
            params.push(imgUrl);
            
            // 파일명 정보가 있으면 함께 업데이트
            if (originalFileName) {
                query += ', original_file_name = ?';
                params.push(originalFileName);
            }
            if (hashedFileName) {
                query += ', hashed_file_name = ?';
                params.push(hashedFileName);
            }
        }
        query += ' WHERE id = ?';
        params.push(id);
        
        const [result] = await pool.query(query, params);
        return result.affectedRows > 0;
    }

  
  // 상품 삭제
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
  
  // 재고 확인
  static async checkStock(id, quantity) {
    const query = `
      SELECT stock_number as stockNumber
      FROM items
      WHERE id = ?
    `;
    
    try {
      const [rows] = await pool.query(query, [id]);
      if (rows.length === 0) {
        return false;
      }
      
      return rows[0].stockNumber >= quantity;
    } catch (error) {
      throw error;
    }
  }
  
  // 재고 감소
  static async decreaseStock(id, quantity) {
    const query = `
      UPDATE items
      SET stock_number = stock_number - ?
      WHERE id = ? AND stock_number >= ?
    `;
    
    try {
      const [result] = await pool.query(query, [quantity, id, quantity]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Item;
