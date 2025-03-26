// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // 세션 체크 및 리다이렉트
    checkSessionAndRedirect();

    // 로그인 폼 제출 이벤트 리스너
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
});

// 세션 체크 및 리다이렉트 함수
async function checkSessionAndRedirect() {
    try {
        const response = await fetch('/api/members/session', { 
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.user) {
                window.location.href = '/main.html';
            }
        }
    } catch (error) {
        console.error('세션 확인 오류:', error);
    }
}

// 로그인 처리 함수
async function handleLogin(e) {
    e.preventDefault();    
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');
    
    try {
        loginError.style.display = 'none';

        const response = await login(email, password);

        console.log("로그인 성공:", response);  // ✅ 응답 확인

        if (response && response.member) {
            console.log("✅ 리다이렉트 시작!");
            window.location.href = "/main.html"; // 👉 페이지 이동
        } else {
            console.error("❌ 로그인은 성공했지만 user 데이터가 없음");
        }
    } catch (error) {
        loginError.textContent = "이메일 또는 비밀번호가 올바르지 않습니다.";
        loginError.style.display = "block";
        console.error("로그인 오류:", error);
    }
}

// 로그인 함수
async function login(email, password) {
    const response = await fetch('/api/members/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',  // 👉 세션 유지
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || '로그인 실패');
    }

    return result;
}
