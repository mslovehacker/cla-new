// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // 인기 상품 로드
    loadFeaturedItems();

    // 사용자 인증 상태 확인
    checkSessionStatus();
});

// 인기 상품 로드 함수
async function loadFeaturedItems() {
    const featuredItemsContainer = document.getElementById('featuredItems');
    
    try {
        const items = await getFeaturedItems();
        
        if (items.length === 0) {
            featuredItemsContainer.innerHTML = '<div class="col-12 text-center"><p>인기 상품이 없습니다.</p></div>';
            return;
        }
        
        let html = '';
        items.forEach(item => {
            html += `
                <div class="col-md-3 mb-4">
                    <div class="card item-card">
                        <div class="item-img-container">
                            <img src="${item.imgUrl || 'img/no-image.jpg'}" class="card-img-top item-img" alt="${item.itemNm}">
                        </div>
                        <div class="card-body">
                            <h5 class="card-title">${item.itemNm}</h5>
                            <p class="card-text">${(Number(item.price) || 0).toLocaleString()}원</p>                            
                            <a href="item-detail.html?id=${item.id}" class="btn btn-outline-primary">상세보기</a>
                        </div>
                    </div>
                </div>
            `;
        });
        
        featuredItemsContainer.innerHTML = html;
    } catch (error) {
        featuredItemsContainer.innerHTML = '<div class="col-12 text-center"><p>상품을 불러오는 중 오류가 발생했습니다.</p></div>';
        console.error('인기 상품 로드 오류:', error);
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
