import { getNotices, addNotice, updateNotice, deleteNotice } from './data.js';

let notices = [];
let editId = null;

function init() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        window.location.href = '../index.html';
        return;
    }
    notices = getNotices();
    setupEventListeners();
    renderRecent();
}

function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('noticeModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 14px 24px;
        background: ${type === 'success' ? '#4caf8a' : '#e8486a'};
        color: #fff;
        border-radius: 10px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function renderTableHTML(data, animate = false) {
    if (!data.length) return '<p style="text-align:center;padding:40px;color:var(--muted)">No notices available.</p>';
    const deptClass = { CSE: 'dept-cse', ECE: 'dept-ece', Mechanical: 'dept-mech', General: 'dept-gen' };
    const dotClass = { High: 'dot-high', Medium: 'dot-med', Low: 'dot-low' };
    return `<table class="${animate ? 'fade-in' : ''}">
        <thead><tr>
            <th>Title</th><th>Department</th><th>Category</th><th>Priority</th><th>Expiry</th><th>Status</th><th>Actions</th>
        </tr></thead>
        <tbody>
            ${data.map((n) => `<tr>
                <td style="font-weight:500;max-width:220px">${n.title}</td>
                <td><span class="dept-tag ${deptClass[n.department] || 'dept-gen'}">${n.department}</span></td>
                <td style="color:var(--muted)">${n.category}</td>
                <td><span class="priority-dot ${dotClass[n.priority]}"></span>${n.priority}</td>
                <td style="color:var(--muted)">${n.expiryDate}</td>
                <td><span class="status-badge ${isExpired(n.expiryDate) ? 'status-exp' : 'status-active'}">${isExpired(n.expiryDate) ? 'Expired' : 'Active'}</span></td>
                <td><div class="actions">
                    <button class="btn btn-ghost btn-sm" onclick="handleEdit(${n.id})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="handleDelete(${n.id})">🗑️</button>
                </div></td>
            </tr>`).join('')}
        </tbody>
    </table>`;
}

function isExpired(expiryDate) {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
}

function renderTable(animate = false) {
    notices = getNotices();
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const dept = document.getElementById('deptFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';
    
    const filtered = notices.filter(n => {
        const matchesSearch = !search || n.title.toLowerCase().includes(search) || n.department.toLowerCase().includes(search);
        const matchesDept = !dept || n.department === dept;
        const expired = isExpired(n.expiryDate);
        const matchesStatus = !status || (status === 'Active' && !expired) || (status === 'Expired' && expired);
        return matchesSearch && matchesDept && matchesStatus;
    });
    
    const el = document.getElementById('allNoticesTable');
    if (el) el.innerHTML = renderTableHTML(filtered, animate);
}

function renderRecent() {
    notices = getNotices();
    const el = document.getElementById('recentNoticesTable');
    if (el) el.innerHTML = renderTableHTML(notices.slice(0, 5));
    document.getElementById('totalNotices').textContent = notices.length;
    document.getElementById('activeNotices').textContent = notices.filter(n => !isExpired(n.expiryDate)).length;
}

function showSection(name) {
    ['dashboard', 'notices', 'departments', 'users', 'settings'].forEach(s => {
        document.getElementById('section-' + s).style.display = s === name ? '' : 'none';
    });
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.currentTarget.classList.add('active');
    const titles = { dashboard: 'Admin Dashboard', notices: 'Manage Notices', departments: 'Departments', users: 'User Management', settings: 'Settings' };
    const subs = { dashboard: 'Overview of the notice board system', notices: 'Add, edit, or delete notices', departments: 'Manage department configurations', users: 'Manage admin and faculty accounts', settings: 'System configuration' };
    document.getElementById('pageTitle').textContent = titles[name];
    document.getElementById('pageSubtitle').textContent = subs[name];
    if (name === 'notices') renderTable();
}

function openAddNotice() {
    editId = null;
    document.getElementById('modalTitle').textContent = 'Add New Notice';
    document.getElementById('noticeTitle').value = '';
    document.getElementById('noticeContent').value = '';
    document.getElementById('noticeDept').value = 'General';
    document.getElementById('noticeCat').value = 'Academic';
    document.getElementById('noticePriority').value = 'Medium';
    document.getElementById('noticeExpiry').value = '';
    document.getElementById('noticeModal').classList.add('show');
}

function handleEdit(id) {
    editId = id;
    const notice = notices.find(n => n.id === id);
    if (!notice) return;
    document.getElementById('modalTitle').textContent = 'Edit Notice';
    document.getElementById('noticeTitle').value = notice.title || '';
    document.getElementById('noticeContent').value = notice.description || '';
    document.getElementById('noticeDept').value = notice.department || 'General';
    document.getElementById('noticeCat').value = notice.category || 'Academic';
    document.getElementById('noticePriority').value = notice.priority || 'Medium';
    document.getElementById('noticeExpiry').value = notice.expiryDate || '';
    document.getElementById('noticeModal').classList.add('show');
}

function handleDelete(id) {
    if (confirm('Are you sure you want to delete this notice?')) {
        deleteNotice(id);
        showToast('Notice Deleted');
        renderTable(true);
        renderRecent();
    }
}

function saveNotice() {
    const title = document.getElementById('noticeTitle').value.trim();
    if (!title) { showToast('Title is required', 'error'); return; }
    
    const notice = {
        title,
        description: document.getElementById('noticeContent').value,
        department: document.getElementById('noticeDept').value,
        category: document.getElementById('noticeCat').value,
        priority: document.getElementById('noticePriority').value,
        expiryDate: document.getElementById('noticeExpiry').value
    };

    if (editId !== null) {
        updateNotice(editId, notice);
        showToast('Notice Updated');
    } else {
        addNotice(notice);
        showToast('Notice Added');
    }
    
    closeModal();
    renderTable(true);
    renderRecent();
}

function closeModal() {
    document.getElementById('noticeModal').classList.remove('show');
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../index.html';
}

window.showSection = showSection;
window.openAddNotice = openAddNotice;
window.handleEdit = handleEdit;
window.handleDelete = handleDelete;
window.saveNotice = saveNotice;
window.closeModal = closeModal;

document.addEventListener('DOMContentLoaded', init);
