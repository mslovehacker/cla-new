// 상품 ID와 수량 상태 관리
let itemId = null;
let quantity = 1;

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // URL에서 상품 ID 추출
    const urlParams = new URLSearchParams(window.location.search);
    itemId = urlParams.get('id');
    
    if (!itemId) {
        window.location.href = 'items.html';
        return;
    }
    
    // 상품 상세 정보 로드
    loadItemDetail();   
    
    // 사용자 인증 상태 확인
    checkSessionStatusMenu();
});

// 상품 상세 정보 로드 함수
async function loadItemDetail() {
    const itemDetailContainer = document.getElementById('itemDetail');
    
    try {
        const item = await getItemDetail(itemId);
        
        document.title = `${item.itemNm} - NHN Cloud Shop`;
        
        const html = `
            <div class="row">
                <div class="col-md-6 mb-4">
                    <img src="${item.imgUrl || 'img/no-image.jpg'}" class="img-fluid item-detail-img" alt="${item.itemNm}">
                </div>
                <div class="col-md-6">
                    <h1 class="mb-3">${item.itemNm}</h1>                    
                    <p class="fs-4 fw-bold mb-3">${(Number(item.price || 0).toLocaleString())}원</p>
                    <p class="mb-4">${item.itemDetail}</p>
                    
                    <div class="mb-4">
                        <label for="quantity" class="form-label">수량</label>
                        <div class="quantity-control">
                            <button class="btn btn-outline-secondary" id="decreaseBtn">-</button>
                            <input type="number" id="quantity" class="form-control mx-2" value="1" min="1" max="${item.stockNumber}">
                            <button class="btn btn-outline-secondary" id="increaseBtn">+</button>
                        </div>
                        <small class="text-muted">재고: ${item.stockNumber}개</small>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary" id="addToCartBtn">장바구니에 담기</button>
                        <button class="btn btn-outline-primary" id="buyNowBtn">바로 구매하기</button>
                    </div>
                </div>
            </div>
        `;
        
        itemDetailContainer.innerHTML = html;
        
        // 수량 조절 버튼 이벤트 리스너
        const quantityInput = document.getElementById('quantity');
        const decreaseBtn = document.getElementById('decreaseBtn');
        const increaseBtn = document.getElementById('increaseBtn');
        
        decreaseBtn.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                quantityInput.value = quantity;
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            if (quantity < item.stockNumber) {
                quantity++;
                quantityInput.value = quantity;
            }
        });
        
        quantityInput.addEventListener('change', () => {
            let newQuantity = parseInt(quantityInput.value);
            if (isNaN(newQuantity) || newQuantity < 1) {
                newQuantity = 1;
            } else if (newQuantity > item.stockNumber) {
                newQuantity = item.stockNumber;
            }
            quantity = newQuantity;
            quantityInput.value = quantity;
        });
        
        // 장바구니 담기 버튼 이벤트 리스너
        const addToCartBtn = document.getElementById('addToCartBtn');
        addToCartBtn.addEventListener('click', async () => {
            try {
                const isLoggedIn = await checkSessionStatus();
                if (isLoggedIn) {
                    await addToCart(itemId, quantity);
                    if (confirm('상품이 장바구니에 추가되었습니다. 장바구니로 이동하시겠습니까?')) {
                        window.location.href = 'cart.html';
                    }
                }
            } catch (error) {
                alert('장바구니에 추가하는 중 오류가 발생했습니다.');
                console.error('장바구니 추가 오류:', error);
            }
        });
        
        // 바로 구매하기 버튼 이벤트 리스너
        const buyNowBtn = document.getElementById('buyNowBtn');
        buyNowBtn.addEventListener('click', async () => {
            try {
                const isLoggedIn = await checkSessionStatus();
                if (isLoggedIn) {
                    const order = await createOrder(orderData);
                    alert('주문이 완료되었습니다.');
                    window.location.href = 'my-page.html';
                }
            } catch (error) {
                alert('주문 처리 중 오류가 발생했습니다.');
                console.error('주문 처리 오류:', error);
            }
        });
    } catch (error) {
        itemDetailContainer.innerHTML = '<div class="text-center"><p>상품 정보를 불러오는 중 오류가 발생했습니다.</p></div>';
        console.error('상품 상세 정보 로드 오류:', error);
    }
}

// 사용자 인증 상태 확인 함수 (세션 기반)
async function checkSessionStatus() {
    try {
        const response = await fetch('/api/members/session', { method: 'GET', credentials: 'include' });
        const result = await response.json();

        if (response.status === 200 && result.user) {
            return true;
        } else {
            console.warn('사용자가 로그인하지 않았습니다.');
            alert('로그인이 필요합니다.');
            window.location.href = 'login.html';
            return false;
        }
    } catch (error) {
        console.error('세션 확인 오류:', error);
        return false;
    }
}

// 사용자 인증 상태 확인 함수 (세션 기반)
async function checkSessionStatusMenu() {
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
