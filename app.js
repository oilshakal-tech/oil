// ===== SHAKAL OIL - MAIN APP JS =====

// ===== PARTICLES =====
(function createParticles() {
  const container = document.getElementById('particles');
  const count = 60;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 3 + 1;
    const x = Math.random() * 100;
    const delay = Math.random() * 10;
    const duration = 8 + Math.random() * 12;
    const isGold = Math.random() > 0.5;
    p.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${isGold ? 'rgba(255,215,0,' : 'rgba(0,191,255,'}${0.2 + Math.random() * 0.5});
      left: ${x}%;
      bottom: -10px;
      animation: particleFloat ${duration}s ${delay}s linear infinite;
      pointer-events: none;
    `;
    container.appendChild(p);
  }
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleFloat {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 0.5; }
      100% { transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 100}px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();

// ===== NAVBAR SCROLL =====
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// ===== HAMBURGER =====
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

// Close nav on link click
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

// ===== SET MIN DATE FOR BOOKING =====
(function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  ['bookDate', 'dashBookDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.min = today;
  });
})();

// ===== MODAL SYSTEM =====
function showModal(id) {
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
  document.body.style.overflow = '';
}

function switchModal(fromId, toId) {
  closeModal(fromId);
  setTimeout(() => showModal(toId), 200);
}

// Close on backdrop click
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal(modal.id);
  });
});

// ===== TOAST =====
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.background = type === 'error'
    ? 'rgba(255,0,68,0.15)'
    : 'rgba(0,255,136,0.15)';
  toast.style.borderColor = type === 'error'
    ? 'rgba(255,0,68,0.3)'
    : 'rgba(0,255,136,0.3)';
  toast.style.color = type === 'error' ? '#ff4444' : '#00FF88';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== TABS =====
function switchTab(tabId) {
  document.querySelectorAll('#customerDashboard .tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('#customerDashboard .tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.remove('hidden');
  event.target.classList.add('active');

  if (tabId === 'appointmentsTab') loadCustomerAppointments();
}

function switchAdminTab(tabId) {
  document.querySelectorAll('#adminDashboard .tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('#adminDashboard .tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.remove('hidden');
  event.target.classList.add('active');

  if (tabId === 'usersTab') loadAdminUsers();
  if (tabId === 'bookingsTab') loadAdminBookings();
  if (tabId === 'discountsTab') loadDiscounts();
  if (tabId === 'messagesTab') loadMessages();
}

// ===== SERVICE LABELS =====
const serviceLabels = {
  oil_change: 'تغيير الزيت 🛢️',
  filter_change: 'تبديل الفلاتر 🔧',
  water_change: 'تبديل الماء 💧',
  full_maintenance: 'صيانة شاملة ⚙️',
  tire_inflation: 'نفخ العجلات 🛞',
  inspection: 'فحص عام 🔍',
  other: 'أخرى'
};

// ===== FIREBASE HELPERS =====
// Safely access Firebase (after module loads)
function getDB() { return window.db; }
function getAuth() { return window.auth; }
function getFns() { return window.firebaseFns; }

// Fallback to demo mode if Firebase not configured
let demoMode = false;
const demoUsers = [];
const demoBookings = [];
const demoMessages = [];
const demoDiscounts = [];

function checkFirebase() {
  try {
    return !!window.db && window.firebaseConfig?.projectId !== 'YOUR_PROJECT_ID';
  } catch { return false; }
}

// ===== AUTH STATE =====
let currentUser = null;
let isAdmin = false;

window.addEventListener('load', () => {
  // Give Firebase module time to load
  setTimeout(() => {
    try {
      const { onAuthStateChanged } = getFns();
      onAuthStateChanged(getAuth(), async (user) => {
        currentUser = user;
        if (user) {
          if (user.email === 'oilshakal@gmail.com') {
            isAdmin = true;
          }
        }
      });
    } catch (e) {
      console.log('Firebase not configured, running in demo mode');
      demoMode = true;
    }
  }, 1500);
});

// ===== REGISTER =====
async function registerUser(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const errEl = document.getElementById('regError');

  if (password.length < 6) {
    showErr(errEl, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    return;
  }

  try {
    if (demoMode) {
      // Demo registration
      const demoUser = { uid: 'demo_' + Date.now(), email, name, phone };
      demoUsers.push(demoUser);
      currentUser = demoUser;
      closeModal('registerModal');
      populateCustomerDashboard({ name, email, phone });
      showModal('customerDashboard');
      showToast('تم إنشاء الحساب بنجاح! 🎉');
      return;
    }

    const { createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js");
    const { collection, addDoc } = getFns();
    const userCred = await createUserWithEmailAndPassword(getAuth(), email, password);
    await addDoc(collection(getDB(), 'users'), {
      uid: userCred.user.uid,
      name, phone, email,
      createdAt: new Date().toISOString()
    });
    currentUser = userCred.user;
    closeModal('registerModal');
    populateCustomerDashboard({ name, email, phone });
    showModal('customerDashboard');
    showToast('تم إنشاء الحساب بنجاح! 🎉');
  } catch (err) {
    const msg = err.code === 'auth/email-already-in-use'
      ? 'هذا الإيميل مسجل مسبقاً'
      : err.code === 'auth/invalid-email'
      ? 'صيغة الإيميل غير صحيحة'
      : 'حدث خطأ، حاول مرة أخرى';
    showErr(errEl, msg);
  }
}

// ===== LOGIN =====
async function loginUser(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');

  try {
    if (demoMode) {
      const found = demoUsers.find(u => u.email === email);
      if (found) {
        currentUser = found;
        closeModal('loginModal');
        populateCustomerDashboard(found);
        showModal('customerDashboard');
        showToast('مرحباً بك! 👋');
      } else {
        showErr(errEl, 'البيانات غير صحيحة');
      }
      return;
    }

    const { signInWithEmailAndPassword } = getFns();
    const userCred = await signInWithEmailAndPassword(getAuth(), email, password);
    currentUser = userCred.user;

    if (email === 'oilshakal@gmail.com') {
      isAdmin = true;
      closeModal('loginModal');
      showModal('adminDashboard');
      loadAdminDashboard();
      showToast('مرحباً بك في لوحة التحكم ⚙️');
      return;
    }

    // Get user profile
    const { collection, getDocs, query, where } = getFns();
    const q = query(collection(getDB(), 'users'), where('uid', '==', userCred.user.uid));
    const snap = await getDocs(q);
    const userData = snap.empty ? { name: email, email, phone: '-' } : snap.docs[0].data();
    closeModal('loginModal');
    populateCustomerDashboard(userData);
    showModal('customerDashboard');
    showToast('مرحباً بك! 👋');
  } catch (err) {
    const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
      ? 'الإيميل أو كلمة المرور غير صحيحة'
      : 'حدث خطأ، حاول مرة أخرى';
    showErr(errEl, msg);
  }
}

// ===== ADMIN LOGIN =====
async function adminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  const errEl = document.getElementById('adminError');

  if (email !== 'oilshakal@gmail.com') {
    showErr(errEl, 'هذا الإيميل ليس إيميل إدارة');
    return;
  }

  try {
    if (demoMode) {
      isAdmin = true;
      closeModal('adminModal');
      showModal('adminDashboard');
      loadAdminDashboard();
      showToast('مرحباً بالإدارة ⚙️');
      return;
    }

    const { signInWithEmailAndPassword } = getFns();
    await signInWithEmailAndPassword(getAuth(), email, password);
    isAdmin = true;
    closeModal('adminModal');
    showModal('adminDashboard');
    loadAdminDashboard();
    showToast('مرحباً بالإدارة ⚙️');
  } catch (err) {
    showErr(errEl, 'كلمة المرور غير صحيحة');
  }
}

function logoutUser() {
  try { getFns().signOut(getAuth()); } catch {}
  currentUser = null;
  closeModal('customerDashboard');
  showToast('تم تسجيل الخروج بنجاح');
}

function adminLogout() {
  try { getFns().signOut(getAuth()); } catch {}
  isAdmin = false;
  closeModal('adminDashboard');
  showToast('تم تسجيل خروج الإدارة');
}

// ===== CUSTOMER DASHBOARD =====
function populateCustomerDashboard(user) {
  document.getElementById('custName').textContent = user.name || '-';
  document.getElementById('custEmail').textContent = user.email || '-';
  document.getElementById('custPhone').textContent = user.phone || '-';
}

async function loadCustomerAppointments() {
  const container = document.getElementById('customerAppointments');
  if (!currentUser) {
    container.innerHTML = '<p class="empty-state">يرجى تسجيل الدخول</p>';
    return;
  }

  if (demoMode) {
    const myBookings = demoBookings.filter(b => b.userId === currentUser.uid);
    renderCustomerAppointments(container, myBookings);
    return;
  }

  try {
    const { collection, getDocs, query, where, orderBy } = getFns();
    const q = query(
      collection(getDB(), 'bookings'),
      where('userId', '==', currentUser.uid)
    );
    const snap = await getDocs(q);
    const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderCustomerAppointments(container, bookings);
  } catch (e) {
    container.innerHTML = '<p class="empty-state">حدث خطأ في التحميل</p>';
  }
}

function renderCustomerAppointments(container, bookings) {
  if (!bookings.length) {
    container.innerHTML = '<p class="empty-state">لا يوجد مواعيد محجوزة بعد 📅</p>';
    return;
  }
  container.innerHTML = bookings.map(b => `
    <div class="appointment-card glass">
      <div>
        <div class="appt-service">${serviceLabels[b.service] || b.service}</div>
        <div class="appt-details">🚗 ${b.car || '-'} | 📅 ${b.date} | 🕐 ${b.time}</div>
        ${b.notes ? `<div class="appt-details">📝 ${b.notes}</div>` : ''}
      </div>
      <span class="status-badge status-${b.status || 'pending'}">${statusLabel(b.status)}</span>
    </div>
  `).join('');
}

// ===== BOOKING SUBMIT (public form) =====
async function submitBooking(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById('bookName').value,
    phone: document.getElementById('bookPhone').value,
    car: document.getElementById('bookCar').value,
    plate: document.getElementById('bookPlate').value,
    service: document.getElementById('bookService').value,
    date: document.getElementById('bookDate').value,
    time: document.getElementById('bookTime').value,
    notes: document.getElementById('bookNotes').value,
    status: 'pending',
    userId: currentUser?.uid || 'guest',
    createdAt: new Date().toISOString()
  };

  const successEl = document.getElementById('bookingSuccess');

  try {
    if (demoMode || !window.db) {
      demoBookings.push({ id: 'b_' + Date.now(), ...data });
    } else {
      const { collection, addDoc } = getFns();
      await addDoc(collection(getDB(), 'bookings'), data);
    }
    showSuccessMsg(successEl, `✅ تم تأكيد حجزك ليوم ${data.date} الساعة ${data.time}`);
    showToast('تم تسجيل موعدك بنجاح! 🎉');
    e.target.reset();
    setTimeout(() => { closeModal('bookingModal'); successEl.classList.remove('show'); }, 3000);
  } catch (err) {
    showSuccessMsg(successEl, '❌ حدث خطأ، حاول مرة أخرى', true);
  }
}

// ===== BOOKING SUBMIT (dashboard) =====
async function submitDashboardBooking(e) {
  e.preventDefault();
  if (!currentUser) { showToast('يرجى تسجيل الدخول أولاً', 'error'); return; }

  const data = {
    name: document.getElementById('custName').textContent,
    phone: document.getElementById('custPhone').textContent,
    car: document.getElementById('dashBookCar').value,
    plate: document.getElementById('dashBookPlate').value,
    service: document.getElementById('dashBookService').value,
    date: document.getElementById('dashBookDate').value,
    time: document.getElementById('dashBookTime').value,
    status: 'pending',
    userId: currentUser.uid,
    createdAt: new Date().toISOString()
  };

  const successEl = document.getElementById('dashBookSuccess');
  try {
    if (demoMode || !window.db) {
      demoBookings.push({ id: 'b_' + Date.now(), ...data });
    } else {
      const { collection, addDoc } = getFns();
      await addDoc(collection(getDB(), 'bookings'), data);
    }
    showSuccessMsg(successEl, `✅ تم تسجيل موعدك ليوم ${data.date}`);
    showToast('تم الحجز بنجاح! 📅');
    e.target.reset();
  } catch {
    showSuccessMsg(successEl, '❌ حدث خطأ، حاول مرة أخرى', true);
  }
}

// ===== CONTACT FORM =====
async function submitContact(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById('contactName').value,
    phone: document.getElementById('contactPhone').value,
    message: document.getElementById('contactMessage').value,
    createdAt: new Date().toISOString(),
    read: false
  };

  try {
    if (!demoMode && window.db) {
      const { collection, addDoc } = getFns();
      await addDoc(collection(getDB(), 'messages'), data);
    } else {
      demoMessages.push({ id: 'm_' + Date.now(), ...data });
    }
    showToast('تم إرسال رسالتك بنجاح! 📨');
    e.target.reset();
  } catch {
    showToast('حدث خطأ، حاول مرة أخرى', 'error');
  }
}

// ===== ADMIN DASHBOARD =====
async function loadAdminDashboard() {
  loadAdminUsers();
  loadAdminStats();
}

async function loadAdminStats() {
  if (demoMode || !window.db) {
    document.getElementById('totalUsers').textContent = demoUsers.length;
    document.getElementById('totalBookings').textContent = demoBookings.length;
    document.getElementById('pendingBookings').textContent = demoBookings.filter(b => b.status === 'pending').length;
    return;
  }
  try {
    const { collection, getDocs } = getFns();
    const [usersSnap, bookingsSnap] = await Promise.all([
      getDocs(collection(getDB(), 'users')),
      getDocs(collection(getDB(), 'bookings'))
    ]);
    const bookings = bookingsSnap.docs.map(d => d.data());
    document.getElementById('totalUsers').textContent = usersSnap.size;
    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('pendingBookings').textContent = bookings.filter(b => b.status === 'pending').length;
  } catch {}
}

async function loadAdminUsers() {
  const container = document.getElementById('usersList');
  let users = [];

  if (demoMode || !window.db) {
    users = demoUsers;
  } else {
    try {
      const { collection, getDocs } = getFns();
      const snap = await getDocs(collection(getDB(), 'users'));
      users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      container.innerHTML = '<p class="loading">خطأ في التحميل</p>';
      return;
    }
  }

  if (!users.length) {
    container.innerHTML = '<p class="empty-state">لا يوجد زبائن مسجلين بعد</p>';
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>الاسم</th>
          <th>الإيميل</th>
          <th>الهاتف</th>
          <th>تاريخ التسجيل</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(u => `
          <tr>
            <td>${u.name || '-'}</td>
            <td>${u.email || '-'}</td>
            <td>${u.phone || '-'}</td>
            <td>${u.createdAt ? u.createdAt.split('T')[0] : '-'}</td>
            <td>
              <button class="action-btn" onclick="viewUserBookings('${u.uid || u.id}')">المواعيد</button>
              <button class="action-btn danger" onclick="deleteUser('${u.id}')">حذف</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadAdminBookings() {
  const container = document.getElementById('bookingsList');
  let bookings = [];

  if (demoMode || !window.db) {
    bookings = demoBookings;
  } else {
    try {
      const { collection, getDocs } = getFns();
      const snap = await getDocs(collection(getDB(), 'bookings'));
      bookings = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      container.innerHTML = '<p class="loading">خطأ في التحميل</p>';
      return;
    }
  }

  if (!bookings.length) {
    container.innerHTML = '<p class="empty-state">لا يوجد حجوزات بعد</p>';
    return;
  }

  // Sort by date desc
  bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>الاسم</th>
          <th>الهاتف</th>
          <th>السيارة</th>
          <th>الخدمة</th>
          <th>التاريخ</th>
          <th>الوقت</th>
          <th>الحالة</th>
          <th>تغيير الحالة</th>
        </tr>
      </thead>
      <tbody>
        ${bookings.map(b => `
          <tr>
            <td>${b.name || '-'}</td>
            <td>${b.phone || '-'}</td>
            <td>${b.car || '-'}</td>
            <td>${serviceLabels[b.service] || b.service || '-'}</td>
            <td>${b.date || '-'}</td>
            <td>${b.time || '-'}</td>
            <td><span class="status-badge status-${b.status || 'pending'}">${statusLabel(b.status)}</span></td>
            <td>
              <select onchange="updateBookingStatus('${b.id}', this.value)" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:white;border-radius:6px;padding:0.2rem 0.5rem;font-family:Cairo,sans-serif;font-size:0.75rem;cursor:pointer;">
                <option value="pending" ${b.status==='pending'?'selected':''}>انتظار</option>
                <option value="confirmed" ${b.status==='confirmed'?'selected':''}>مؤكد</option>
                <option value="completed" ${b.status==='completed'?'selected':''}>منجز</option>
                <option value="cancelled" ${b.status==='cancelled'?'selected':''}>ملغي</option>
              </select>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function updateBookingStatus(bookingId, status) {
  if (demoMode || !window.db) {
    const b = demoBookings.find(b => b.id === bookingId);
    if (b) b.status = status;
    showToast(`تم تحديث الحالة إلى: ${statusLabel(status)}`);
    loadAdminStats();
    return;
  }
  try {
    const { doc, updateDoc } = getFns();
    await updateDoc(doc(getDB(), 'bookings', bookingId), { status });
    showToast(`تم تحديث الحالة إلى: ${statusLabel(status)}`);
    loadAdminStats();
  } catch {
    showToast('خطأ في التحديث', 'error');
  }
}

async function deleteUser(userId) {
  if (!confirm('هل أنت متأكد من حذف هذا الزبون؟')) return;
  if (demoMode || !window.db) {
    const idx = demoUsers.findIndex(u => u.id === userId);
    if (idx !== -1) demoUsers.splice(idx, 1);
    loadAdminUsers();
    showToast('تم حذف الزبون');
    return;
  }
  try {
    const { doc, deleteDoc } = getFns();
    await deleteDoc(doc(getDB(), 'users', userId));
    loadAdminUsers();
    loadAdminStats();
    showToast('تم حذف الزبون');
  } catch {
    showToast('خطأ في الحذف', 'error');
  }
}

function viewUserBookings(uid) {
  // Switch to bookings tab and filter
  document.querySelectorAll('#adminDashboard .tab-btn')[1].click();
  showToast('جاري عرض مواعيد الزبون...');
}

// ===== DISCOUNTS =====
async function loadDiscounts() {
  const container = document.getElementById('discountsList');
  let discounts = [];

  if (demoMode || !window.db) {
    discounts = demoDiscounts;
  } else {
    try {
      const { collection, getDocs } = getFns();
      const snap = await getDocs(collection(getDB(), 'discounts'));
      discounts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      container.innerHTML = '<p class="loading">خطأ في التحميل</p>';
      return;
    }
  }

  if (!discounts.length) {
    container.innerHTML = '<p class="empty-state">لا يوجد خصومات حالياً</p>';
    return;
  }

  container.innerHTML = discounts.map(d => `
    <div class="discount-card">
      <div>
        <div style="font-weight:700;font-size:1rem;">${d.name}</div>
        <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.2rem;">
          ${d.startDate || ''} → ${d.endDate || ''}
        </div>
      </div>
      <div class="discount-value">${d.value}%</div>
      <button class="action-btn danger" onclick="deleteDiscount('${d.id}')">حذف</button>
    </div>
  `).join('');
}

async function addDiscount() {
  const name = document.getElementById('discountName').value.trim();
  const value = document.getElementById('discountValue').value;
  const startDate = document.getElementById('discountStart').value;
  const endDate = document.getElementById('discountEnd').value;

  if (!name || !value) { showToast('يرجى ملء اسم الخصم والنسبة', 'error'); return; }

  const data = { name, value: parseInt(value), startDate, endDate, createdAt: new Date().toISOString() };

  try {
    if (demoMode || !window.db) {
      demoDiscounts.push({ id: 'd_' + Date.now(), ...data });
    } else {
      const { collection, addDoc } = getFns();
      await addDoc(collection(getDB(), 'discounts'), data);
    }
    showToast(`تم إضافة خصم ${name} بنسبة ${value}% ✅`);
    ['discountName','discountValue','discountStart','discountEnd'].forEach(id => {
      document.getElementById(id).value = '';
    });
    loadDiscounts();
  } catch {
    showToast('خطأ في إضافة الخصم', 'error');
  }
}

async function deleteDiscount(id) {
  if (!confirm('حذف هذا الخصم؟')) return;
  if (demoMode || !window.db) {
    const idx = demoDiscounts.findIndex(d => d.id === id);
    if (idx !== -1) demoDiscounts.splice(idx, 1);
    loadDiscounts();
    return;
  }
  try {
    const { doc, deleteDoc } = getFns();
    await deleteDoc(doc(getDB(), 'discounts', id));
    loadDiscounts();
    showToast('تم حذف الخصم');
  } catch {
    showToast('خطأ في الحذف', 'error');
  }
}

// ===== MESSAGES =====
async function loadMessages() {
  const container = document.getElementById('messagesList');
  let messages = [];

  if (demoMode || !window.db) {
    messages = demoMessages;
  } else {
    try {
      const { collection, getDocs } = getFns();
      const snap = await getDocs(collection(getDB(), 'messages'));
      messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch {
      container.innerHTML = '<p class="loading">خطأ في التحميل</p>';
      return;
    }
  }

  if (!messages.length) {
    container.innerHTML = '<p class="empty-state">لا يوجد رسائل بعد 📩</p>';
    return;
  }

  messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>الاسم</th>
          <th>الهاتف</th>
          <th>الرسالة</th>
          <th>التاريخ</th>
          <th>الإجراء</th>
        </tr>
      </thead>
      <tbody>
        ${messages.map(m => `
          <tr>
            <td>${m.name || '-'}</td>
            <td>${m.phone || '-'}</td>
            <td style="max-width:200px;white-space:normal;">${m.message || '-'}</td>
            <td>${m.createdAt ? m.createdAt.split('T')[0] : '-'}</td>
            <td>
              <a href="https://wa.me/${(m.phone||'').replace(/[^0-9]/g,'')}" target="_blank" class="action-btn">رد</a>
              <button class="action-btn danger" onclick="deleteMessage('${m.id}')">حذف</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function deleteMessage(id) {
  if (!confirm('حذف هذه الرسالة؟')) return;
  if (demoMode || !window.db) {
    const idx = demoMessages.findIndex(m => m.id === id);
    if (idx !== -1) demoMessages.splice(idx, 1);
    loadMessages();
    return;
  }
  try {
    const { doc, deleteDoc } = getFns();
    await deleteDoc(doc(getDB(), 'messages', id));
    loadMessages();
    showToast('تم حذف الرسالة');
  } catch {
    showToast('خطأ في الحذف', 'error');
  }
}

// ===== HELPERS =====
function showErr(el, msg) {
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}

function showSuccessMsg(el, msg, isError = false) {
  el.textContent = msg;
  el.style.background = isError ? 'rgba(255,0,68,0.1)' : 'rgba(0,255,136,0.1)';
  el.style.borderColor = isError ? 'rgba(255,0,68,0.3)' : 'rgba(0,255,136,0.3)';
  el.style.color = isError ? '#ff4444' : '#00FF88';
  el.classList.add('show');
}

function statusLabel(s) {
  return { pending: 'انتظار', confirmed: 'مؤكد', completed: 'منجز', cancelled: 'ملغي' }[s] || 'انتظار';
}

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.glass-card, .service-card, .brand-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ===== HERO OIL CAN SVG =====
(function renderHeroOil() {
  const visual = document.querySelector('.oil-can-3d');
  if (!visual) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 140 200');
  svg.setAttribute('width', '160');
  svg.setAttribute('height', '200');
  svg.style.cssText = 'position:relative;z-index:2;filter:drop-shadow(0 20px 40px rgba(255,215,0,0.4));animation:float 4s ease-in-out infinite;';
  svg.innerHTML = `
    <defs>
      <linearGradient id="hg1" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#1a1a2e"/>
        <stop offset="100%" stop-color="#16213e"/>
      </linearGradient>
      <linearGradient id="hg2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFD700"/>
        <stop offset="100%" stop-color="#FF8C00"/>
      </linearGradient>
    </defs>
    <!-- Can body -->
    <rect x="15" y="30" width="110" height="155" rx="12" fill="url(#hg1)" stroke="rgba(255,215,0,0.3)" stroke-width="1.5"/>
    <!-- Side stripe -->
    <rect x="15" y="30" width="28" height="155" rx="12" fill="rgba(255,215,0,0.08)"/>
    <!-- Top cap -->
    <rect x="20" y="20" width="100" height="18" rx="8" fill="#FFD700" opacity="0.9"/>
    <!-- Spout -->
    <rect x="55" y="8" width="30" height="15" rx="5" fill="#FF8C00"/>
    <!-- Label area -->
    <rect x="50" y="55" width="70" height="100" rx="8" fill="rgba(255,215,0,0.05)" stroke="rgba(255,215,0,0.2)" stroke-width="1"/>
    <!-- Brand text: ZEPRO -->
    <text x="85" y="85" text-anchor="middle" font-family="Orbitron" font-weight="900" font-size="11" fill="#FFD700">ZEPRO</text>
    <text x="85" y="100" text-anchor="middle" font-family="Orbitron" font-weight="700" font-size="9" fill="rgba(255,215,0,0.7)">EURO SPEC</text>
    <!-- Viscosity -->
    <text x="85" y="120" text-anchor="middle" font-family="Orbitron" font-weight="900" font-size="14" fill="white">10W-30</text>
    <!-- Small text -->
    <text x="85" y="138" text-anchor="middle" font-family="Arial" font-size="7" fill="rgba(255,255,255,0.5)">100% Synthetic</text>
    <text x="85" y="150" text-anchor="middle" font-family="Arial" font-size="7" fill="rgba(255,255,255,0.5)">API SP-CF | 4L</text>
    <!-- Side text -->
    <text x="29" y="90" text-anchor="middle" font-family="Arial" font-weight="700" font-size="7" fill="rgba(255,215,0,0.7)" transform="rotate(-90,29,90)">FULLY SYNTHETIC</text>
    <!-- Shine -->
    <rect x="18" y="35" width="6" height="140" rx="3" fill="rgba(255,255,255,0.06)"/>
  `;
  visual.appendChild(svg);
})();
