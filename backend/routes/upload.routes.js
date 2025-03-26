const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const upload = require('../middleware/upload.middleware');
const { authenticate } = require('../middleware/auth');

// 이미지 업로드 API (인증 필요)
router.post('/image', authenticate, upload.single('image'), uploadController.uploadImage);

module.exports = router;
