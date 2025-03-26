// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // 사용자 인증 상태 확인
    checkSessionStatus();
    
    // 물품 등록 폼 제출 이벤트 리스너
    const itemRegisterForm = document.getElementById('itemRegisterForm');
    itemRegisterForm.addEventListener('submit', handleItemRegister);
});

// 물품 등록 처리 함수
async function handleItemRegister(e) {
    e.preventDefault();
    
    const itemNm = document.getElementById('itemNm').value;
    const price = document.getElementById('price').value;
    const stockNumber = document.getElementById('stockNumber').value;
    const itemDetail = document.getElementById('itemDetail').value;
    const imgFile = document.getElementById('imgFile').files[0];
    const itemRegisterError = document.getElementById('itemRegisterError');
    
    try {
        itemRegisterError.style.display = 'none';
        
        // FormData 객체 생성
        const formData = new FormData();
        formData.append('itemNm', itemNm);
        formData.append('price', price);
        formData.append('stockNumber', stockNumber);
        formData.append('itemDetail', itemDetail);
        
        // 이미지 파일이 있으면 추가
        if (imgFile) {
            formData.append('image', imgFile);
        }
        
        // API 호출
        const response = await fetchAPI('items', {
            method: 'POST',
            body: formData,
            headers: {} // FormData 사용 시 Content-Type 헤더 제거
        });
        
        alert('상품이 성공적으로 등록되었습니다.');
        
        // 상품 목록 페이지로 이동
        window.location.href = 'items.html';
    } catch (error) {
        itemRegisterError.textContent = '상품 등록 중 오류가 발생했습니다. 다시 시도해주세요.';
        itemRegisterError.style.display = 'block';
        console.error('상품 등록 오류:', error);
    }
}

// 상품 등록 API 함수
async function createItem(itemData) {
    return fetchAPI('items', {
        method: 'POST',
        body: JSON.stringify(itemData)
    });
}

// 이미지 업로드 함수
async function uploadImage(file) {
    // 파일 크기 검사 (5MB 제한)
    if (file.size > 50 * 1024 * 1024) {
        throw new Error('이미지 크기는 50MB를 초과할 수 없습니다.');
    }
    
    // FormData 객체 생성
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        // 이미지 업로드 API 호출
        const response = await fetchAPI('upload/image', {
            method: 'POST',
            body: formData,
            headers: {} // FormData를 사용할 때는 Content-Type 헤더를 설정하지 않음
        });
        
        // 응답에서 이미지 URL 추출
        return response.imageUrl;
    } catch (error) {
        console.error('이미지 업로드 오류:', error);
        throw new Error('이미지 업로드 중 오류가 발생했습니다.');
    }
}

// 사용자 인증 상태 확인 함수 (세션 기반)
async function checkSessionStatus() {
    const navbarNav = document.getElementById('navbarNav');
    
    try {
        // 세션 상태 확인 요청
        const response = await fetch('/api/members/session', { method: 'GET', credentials: 'include' });
        const result = await response.json();        

        if (response.status === 200 && result.user) {
            const userRole = result.user.role;

            const authLinks = navbarNav.querySelector('ul.navbar-nav:last-child');
            
            // 기본 메뉴 항목
            let menuHTML = `
                <li class="nav-item"><a class="nav-link" href="#" id="logoutLink">로그아웃</a></li>
                <li class="nav-item"><a class="nav-link" href="my-page.html">마이페이지</a></li>
                <li class="nav-item"><a class="nav-link" href="cart.html">장바구니</a></li>
            `;
            
            // 역할별 추가 메뉴
            if (userRole === 'SELLER' || userRole === 'ADMIN') {
                menuHTML += `<li class="nav-item"><a class="nav-link" href="item-register.html">물품 등록</a></li>`;
            }
            
            if (userRole === 'ADMIN') {
                menuHTML += `<li class="nav-item"><a class="nav-link" href="admin-dashboard.html">관리자 대시보드</a></li>`;
            }
            
            authLinks.innerHTML = menuHTML;
            
            // 로그아웃 이벤트 리스너 추가
            document.getElementById('logoutLink').addEventListener('click', async (e) => {
                e.preventDefault();
                await logout();
                window.location.href = '/';
            });
        } else {
            console.warn('사용자가 로그인하지 않았습니다.');
             alert('로그인이 필요합니다.');
             window.location.href = 'login.html';
             return;
        }
    } catch (error) {
        console.error('세션 확인 오류:', error);
    }
}

// 로그아웃 함수
async function logout() {
    try {
        await fetch('/api/members/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
        console.error('로그아웃 오류:', error);
    }
}

