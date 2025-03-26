// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // 로그인 상태 확인
    /*
    if (!localStorage.getItem('token')) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }*/
    // 사용자 인증 상태 확인
    checkSessionStatus();
    
    // 장바구니 목록 로드
    loadCartItems();
    
});

// 장바구니 목록 로드 함수
async function loadCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const orderBtnContainer = document.getElementById('orderBtnContainer');
    
    try {
        const cartItems = await getCartItems();
        
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="text-center py-5">
                    <p>장바구니가 비어있습니다.</p>
                    <a href="items.html" class="btn btn-primary mt-3">쇼핑 계속하기</a>
                </div>
            `;
            orderBtnContainer.style.display = 'none';
            return;
        }
        
        let totalPrice = 0;
        let html = `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>상품</th>
                            <th>가격</th>
                            <th>수량</th>
                            <th>합계</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        cartItems.forEach(item => {
            const itemTotal = item.price * item.count;
            totalPrice += itemTotal;
            
            html += `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${item.imgUrl || 'img/no-image.jpg'}" alt="${item.itemNm}" class="img-thumbnail me-3" style="width: 80px; height: 80px; object-fit: cover;">
                            <div>
                                <h5><a href="item-detail.html?id=${item.itemId}" class="text-decoration-none">${item.itemNm}</a></h5>
                            </div>
                        </div>
                    </td>
                    <td>${(Number(item.price) || 0).toLocaleString()}원</td>
                    <td>
                        <div class="quantity-control">
                            <button class="btn btn-sm btn-outline-secondary decrease-btn" data-id="${item.cartItemId}">-</button>
                            <input type="number" class="form-control form-control-sm mx-2 quantity-input" value="${item.count}" min="1" data-id="${item.cartItemId}">
                            <button class="btn btn-sm btn-outline-secondary increase-btn" data-id="${item.cartItemId}">+</button>
                        </div>
                    </td>
                    <td>${(Number(itemTotal) || 0).toLocaleString()}원</td>
                    <td>
                        <button class="btn btn-sm btn-danger remove-btn" data-id="${item.cartItemId}">삭제</button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
            <div class="card mt-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <h4>총 주문금액</h4>
                        <h4>${totalPrice.toLocaleString()}원</h4>
                    </div>
                </div>
            </div>
        `;
        
        cartItemsContainer.innerHTML = html;
        orderBtnContainer.style.display = 'block';
        
        // 수량 감소 버튼 이벤트 리스너
        const decreaseBtns = document.querySelectorAll('.decrease-btn');
        decreaseBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const cartItemId = btn.dataset.id;
                const inputElement = document.querySelector(`.quantity-input[data-id="${cartItemId}"]`);
                let count = parseInt(inputElement.value);
                
                if (count > 1) {
                    count--;
                    inputElement.value = count;
                    await updateCartItemCount(cartItemId, count);
                    loadCartItems();
                }
            });
        });
        
        // 수량 증가 버튼 이벤트 리스너
        const increaseBtns = document.querySelectorAll('.increase-btn');
        increaseBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const cartItemId = btn.dataset.id;
                const inputElement = document.querySelector(`.quantity-input[data-id="${cartItemId}"]`);
                let count = parseInt(inputElement.value);
                
                count++;
                inputElement.value = count;
                await updateCartItemCount(cartItemId, count);
                loadCartItems();
            });
        });
        
        // 수량 입력 이벤트 리스너
        const quantityInputs = document.querySelectorAll('.quantity-input');
        quantityInputs.forEach(input => {
            input.addEventListener('change', async () => {
                const cartItemId = input.dataset.id;
                let count = parseInt(input.value);
                
                if (isNaN(count) || count < 1) {
                    count = 1;
                    input.value = count;
                }
                
                await updateCartItemCount(cartItemId, count);
                loadCartItems();
            });
        });
        
        // 삭제 버튼 이벤트 리스너
        const removeBtns = document.querySelectorAll('.remove-btn');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                const cartItemId = btn.dataset.id;
                
                if (confirm('정말로 이 상품을 장바구니에서 삭제하시겠습니까?')) {
                    await removeCartItem(cartItemId);
                    loadCartItems();
                }
            });
        });
        
        // 주문하기 버튼 이벤트 리스너
        const orderBtn = document.getElementById('orderBtn');
        orderBtn.addEventListener('click', async () => {
            try {
                const orderData = {
                    cartItemIds: cartItems.map(item => item.cartItemId)
                };
                
                const order = await createOrder(orderData);
                
                alert('주문이 완료되었습니다.');
                window.location.href = 'my-page.html';
            } catch (error) {
                alert('주문 처리 중 오류가 발생했습니다.');
                console.error('주문 처리 오류:', error);
            }
        });
        } catch (error) {
        cartItemsContainer.innerHTML = '<div class="text-center"><p>장바구니를 불러오는 중 오류가 발생했습니다.</p></div>';
        orderBtnContainer.style.display = 'none';
        console.error('장바구니 로드 오류:', error);
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


