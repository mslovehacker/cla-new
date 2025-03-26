const { logger } = require('../utils/logger');

// 이미지 업로드 처리
exports.uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '이미지가 업로드되지 않았습니다.' });
    }
    
    // 이미지 URL 생성
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.status(200).json({ 
      message: '이미지가 성공적으로 업로드되었습니다.',
      imageUrl: imageUrl,
      originalFileName: req.originalFileName
    });
  } catch (error) {
    logger.error('이미지 업로드 오류:', error);
    res.status(500).json({ message: '이미지 업로드 중 오류가 발생했습니다.' });
  }
};
