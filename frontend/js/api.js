// API 기본 URL
//const API_BASE_URL = 'http://133.186.220.179:8080/api';
const API_BASE_URL = '/api';


// API 요청 함수
async function fetchAPI(endpoint, options = {}) {
    const API_BASE_URL = '/api';
    const url = `${API_BASE_URL}/${endpoint}`;
    
    // 기본 옵션 설정
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    // 토큰이 있으면 Authorization 헤더 추가
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // FormData인 경우 Content-Type 헤더 제거
    if (options.body instanceof FormData) {
        delete defaultOptions.headers['Content-Type'];
    }
    
    // 옵션 병합
    const fetchOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };
    
    const response = await fetch(url, fetchOptions);
    
    // 응답 처리
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
    }
    
    return response.json();
}


// 인기 상품 가져오기
async function getFeaturedItems() {
    return fetchAPI('items/featured');
}

// 상품 목록 가져오기
async function getItems(page = 0, size = 12, sort = 'newest', search = '') {
    let endpoint = `items?page=${page}&size=${size}`;
    
    if (sort) {
        endpoint += `&sort=${sort}`;
    }
    
    if (search) {
        endpoint += `&search=${encodeURIComponent(search)}`;
    }
    
    return fetchAPI(endpoint);
}

// 상품 상세 정보 가져오기
async function getItemDetail(itemId) {
    return fetchAPI(`items/${itemId}`);
}

// 장바구니에 상품 추가
async function addToCart(itemId, count = 1) {
    return fetchAPI('cart/add', {
        method: 'POST',
        body: JSON.stringify({ itemId, count })
    });
}

// 장바구니 목록 가져오기
async function getCartItems() {
    return fetchAPI('cart');
}

// 장바구니 상품 수량 변경
async function updateCartItemCount(cartItemId, count) {
    return fetchAPI(`cart/update/${cartItemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ count })
    });
}

// 장바구니 상품 삭제
async function removeCartItem(cartItemId) {
    return fetchAPI(`cart/remove/${cartItemId}`, {
        method: 'DELETE'
    });
}

// 로그인
async function login(email, password) {
    return fetchAPI('members/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

// 회원가입
async function register(memberData) {
    return fetchAPI('members/new', {
        method: 'POST',
        body: JSON.stringify(memberData)
    });
}

// 회원 정보 가져오기
async function getMemberInfo() {
    return fetchAPI('members/info');
}

// 주문 생성
async function createOrder(orderData) {
    return fetchAPI('orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
}

// 주문 목록 가져오기
async function getOrders() {
    return fetchAPI('orders');
}

// 주문 상세 정보 가져오기
async function getOrderDetail(orderId) {
    return fetchAPI(`orders/${orderId}`);
}

// 상품 생성 (판매자/관리자용)
async function createItem(itemData) {
    return fetchAPI('items', {
        method: 'POST',
        body: JSON.stringify(itemData)
    });
}

// 상품 수정 (판매자/관리자용)
async function updateItem(itemId, itemData) {
    return fetchAPI(`items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(itemData)
    });
}

// 상품 삭제 (판매자/관리자용)
async function deleteItem(itemId) {
    return fetchAPI(`items/${itemId}`, {
        method: 'DELETE'
    });
}

// 관리자 대시보드 데이터 가져오기
async function getAdminDashboard() {
    return fetchAPI('admin/dashboard');
}

// 관리자용 회원 목록 가져오기
async function getAdminMembers() {
    return fetchAPI('admin/members');
}

// 관리자용 상품 목록 가져오기
async function getAdminItems() {
    return fetchAPI('admin/items');
}

// 관리자용 주문 목록 가져오기
async function getAdminOrders() {
    return fetchAPI('admin/orders');
}

// 회원 역할 변경 (관리자용)
async function updateMemberRole(memberId, role) {
    return fetchAPI(`admin/members/${memberId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role })
    });
}

// 주문 상태 변경 (관리자용)
async function updateOrderStatus(orderId, status) {
    return fetchAPI(`admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });
}

// fetchAPI 함수 수정 - FormData 지원
async function fetchAPI(endpoint, options = {}) {
    const API_BASE_URL = '/api';
    const url = `${API_BASE_URL}/${endpoint}`;
    
    // 기본 옵션 설정
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    // 토큰이 있으면 Authorization 헤더 추가
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // FormData인 경우 Content-Type 헤더 제거
    if (options.body instanceof FormData) {
        delete defaultOptions.headers['Content-Type'];
    } else if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        // JSON 객체를 문자열로 변환
        options.body = JSON.stringify(options.body);
    }
    
    // 옵션 병합
    const fetchOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...(options.headers || {})
        }
    };
    
    try {
        const response = await fetch(url, fetchOptions);        
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        console.error(`API 호출 오류 (${endpoint}):`, error);
        throw error;
    }
}