const Member = require('../models/member');
//const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { logger } = require('../utils/logger');

// 회원가입
exports.register = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    
    // 필수 필드 검증
    if (!name || !email || !password || !address) {
      return res.status(400).json({ message: '모든 필드를 입력해주세요.' });
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: '유효한 이메일 주소를 입력해주세요.' });
    }
    
    // 이메일 중복 확인
    const existingMember = await Member.findByEmail(email);
    if (existingMember) {
      return res.status(409).json({ message: '이미 사용 중인 이메일입니다.' });
    }
    
    // 역할 검증
    let validRole = role;
      
    if (!role || (role !== 'BUYER' && role !== 'SELLER' && role !== 'ADMIN')) {
      validRole = 'BUYER'; // 기본값은 구매자
    }
    
    // 회원 생성
    const memberId = await Member.create({
      name,
      email,
      password,
      address,
      role: validRole
    });
    
    res.status(201).json({ 
      message: '회원가입이 완료되었습니다.',
      memberId
    });
  } catch (error) {
    logger.error('회원가입 오류:', error);
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
  }
};


// 로그인 (세션 기반으로 변경)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 필수 필드 검증
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: '이메일과 비밀번호를 입력해주세요.' 
      });
    }
    
    // 회원 조회
    const member = await Member.findByEmail(email);
    if (!member) {
      return res.status(401).json({ 
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
      });
    }
    
    // 비밀번호 검증
    const isPasswordValid = await Member.verifyPassword(password, member.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.' 
      });
    }
    
    // 세션에 사용자 정보 저장
    req.session.regenerate((err) => {
      if (err) {
        logger.error('세션 재생성 오류:', err);
        return res.status(500).json({ 
          success: false,
          message: '로그인 처리 중 오류가 발생했습니다.' 
        });
      }

      req.session.user = {
        id: member.id,
        email: member.email,
        role: member.role
      };

      req.session.save((err) => {
        if (err) {
          logger.error('세션 저장 오류:', err);
          return res.status(500).json({ 
            success: false,
            message: '로그인 처리 중 오류가 발생했습니다.' 
          });
        }

        res.status(200).json({ 
          success: true,
          message: '로그인 성공',
          member: {
            id: member.id,
            name: member.name,
            email: member.email,
            role: member.role
          }
        });
      });
    });
  } catch (error) {
    logger.error('로그인 오류:', error);
    res.status(500).json({ 
      success: false,
      message: '로그인 중 오류가 발생했습니다.' 
    });
  }
};

// 회원 정보 조회 (세션 기반)
exports.getMemberInfo = async (req, res) => {
  try {
    const member = await Member.findById(req.session.user.id);
    if (!member) {
      return res.status(404).json({ 
        success: false,
        message: '회원 정보를 찾을 수 없습니다.' 
      });
    }
    
    res.status(200).json({
      success: true,
      id: member.id,
      name: member.name,
      email: member.email,
      address: member.address,
      role: member.role,
      createdAt: member.createdAt
    });
  } catch (error) {
    logger.error('회원 정보 조회 오류:', error);
    res.status(500).json({ 
      success: false,
      message: '회원 정보를 불러오는 중 오류가 발생했습니다.' 
    });
  }
};

// 회원 정보 수정 (세션 기반)
exports.updateMemberInfo = async (req, res) => {
  try {
    const { name, password, address } = req.body;
    
    // 회원 존재 확인
    const existingMember = await Member.findById(req.session.user.id);
    if (!existingMember) {
      return res.status(404).json({ 
        success: false,
        message: '회원 정보를 찾을 수 없습니다.' 
      });
    }
    
    // 필수 필드 검증
    if (!name || !address) {
      return res.status(400).json({ 
        success: false,
        message: '이름과 주소는 필수 입력 항목입니다.' 
      });
    }
    
    const memberData = {
      name,
      address,
      password: password || undefined
    };
    
    const success = await Member.update(req.session.user.id, memberData);
    
    if (success) {
      res.status(200).json({ 
        success: true,
        message: '회원 정보가 성공적으로 수정되었습니다.' 
      });
    } else {
      res.status(500).json({ 
        success: false,
        message: '회원 정보 수정에 실패했습니다.' 
      });
    }
  } catch (error) {
    logger.error('회원 정보 수정 오류:', error);
    res.status(500).json({ 
      success: false,
      message: '회원 정보 수정 중 오류가 발생했습니다.' 
    });
  }
};

// 로그아웃
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      logger.error('로그아웃 오류:', err);
      return res.status(500).json({ 
        success: false,
        message: '로그아웃 처리 중 오류가 발생했습니다.' 
      });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ 
      success: true,
      message: '로그아웃 성공' 
    });
  });
};
