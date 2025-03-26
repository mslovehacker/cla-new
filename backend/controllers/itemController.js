const Item = require('../models/item');
const { pool } = require('../config/database');
const { logger } = require('../utils/logger');

// 상품 목록 조회
exports.getItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 12;
    const sort = req.query.sort || 'newest';
    const search = req.query.search || '';
    
    const items = await Item.findAll(page, size, sort, search);
    
    res.status(200).json(items);
  } catch (error) {
    logger.error('상품 목록 조회 오류:', error);
    res.status(500).json({ message: '상품 목록을 불러오는 중 오류가 발생했습니다.' });
  }
};

// 인기 상품 조회
exports.getFeaturedItems = async (req, res) => {
  try {
    const items = await Item.findFeatured();
    
    res.status(200).json(items);
  } catch (error) {
    logger.error('인기 상품 조회 오류:', error);
    res.status(500).json({ message: '인기 상품을 불러오는 중 오류가 발생했습니다.' });
  }
};

// 상품 상세 조회
exports.getItemById = async (req, res) => {
  try {
    const itemId = req.params.id;
    
    const item = await Item.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    
    res.status(200).json(item);
  } catch (error) {
    logger.error('상품 상세 조회 오류:', error);
    res.status(500).json({ message: '상품 정보를 불러오는 중 오류가 발생했습니다.' });
  }
};

// 상품 등록 API
exports.createItem = async (req, res) => {  
  try {
    console.log('상품 등록 요청 데이터:', req.body);
    
    const { itemNm, price, stockNumber, itemDetail } = req.body;
    
    // 필수 필드 검증
    if (!itemNm || !price || !stockNumber || !itemDetail) {
      return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
    }
    
    // 이미지 정보 설정
    let imgUrl = null;
    let originalFileName = null;
    let hashedFileName = null;
    
    if (req.file) {
       // 파일명 UTF-8로 변환
      originalFileName = req.originalFileName; // 이미 변환된 값 사용
      hashedFileName = req.hashedFileName;
      imgUrl = `/uploads/${hashedFileName}`;    
      console.log('파일 정보:', { imgUrl, originalFileName, hashedFileName });
    } else {
        console.log("req.file null");
    }
    
    // 상품 데이터 생성
    const itemData = {
      itemNm,
      price: parseInt(price),
      stockNumber: parseInt(stockNumber),
      itemDetail,
      imgUrl,
      originalFileName,
      hashedFileName
    };
    
    // Item 모델을 사용하여 상품 생성
    const itemId = await Item.create(itemData);
    
    res.status(201).json({
      message: '상품이 성공적으로 등록되었습니다.',
      itemId: itemId
    });
  } catch (error) {
    console.error('상품 등록 오류:', error);
    res.status(500).json({ message: '상품 등록 중 오류가 발생했습니다.' });
  }
};



// 상품 수정 API
exports.updateItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const { itemNm, price, stockNumber, itemDetail, imgUrl, originalFileName, hashedFileName } = req.body;
        
        // 필수 필드 검증
        if (!itemNm || !price || !stockNumber || !itemDetail) {
            return res.status(400).json({ message: '필수 항목이 누락되었습니다.' });
        }
        
        // 상품 데이터 생성
        const itemData = {
            itemNm,
            price: parseInt(price),
            stockNumber: parseInt(stockNumber),
            itemDetail,
            imgUrl
        };
        
        // 파일 업로드된 경우 (req.file이 존재하는 경우)
        if (req.file) {
            itemData.imgUrl = `/uploads/${req.file.filename}`;
            itemData.originalFileName = req.originalFileName || req.file.originalname;
            itemData.hashedFileName = req.hashedFileName || req.file.filename;
            console.log('파일 정보:', { 
                imgUrl: itemData.imgUrl, 
                originalFileName: itemData.originalFileName, 
                hashedFileName: itemData.hashedFileName 
            });
        } 
        // 파일 업로드 없이 기존 이미지 정보가 전달된 경우
        else if (originalFileName && hashedFileName) {
            itemData.originalFileName = originalFileName;
            itemData.hashedFileName = hashedFileName;
            console.log('기존 파일 정보 사용:', {
                imgUrl: itemData.imgUrl,
                originalFileName: itemData.originalFileName,
                hashedFileName: itemData.hashedFileName
            });
        } else {
            console.log("파일 정보 없음");
        }
        
        const success = await Item.update(itemId, itemData);
        
        if (!success) {
            return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
        }
        
        res.status(200).json({ message: '상품이 성공적으로 수정되었습니다.' });
    } catch (error) {
        logger.error('상품 수정 오류:', error);
        res.status(500).json({ message: '상품 수정 중 오류가 발생했습니다.' });
    }
};

    

// 상품 삭제 (관리자용)
exports.deleteItem = async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.session.user.role !== 'ADMIN') {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }
    
    const itemId = req.params.id;
    
    // 상품 존재 확인
    const existingItem = await Item.findById(itemId);
    if (!existingItem) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    
    const success = await Item.delete(itemId);
    
    if (success) {
      res.status(200).json({ message: '상품이 성공적으로 삭제되었습니다.' });
    } else {
      res.status(500).json({ message: '상품 삭제에 실패했습니다.' });
    }
  } catch (error) {
    logger.error('상품 삭제 오류:', error);
    res.status(500).json({ message: '상품 삭제 중 오류가 발생했습니다.' });
  }
};
