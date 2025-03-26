// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    // 로그인 상태 확인
    if (!localStorage.getItem('token')) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }
    
    // 대시보드 데이터 로드
    loadDashboardData();
    
    // 탭 변경 이벤트 리스너
    const tabs = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
            const targetId = e.target.getAttribute('data-bs-target').substring(1);
            if (targetId === 'members') {
                loadMembers();
            } else if (targetId === 'items') {
                loadItems();
            } else if (targetId === 'orders') {
                loadOrders();
            }
        });
    });
    
    // 초기 탭 데이터 로드
    loadMembers();
});

// 대시보드 요약 데이터 로드
async function loadDashboardData() {
    try {
        const dashboardData = await fetchAPI('admin/dashboard');
        
        document.getElementById('totalMembers').textContent = dashboardData.totalMembers;
        document.getElementById('totalItems').textContent = dashboardData.totalItems;
        document.getElementById('totalOrders').textContent = dashboardData.totalOrders;
    } catch (error) {
        console.error('대시보드 데이터 로드 오류:', error);
        alert('대시보드 데이터를 불러오는 중 오류가 발생했습니다.');
    }
}

// 회원 목록 로드
async function loadMembers() {
    try {
        const members = await fetchAPI('admin/members');
        const membersList = document.getElementById('membersList');
        
        if (members.length === 0) {
            membersList.innerHTML = '<tr><td colspan="6" class="text-center">등록된 회원이 없습니다.</td></tr>';
            return;
        }
        
        let html = '';
        members.forEach(member => {
            const createdAt = new Date(member.createdAt).toLocaleDateString();
            
            html += `
                <tr>
                    <td>${member.id}</td>
                    <td>${member.name}</td>
                    <td>${member.email}</td>
                    <td>${getRoleText(member.role)}</td>
                    <td>${createdAt}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editMember(${member.id}, '${member.name}', '${member.email}', '${member.role}')">수정</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteMember(${member.id})">삭제</button>
                    </td>
                </tr>
            `;
        });
        
        membersList.innerHTML = html;
    } catch (error) {
        console.error('회원 목록 로드 오류:', error);
        document.getElementById('membersList').innerHTML = '<tr><td colspan="6" class="text-center">회원 목록을 불러오는 중 오류가 발생했습니다.</td></tr>';
    }
}

// 상품 목록 로드
async function loadItems() {
    try {
        const items = await fetchAPI('admin/items');
        const itemsList = document.getElementById('itemsList');
        
        if (items.length === 0) {
            itemsList.innerHTML = '<tr><td colspan="6" class="text-center">등록된 상품이 없습니다.</td></tr>';
            return;
        }
        
        let html = '';
        items.forEach(item => {
            const createdAt = new Date(item.createdAt).toLocaleDateString();
            
            html += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.itemNm}</td>
                    <td>${(Number(item.price) || 0 ).toLocaleString()}원</td>
                    <td>${item.stockNumber}</td>
                    <td>${createdAt}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="editItem(${item.id})">수정</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteItem(${item.id})">삭제</button>
                    </td>
                </tr>
            `;
        });
        
        itemsList.innerHTML = html;
    } catch (error) {
        console.error('상품 목록 로드 오류:', error);
        document.getElementById('itemsList').innerHTML = '<tr><td colspan="6" class="text-center">상품 목록을 불러오는 중 오류가 발생했습니다.</td></tr>';
    }
}

// 주문 목록 로드
async function loadOrders() {
    try {
        const orders = await fetchAPI('admin/orders');
        const ordersList = document.getElementById('ordersList');
        
        if (orders.length === 0) {
            ordersList.innerHTML = '<tr><td colspan="6" class="text-center">주문 내역이 없습니다.</td></tr>';
            return;
        }
        
        let html = '';
        orders.forEach(order => {
            const orderDate = new Date(order.orderDate).toLocaleDateString();
            
            html += `
                <tr>
                    <td>${order.orderId}</td>
                    <td>${order.memberId}</td>
                    <td>${(Number(order.totalPrice) || 0).toLocaleString()}원</td>
                    <td>${getOrderStatusText(order.orderStatus)}</td>
                    <td>${orderDate}</td>
                    <td>
                        <!--<button class="btn btn-sm btn-info" onclick="viewOrderDetail(${order.orderId})">상세</button>-->
                        <button class="btn btn-sm btn-primary" onclick="updateOrderStatus(${order.orderId}, '${order.orderStatus}')">상태 변경</button>
                    </td>
                </tr>
            `;
        });
        
        ordersList.innerHTML = html;
    } catch (error) {
        console.error('주문 목록 로드 오류:', error);
        document.getElementById('ordersList').innerHTML = '<tr><td colspan="6" class="text-center">주문 목록을 불러오는 중 오류가 발생했습니다.</td></tr>';
    }
}

// 역할 텍스트 반환 함수
function getRoleText(role) {
    switch (role) {
        case 'ADMIN':
            return '관리자';
        case 'SELLER':
            return '판매자';
        case 'BUYER':
            return '구매자';
        default:
            return '일반 사용자';
    }
}

// 주문 상태 텍스트 반환 함수
function getOrderStatusText(status) {
    switch (status) {
        case 'ORDER':
            return '주문 완료';
        case 'CANCEL':
            return '주문 취소';
        case 'SHIPPING':
            return '배송 중';
        case 'COMPLETE':
            return '배송 완료';
        default:
            return '알 수 없음';
    }
}

// 회원 수정 함수
function editMember(memberId, name, email, role) {
    // 회원 역할 선택 옵션
    const roleOptions = [
        { value: 'BUYER', text: '구매자' },
        { value: 'SELLER', text: '판매자' },
        { value: 'ADMIN', text: '관리자' }
    ];
    
    // 역할 선택 옵션 HTML 생성
    let roleOptionsHtml = '';
    roleOptions.forEach(option => {
        roleOptionsHtml += `<option value="${option.value}" ${role === option.value ? 'selected' : ''}>${option.text}</option>`;
    });
    
    // 모달 생성
    const modalHtml = `
        <div class="modal fade" id="editMemberModal" tabindex="-1" aria-labelledby="editMemberModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editMemberModalLabel">회원 정보 수정</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editMemberForm">
                            <input type="hidden" id="editMemberId" value="${memberId}">
                            <div class="mb-3">
                                <label for="editMemberName" class="form-label">이름</label>
                                <input type="text" class="form-control" id="editMemberName" value="${name}" required>
                            </div>
                            <div class="mb-3">
                                <label for="editMemberEmail" class="form-label">이메일</label>
                                <input type="email" class="form-control" id="editMemberEmail" value="${email}" readonly>
                            </div>
                            <div class="mb-3">
                                <label for="editMemberRole" class="form-label">역할</label>
                                <select class="form-select" id="editMemberRole" required>
                                    ${roleOptionsHtml}
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                        <button type="button" class="btn btn-primary" id="saveMemberBtn">저장</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 기존 모달 제거 후 새 모달 추가
    const existingModal = document.getElementById('editMemberModal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 모달 표시
    const modal = new bootstrap.Modal(document.getElementById('editMemberModal'));
    modal.show();
    
    // 저장 버튼 이벤트 리스너
    document.getElementById('saveMemberBtn').addEventListener('click', async () => {
    const newName = document.getElementById('editMemberName').value;
    const newRole = document.getElementById('editMemberRole').value;
    
    if (!newName) {
        alert('이름을 입력해주세요.');
        return;
    }
        try {
            // 회원 정보(이름과 역할) 수정 API 호출
            await fetchAPI(`admin/members/${memberId}/info`, {
                method: 'PATCH',
                body: JSON.stringify({ 
                    name: newName,
                    role: newRole 
                })
            });
            
            alert('회원 정보가 성공적으로 수정되었습니다.');
            modal.hide();
            loadMembers(); // 회원 목록 새로고침
        } catch (error) {
            console.error('회원 정보 수정 오류:', error);
            alert('회원 정보 수정 중 오류가 발생했습니다.');
        }
    });
}

    


// 회원 삭제 함수
async function deleteMember(memberId) {
    if (confirm(`정말로 회원 ID ${memberId}를 삭제하시겠습니까?`)) {
        try {
            // 회원 삭제 API 호출
            await fetchAPI(`admin/members/${memberId}`, {
                method: 'DELETE'
            });
            
            alert('회원이 성공적으로 삭제되었습니다.');
            loadMembers(); // 회원 목록 새로고침
        } catch (error) {
            console.error('회원 삭제 오류:', error);
            alert('회원 삭제 중 오류가 발생했습니다.');
        }
    }
}

// 상품 정보 가져오기
async function getItemDetail(itemId) {
    try {
        return await fetchAPI(`items/${itemId}`);
    } catch (error) {
        console.error('상품 정보 조회 오류:', error);
        throw error;
    }
}

// 상품 수정 함수
async function editItem(itemId) {
    try {
        // 상품 상세 정보 가져오기
        const item = await getItemDetail(itemId);
        
        if (!item) {
            throw new Error('상품 정보를 불러올 수 없습니다.');
        }
        
        // 모달 생성
        const modalHtml = `
            <div class="modal fade" id="editItemModal" tabindex="-1" aria-labelledby="editItemModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="editItemModalLabel">상품 정보 수정</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editItemForm" enctype="multipart/form-data">
                                <input type="hidden" id="editItemId" value="${itemId}">
                                <div class="mb-3">
                                    <label for="editItemName" class="form-label">상품명</label>
                                    <input type="text" class="form-control" id="editItemName" value="${item.itemNm || ''}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="editItemPrice" class="form-label">가격</label>
                                    <input type="number" class="form-control" id="editItemPrice" value="${(Number(item.price || 0))}" min="0" required>
                                </div>
                                <div class="mb-3">
                                    <label for="editItemStock" class="form-label">재고 수량</label>
                                    <input type="number" class="form-control" id="editItemStock" value="${item.stockNumber || 0}" min="0" required>
                                </div>
                                <div class="mb-3">
                                    <label for="editItemDetail" class="form-label">상품 설명</label>
                                    <textarea class="form-control" id="editItemDetail" rows="5" required>${item.itemDetail || ''}</textarea>
                                </div>
                                <div class="mb-3">
                                    <label for="editItemImage" class="form-label">이미지</label>
                                    <input type="file" class="form-control" id="editItemImage" name="image" accept="image/*">
                                    ${item.imgUrl ? 
                                        `<div class="mt-2">
                                            <small class="text-muted">현재 이미지: ${item.originalFileName || ''}</small>
                                            <img src="${item.imgUrl}" class="img-thumbnail mt-2" style="max-height: 100px;">
                                        </div>` : 
                                        '<small class="text-muted">이미지가 없습니다.</small>'}
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                            <button type="button" class="btn btn-primary" id="saveItemBtn">저장</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 기존 모달 제거 후 새 모달 추가
        const existingModal = document.getElementById('editItemModal');
        if (existingModal) {
            existingModal.remove();
        }
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 모달 표시
        const modal = new bootstrap.Modal(document.getElementById('editItemModal'));
        modal.show();
        
        // 저장 버튼 이벤트 리스너
        document.getElementById('saveItemBtn').addEventListener('click', async () => {
            const itemName = document.getElementById('editItemName').value;
            const price = document.getElementById('editItemPrice').value;
            const stockNumber = document.getElementById('editItemStock').value;
            const itemDetail = document.getElementById('editItemDetail').value;
            const imageFile = document.getElementById('editItemImage').files[0];
            
            if (!itemName || !price || !stockNumber || !itemDetail) {
                alert('모든 필수 항목을 입력해주세요.');
                return;
            }
            
            try {
                // 이미지 파일이 있는 경우 먼저 업로드
                let imgUrl = item.imgUrl;
                let originalFileName = item.originalFileName;
                let hashedFileName = item.hashedFileName;
                
                if (imageFile) {
                    const formData = new FormData();
                    formData.append('image', imageFile);
                    
                    try {
                        const uploadResponse = await fetchAPI('upload/image', {
                            method: 'POST',
                            body: formData,
                            headers: {} // FormData 사용 시 Content-Type 헤더 제거
                        });
                        
                        imgUrl = uploadResponse.imageUrl;
                        originalFileName = uploadResponse.originalFileName || imageFile.name;
                        hashedFileName = uploadResponse.hashedFileName || imgUrl.split('/').pop();
                    } catch (uploadError) {
                        console.error('이미지 업로드 오류:', uploadError);
                        // 이미지 업로드 실패해도 계속 진행
                    }
                }
                
                // 상품 데이터 JSON으로 전송
                const itemData = {
                    itemNm: itemName,
                    price: parseInt(price),
                    stockNumber: parseInt(stockNumber),
                    itemDetail: itemDetail,
                    imgUrl: imgUrl,
                    originalFileName: originalFileName,
                    hashedFileName: hashedFileName
                };
                
                console.log('전송할 상품 데이터:', itemData);
                
                // 상품 수정 API 호출
                await fetchAPI(`items/${itemId}`, {
                    method: 'PUT',
                    body: JSON.stringify(itemData)
                });
                
                alert('상품 정보가 성공적으로 수정되었습니다.');
                modal.hide();
                loadItems(); // 상품 목록 새로고침
            } catch (error) {
                console.error('상품 정보 수정 오류:', error);
                alert('상품 정보 수정 중 오류가 발생했습니다.');
            }
        });
    } catch (error) {
        console.error('상품 수정 모달 생성 오류:', error);
        alert('상품 정보를 불러오는 중 오류가 발생했습니다.');
    }
}

// 상품 삭제 함수
async function deleteItem(itemId) {
    if (confirm(`정말로 상품 ID ${itemId}를 삭제하시겠습니까?`)) {
        try {
            // 상품 삭제 API 호출
            await fetchAPI(`items/${itemId}`, {
                method: 'DELETE'
            });
            
            alert('상품이 성공적으로 삭제되었습니다.');
            loadItems(); // 상품 목록 새로고침
        } catch (error) {
            console.error('상품 삭제 오류:', error);
            alert('상품 삭제 중 오류가 발생했습니다.');
        }
    }
}

// 주문 상세 정보 가져오기
async function getOrderDetail(orderId) {
  try {
    const response = await fetchAPI(`orders/${orderId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('주문 정보 조회 오류:', error);
    throw error;
  }
}


// 주문 상세 보기 함수
async function viewOrderDetail(orderId) {
    try {
        // 주문 상세 정보 가져오기
        const order = await getOrderDetail(orderId);
        if (!order) {
            throw new Error('주문 정보를 찾을 수 없습니다.');
        }
        // 모달 생성
            const modalHtml = `
            <div class="modal fade" id="orderDetailModal" tabindex="-1" aria-labelledby="orderDetailModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="orderDetailModalLabel">주문 상세 정보</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <p><strong>주문 ID:</strong> ${order.orderId}</p>
                                <p><strong>회원 ID:</strong> ${order.memberId}</p>
                                <p><strong>주문 상태:</strong> ${getOrderStatusText(order.orderStatus)}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>주문일:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
                                <p><strong>총 주문금액:</strong> ${(Number(order.totalPrice) || 0).toLocaleString()}원</p>
                            </div>
                        </div>
                        
                        <h6 class="mt-4 mb-3">주문 상품 목록</h6>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>상품 ID</th>
                                        <th>상품명</th>
                                        <th>수량</th>
                                        <th>가격</th>
                                        <th>소계</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${order.orderItems.map(item => `
                                        <tr>
                                            <td>${item.itemId}</td>
                                            <td>${item.itemNm}</td>
                                            <td>${item.count}</td>
                                            <td>${(Number(item.price) || 0).toLocaleString()}원</td>
                                            <td>${((Number(item.price) || 0) * item.count).toLocaleString()}원</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 기존 모달 제거 후 새 모달 추가
    const existingModal = document.getElementById('orderDetailModal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 모달 표시
    const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    modal.show();
    } catch (error) {
        console.error('주문 상세 정보 조회 오류:', error);
        alert('주문 상세 정보를 불러오는 중 오류가 발생했습니다.');
    }
}

// 주문 상태 변경 함수
function updateOrderStatus(orderId, currentStatus) {
    // 주문 상태 옵션
    const statusOptions = [
        { value: 'ORDER', text: '주문 완료' },
        { value: 'SHIPPING', text: '배송 중' },
        { value: 'COMPLETE', text: '배송 완료' },
        { value: 'CANCEL', text: '주문 취소' }
    ];
    // 상태 선택 옵션 HTML 생성
    let statusOptionsHtml = '';
    statusOptions.forEach(option => {
        statusOptionsHtml += `<option value="${option.value}" ${currentStatus === option.value ? 'selected' : ''}>${option.text}</option>`;
    });
    
    // 모달 생성
    const modalHtml = `
    <div class="modal fade" id="updateOrderStatusModal" tabindex="-1" aria-labelledby="updateOrderStatusModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="updateOrderStatusModalLabel">주문 상태 변경</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="updateOrderStatusForm">
                        <input type="hidden" id="updateOrderId" value="${orderId}">
                        <div class="mb-3">
                            <label for="updateOrderStatus" class="form-label">주문 상태</label>
                            <select class="form-select" id="updateOrderStatus" required>
                                ${statusOptionsHtml}
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">취소</button>
                    <button type="button" class="btn btn-primary" id="saveOrderStatusBtn">저장</button>
                </div>
            </div>
        </div>
    </div>`;
    // 기존 모달 제거 후 새 모달 추가
    const existingModal = document.getElementById('updateOrderStatusModal');
    if (existingModal) {
        existingModal.remove();
    }
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    // 모달 표시
    const modal = new bootstrap.Modal(document.getElementById('updateOrderStatusModal'));
    modal.show();
    // 저장 버튼 이벤트 리스너
    document.getElementById('saveOrderStatusBtn').addEventListener('click', async () => {
        const newStatus = document.getElementById('updateOrderStatus').value;
        try {
            // 주문 상태 변경 API 호출
            await fetchAPI(`admin/orders/${orderId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            alert('주문 상태가 성공적으로 변경되었습니다.');
            modal.hide();
            loadOrders(); // 주문 목록 새로고침
        } catch (error) {
            console.error('주문 상태 변경 오류:', error);
            alert('주문 상태 변경 중 오류가 발생했습니다.');
        }
    });
}

// 주문 상세 정보 가져오기
async function getOrderDetail(orderId) {
    try {
        // 기존 엔드포인트가 없으므로 일반 주문 조회 API 사용
        return await fetchAPI(`orders/${orderId}`);
    } catch (error) {
        console.error('주문 정보 조회 오류:', error);
        throw error;
    }
}
