const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// 파일명 정규화 함수
const normalizeFileName = (fileName) => {
  // 1. Latin1 → UTF-8 디코딩
  const decoded = Buffer.from(fileName, 'latin1').toString('utf8');
  
  // 2. 유니코드 정규화 (NFC 형식)
  const normalized = decoded.normalize('NFC');
  
  // 3. 파일 시스템 안전 문자로 치환
  return normalized
    .replace(/[/\\?%*:|"<>]/g, '_')  // 파일 시스템 예약 문자 제거
    .replace(/\s+/g, '_')            // 공백 → 언더스코어
    .replace(/_+/g, '_')             // 연속 언더스코어 단일화
    .replace(/^\.+/, '')             // 선행 점 문자 제거
    .substring(0, 255);              // 파일명 길이 제한
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // 원본 파일명 처리
    const originalName = normalizeFileName(file.originalname);
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);

    // 고유 파일명 생성
    const fileHash = crypto.randomBytes(16).toString('hex');
    const finalName = `${baseName}_${fileHash}${ext}`;

    // 요청 객체에 정보 저장
    req.originalFileName = originalName;
    req.hashedFileName = finalName;

    cb(null, finalName);
  }
});

// 확장자 필터 (안전한 파일 타입만 허용)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif',
    'application/pdf',
    'text/plain'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('허용되지 않는 파일 형식'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024,  // 20MB
    files: 5                      // 최대 5개 파일
  },
  fileFilter: fileFilter
});

module.exports = upload;
