const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class Member {
  // 회원 생성
  static async create(memberData) {
    const hashedPassword = await bcrypt.hash(memberData.password, 10);
    
    const query = `
      INSERT INTO members (
        name, email, password, address, role
      ) VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
      memberData.name,
      memberData.email,
      hashedPassword,
      memberData.address,
      memberData.role
    ];
    
    try {
      const [result] = await pool.query(query, params);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }
  
  // 이메일로 회원 조회
  static async findByEmail(email) {
    const query = `
      SELECT 
        id, name, email, password, address, role, created_at as createdAt
      FROM members
      WHERE email = ?
    `;
    
    try {
      const [rows] = await pool.query(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  // ID로 회원 조회
  static async findById(id) {
    const query = `
      SELECT 
        id, name, email, address, role, created_at as createdAt
      FROM members
      WHERE id = ?
    `;
    
    try {
      const [rows] = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
  
  // 비밀번호 검증
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // 회원 정보 수정
  static async update(id, memberData) {
    let query = `
      UPDATE members
      SET 
        name = ?,
        address = ?
    `;
    
    let params = [
      memberData.name,
      memberData.address
    ];
    
    // 비밀번호가 제공된 경우에만 업데이트
    if (memberData.password) {
      const hashedPassword = await bcrypt.hash(memberData.password, 10);
      query += `, password = ?`;
      params.push(hashedPassword);
    }
    
    query += ` WHERE id = ?`;
    params.push(id);
    
    try {
      const [result] = await pool.query(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Member;
