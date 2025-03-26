require('dotenv').config();
console.log('SESSION_SECRET:', process.env.SESSION_SECRET);  // 추가해서 값 확인

const requiredEnvVars = ['JWT_SECRET', 'SESSION_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.warn(`[WARNING] 환경변수 ${key}가 설정되지 않았습니다. 기본값을 사용합니다.`);
  }
});

module.exports = {
  app: {
    port: parseInt(process.env.PORT, 10) || 8080,
    jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-env',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h'
  },
  session: {
    secret: process.env.SESSION_SECRET || 'change-this-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production' // 배포 환경에서는 HTTPS 사용
    }
  },
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'nhncloud',
    password: process.env.DB_PASSWORD || 'nHn1234~',
    database: process.env.DB_NAME || 'lab_db',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10
  }
};
