// Данные коворкингов по городам
const coworkingsByCity = {
    moscow: [
        {
            id: 1,
            name: "WorkSpot Технопарк",
            address: "ул. Ленина, 15, Москва",
            rating: 4.8,
            price: 800,
            image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600",
            seats: 12,
            features: ["Wi-Fi", "Кофе", "Принтер"]
        },
        {
            id: 2,
            name: "Creative Hub",
            address: "пр. Мира, 45, Москва",
            rating: 4.6,
            price: 600,
            image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600",
            seats: 8,
            features: ["Wi-Fi", "Парковка"]
        },
        {
            id: 3,
            name: "BizSpace Центр",
            address: "ул. Гагарина, 22, Москва",
            rating: 4.9,
            price: 1200,
            image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600",
            seats: 20,
            features: ["Wi-Fi", "Кухня", "Переговорные"]
        }
    ],
    spb: [
        {
            id: 4,
            name: "Невский Коворкинг",
            address: "Невский пр., 100, Санкт-Петербург",
            rating: 4.7,
            price: 700,
            image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600",
            seats: 15,
            features: ["Wi-Fi", "Кофе", "Панорамный вид"]
        },
        {
            id: 5,
            name: "Питер СтартАп",
            address: "Васильевский остров, 10 линия, 25, Санкт-Петербург",
            rating: 4.5,
            price: 550,
            image: "https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=600",
            seats: 10,
            features: ["Wi-Fi", "Кухня", "Игровая зона"]
        },
        {
            id: 6,
            name: "Балтика Хаб",
            address: "ул. Рубинштейна, 15, Санкт-Петербург",
            rating: 4.8,
            price: 900,
            image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=600",
            seats: 18,
            features: ["Wi-Fi", "Переговорные", "Кофе"]
        }
    ],
    kazan: [
        {
            id: 7,
            name: "Казань IT-Парк",
            address: "ул. Петербургская, 50, Казань",
            rating: 4.6,
            price: 500,
            image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600",
            seats: 25,
            features: ["Wi-Fi", "Кофе", "Парковка"]
        },
        {
            id: 8,
            name: "Кремль Ворк",
            address: "ул. Баумана, 20, Казань",
            rating: 4.9,
            price: 650,
            image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600",
            seats: 12,
            features: ["Wi-Fi", "Вид на Кремль", "Кофе"]
        },
        {
            id: 9,
            name: "Татнефть Хаб",
            address: "пр. Ямашева, 36, Казань",
            rating: 4.4,
            price: 450,
            image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600",
            seats: 30,
            features: ["Wi-Fi", "Кухня", "Тренажёрный зал"]
        }
    ]
};

let coworkings = [];
let selectedSeat = null;
let currentCoworking = null;
let bookings = [];
let isAuthenticated = false;
let currentUser = null;
let authModal = null;
let currentTab = 'active'; // 'active' или 'history'
let editingBookingId = null;
let editModal = null;

document.addEventListener('DOMContentLoaded', function() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('dateSelect').min = tomorrow.toISOString().split('T')[0];
    
    authModal = new bootstrap.Modal(document.getElementById('authModal'));
    editModal = new bootstrap.Modal(document.getElementById('editModal'));
    
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('editForm').addEventListener('submit', handleEditSave);
});

function toggleAuth() {
    if (isAuthenticated) {
        if (confirm('Вы уверены, что хотите выйти?')) {
            logout();
        }
        return;
    }
    
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    switchAuthMode('login');
    authModal.show();
}

function switchAuthMode(mode) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const modalTitle = document.getElementById('authModalTitle');
    
    if (mode === 'login') {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        modalTitle.textContent = 'Вход в систему';
    } else {
        loginTab.classList.remove('active');
        registerTab.classList.add('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        modalTitle.textContent = 'Регистрация';
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (email && password.length >= 4) {
        currentUser = {
            name: email.split('@')[0],
            email: email
        };
        
        isAuthenticated = true;
        authModal.hide();
        updateAuthButton();
        showToast(`✅ Добро пожаловать, ${currentUser.name}!`);
    } else {
        showToast('❌ Неверный email или пароль', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    
    if (password !== passwordConfirm) {
        showToast('❌ Пароли не совпадают', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('❌ Пароль должен быть минимум 6 символов', 'error');
        return;
    }
    
    currentUser = {
        name: name,
        email: email,
        phone: phone
    };
    
    isAuthenticated = true;
    authModal.hide();
    updateAuthButton();
    showToast(`✅ Регистрация успешна! Добро пожаловать, ${name}!`);
}

function logout() {
    isAuthenticated = false;
    currentUser = null;
    updateAuthButton();
    showToast('Вы вышли из системы');
    
    if (document.getElementById('cabinetSection').style.display !== 'none') {
        showMain();
    }
}

function updateAuthButton() {
    const btn = document.querySelector('.navbar .btn');
    
    if (isAuthenticated) {
        btn.textContent = `👤 ${currentUser.name} (Выйти)`;
        btn.classList.remove('btn-light');
        btn.classList.add('btn-outline-light');
    } else {
        btn.textContent = 'Войти';
        btn.classList.remove('btn-outline-light');
        btn.classList.add('btn-light');
    }
}

function showCabinet() {
    if (!isAuthenticated) {
        showToast('Сначала войдите в систему');
        switchAuthMode('login');
        authModal.show();
        return;
    }
    
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('cabinetSection').style.display = 'block';
    currentTab = 'active';
    updateTabs();
    displayBookings();
    window.scrollTo(0, 0);
}

function showMain() {
    document.getElementById('heroSection').style.display = 'flex';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('cabinetSection').style.display = 'none';
    window.scrollTo(0, 0);
}

// Переключение вкладок
function switchTab(tab) {
    currentTab = tab;
    updateTabs();
    displayBookings();
}

function updateTabs() {
    const activeTab = document.getElementById('activeTab');
    const historyTab = document.getElementById('historyTab');
    
    if (currentTab === 'active') {
        activeTab.classList.add('active');
        historyTab.classList.remove('active');
    } else {
        activeTab.classList.remove('active');
        historyTab.classList.add('active');
    }
}

function searchCoworking() {
    const city = document.getElementById('citySelect').value;
    const date = document.getElementById('dateSelect').value;
    
    if (!city) {
        showToast('Пожалуйста, выберите город', 'error');
        document.getElementById('citySelect').focus();
        return;
    }
    
    if (!date) {
        showToast('Пожалуйста, выберите дату', 'error');
        document.getElementById('dateSelect').focus();
        return;
    }
    
    coworkings = coworkingsByCity[city] || [];
    
    if (coworkings.length === 0) {
        showToast('В этом городе пока нет коворкингов', 'error');
        return;
    }
    
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Поиск...';
    btn.disabled = true;
    
    setTimeout(() => {
        displayResults();
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        const cityNames = {
            moscow: 'Москве',
            spb: 'Санкт-Петербурге',
            kazan: 'Казани'
        };
        showToast(`Найдено ${coworkings.length} коворкинга в ${cityNames[city]}`);
    }, 800);
}

function displayResults() {
    const container = document.getElementById('coworkingList');
    
    container.innerHTML = coworkings.map(c => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100 coworking-card shadow-sm">
                <div style="overflow: hidden; border-radius: 12px 12px 0 0;">
                    <img src="${c.image}" class="card-img-top" alt="${c.name}">
                </div>
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0 fw-bold">${c.name}</h5>
                        <span class="badge badge-rating">★ ${c.rating}</span>
                    </div>
                    <p class="text-muted mb-2 small">📍 ${c.address}</p>
                    <div class="mb-3">
                        ${c.features.map(f => `<span class="badge bg-light text-dark me-1">${f}</span>`).join('')}
                    </div>
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <div>
                            <span class="h4 mb-0 text-primary fw-bold">${c.price} ₽</span>
                            <small class="text-muted">/день</small>
                        </div>
                        <button class="btn btn-primary" onclick="openBooking(${c.id})">
                            Забронировать
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openBooking(coworkingId) {
    currentCoworking = coworkings.find(c => c.id === coworkingId);
    selectedSeat = null;
    
    const seatMap = document.getElementById('seatMap');
    seatMap.innerHTML = '';
    
    for (let i = 1; i <= 8; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.textContent = i;
        
        const isOccupied = Math.random() > 0.7 && i !== 1;
        if (isOccupied) {
            seat.classList.add('occupied');
        } else {
            seat.onclick = () => selectSeat(i, seat);
        }
        
        seatMap.appendChild(seat);
    }
    
    updateBookingInfo();
    
    const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
    modal.show();
}

function selectSeat(num, element) {
    if (element.classList.contains('occupied')) return;
    
    document.querySelectorAll('.seat').forEach(s => s.classList.remove('selected'));
    element.classList.add('selected');
    selectedSeat = num;
    updateBookingInfo();
}

function updateBookingInfo() {
    const seatText = selectedSeat ? `Место №${selectedSeat}` : 'Место не выбрано';
    const price = selectedSeat ? `${currentCoworking.price} ₽` : '0 ₽';
    
    document.getElementById('selectedSeat').textContent = seatText;
    document.getElementById('bookingPrice').textContent = price;
    document.getElementById('confirmBtn').disabled = !selectedSeat;
}

function confirmBooking() {
    if (!selectedSeat) return;
    
    if (!isAuthenticated) {
        bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
        showToast('Для бронирования необходимо войти или зарегистрироваться');
        switchAuthMode('login');
        authModal.show();
        return;
    }
    
    const booking = {
        id: Date.now(),
        coworkingId: currentCoworking.id,
        coworking: currentCoworking.name,
        seat: selectedSeat,
        date: document.getElementById('dateSelect').value,
        time: document.getElementById('timeSelect').value || '09:00-18:00',
        price: currentCoworking.price,
        status: 'active',
        qrCode: 'QR-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        createdAt: new Date()
    };
    
    bookings.push(booking);
    
    bootstrap.Modal.getInstance(document.getElementById('bookingModal')).hide();
    showToast(`✅ Бронирование успешно! Место №${selectedSeat} в ${currentCoworking.name}. QR: ${booking.qrCode}`);
    
    if (document.getElementById('cabinetSection').style.display !== 'none') {
        displayBookings();
    }
}

// Отображение бронирований с разделением на активные и историю
function displayBookings() {
    const container = document.getElementById('bookingsList');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Разделяем бронирования
    const activeBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return b.status === 'active' && bookingDate >= today;
    });
    
    const historyBookings = bookings.filter(b => {
        const bookingDate = new Date(b.date);
        return b.status === 'cancelled' || bookingDate < today;
    });
    
    const displayList = currentTab === 'active' ? activeBookings : historyBookings;
    
    if (displayList.length === 0) {
        const emptyMessage = currentTab === 'active' 
            ? 'У вас пока нет активных бронирований'
            : 'История бронирований пуста';
        const emptyIcon = currentTab === 'active' ? '📅' : '📜';
        
        container.innerHTML = `
            <div class="text-center py-5">
                <div class="mb-3" style="font-size: 4rem;">${emptyIcon}</div>
                <h4 class="text-muted">${emptyMessage}</h4>
                ${currentTab === 'active' ? '<button class="btn btn-primary mt-2" onclick="showMain()">Найти коворкинг</button>' : ''}
            </div>
        `;
        return;
    }
    
    container.innerHTML = displayList.map(b => {
        const isHistory = currentTab === 'history';
        const statusBadge = b.status === 'cancelled' 
            ? '<span class="badge bg-secondary">Отменено</span>'
            : '<span class="badge bg-success">Активно</span>';
        
        return `
            <div class="card mb-3 shadow-sm border-0 ${isHistory ? 'opacity-75' : ''}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h5 class="mb-1 fw-bold">${b.coworking}</h5>
                            <p class="mb-1 text-muted">
                                📅 ${formatDate(b.date)} | 🕐 ${b.time} | 💺 Место №${b.seat}
                            </p>
                            ${statusBadge}
                            <small class="text-muted ms-2">QR: ${b.qrCode}</small>
                        </div>
                        <div class="col-md-4 text-md-end mt-3 mt-md-0">
                            <div class="h5 mb-2 text-primary fw-bold">${b.price} ₽</div>
                            ${!isHistory && b.status === 'active' ? `
                                <button class="btn btn-outline-primary btn-sm me-2" onclick="modifyBooking(${b.id})">
                                    ✏️ Изменить
                                </button>
                                <button class="btn btn-outline-danger btn-sm" onclick="cancelBooking(${b.id})">
                                    ❌ Отменить
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Открытие модального окна для изменения бронирования
function modifyBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    
    editingBookingId = id;
    
    // Заполняем форму текущими данными
    document.getElementById('editDate').value = booking.date;
    document.getElementById('editTime').value = booking.time;
    document.getElementById('editSeat').value = booking.seat;
    
    // Устанавливаем минимальную дату (завтра)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('editDate').min = tomorrow.toISOString().split('T')[0];
    
    // Обновляем информацию о бронировании
    document.getElementById('editCoworkingName').textContent = booking.coworking;
    document.getElementById('editCurrentDate').textContent = formatDate(booking.date);
    document.getElementById('editCurrentTime').textContent = booking.time;
    document.getElementById('editCurrentSeat').textContent = `Место №${booking.seat}`;
    
    editModal.show();
}

// Сохранение изменений бронирования
function handleEditSave(e) {
    e.preventDefault();
    
    if (!editingBookingId) return;
    
    const booking = bookings.find(b => b.id === editingBookingId);
    if (!booking) return;
    
    const newDate = document.getElementById('editDate').value;
    const newTime = document.getElementById('editTime').value;
    const newSeat = parseInt(document.getElementById('editSeat').value);
    
    // Проверяем, что хоть что-то изменилось
    if (newDate === booking.date && newTime === booking.time && newSeat === booking.seat) {
        showToast('Вы не внесли никаких изменений', 'error');
        return;
    }
    
    // Сохраняем старые значения для уведомления
    const oldDate = booking.date;
    const oldTime = booking.time;
    const oldSeat = booking.seat;
    
    // Применяем изменения
    booking.date = newDate;
    booking.time = newTime;
    booking.seat = newSeat;
    booking.qrCode = 'QR-' + Math.random().toString(36).substr(2, 9).toUpperCase(); // Новый QR
    
    editModal.hide();
    editingBookingId = null;
    
    // Показываем детальное уведомление об изменениях
    let changes = [];
    if (newDate !== oldDate) changes.push(`дата: ${formatDate(oldDate)} → ${formatDate(newDate)}`);
    if (newTime !== oldTime) changes.push(`время: ${oldTime} → ${newTime}`);
    if (newSeat !== oldSeat) changes.push(`место: №${oldSeat} → №${newSeat}`);
    
    showToast(`✅ Бронирование изменено! ${changes.join(', ')}. Новый QR-код отправлен на email`);
    
    // Обновляем отображение
    displayBookings();
}

// Отмена бронирования
function cancelBooking(id) {
    if (!confirm('Вы уверены, что хотите отменить бронирование? Средства будут возвращены в течение 3 дней.')) {
        return;
    }
    
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        booking.status = 'cancelled';
    }
    
    displayBookings();
    showToast('❌ Бронирование отменено. Возврат средств произведён на вашу карту');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
}

function showToast(message, type = 'success') {
    const toastEl = document.getElementById('liveToast');
    const toastBody = document.getElementById('toastMessage');
    
    toastBody.textContent = message;
    
    if (type === 'error') {
        toastEl.classList.add('border-danger');
    } else {
        toastEl.classList.remove('border-danger');
    }
    
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();
}

window.onerror = function(msg, url, line) {
    console.error('Ошибка:', msg, 'в строке', line);
    return false;
};