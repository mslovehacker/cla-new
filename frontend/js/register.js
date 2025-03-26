// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // 이미 로그인 상태인 경우 홈으로 리다이렉트
    if (localStorage.getItem('token')) {
        window.location.href = '/';
        return;
    }
    
    // 회원가입 폼 제출 이벤트 리스너
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', handleRegister);
});

// 회원가입 처리 함수
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const address = document.getElementById('address').value;
    const role = document.querySelector('input[name="role"]:checked').value;
    const registerError = document.getElementById('registerError');
    
    // 비밀번호 확인
    if (password !== confirmPassword) {
        registerError.textContent = '비밀번호가 일치하지 않습니다.';
        registerError.style.display = 'block';
        return;
    }
    
    try {
        registerError.style.display = 'none';
        
        const memberData = {
            name,
            email,
            password,
            address,
            role
        };
        
        await register(memberData);
        
        alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
        window.location.href = 'login.html';
    } catch (error) {
        registerError.textContent = '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
        registerError.style.display = 'block';
        console.error('회원가입 오류:', error);
    }
}
