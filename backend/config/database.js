const mysql = require('mysql2/promise');
const config = require('./config');

// MySQL 연결 풀 생성
const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 데이터베이스 연결 테스트
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('데이터베이스 연결 성공');
    connection.release();
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
