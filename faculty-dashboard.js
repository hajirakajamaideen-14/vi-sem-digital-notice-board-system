import { getNotices, addNotice, updateNotice, deleteNotice } from './data.js';

let faculty = null;
let myNotices = [];

function init() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || user.role !== 'faculty') {
        window.location.href = '../index.html';
        return;
    }
    faculty = user;
    loadMyNotices();
    setupEventListeners();
    renderMyNotices();
}

function loadMyNotices() {
    const allNotices = getNotices();
    myNotices = allNotices.filter(n => n.createdBy === faculty.email);
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
        background: ${type === 'success' ? '#f5a623' : '#e8486a'};
        color: ${type === 'success' ? '#000' : '#fff'};
        border-radius: 10px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('postModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
}

function isExpired(expiryDate) {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
}

function renderMyNotices(animate = false) {
    loadMyNotices();
    const el = document.getElementById('myNoticeCards');
    document.getElementById('myTotal').textContent = myNotices.length;
    document.getElementById('myActive').textContent = myNotices.filter(n => !isExpired(n.expiryDate)).length;
    
    if (myNotices.length === 0) {
        el.innerHTML = '<p style="text-align:center;padding:60px;color:var(--muted)">No notices available. Click "Post Notice" to create one.</p>';
        return;
    }

    const catColors = { Academic: 'tag-gold', Event: 'tag-blue', Exam: 'tag-red', Announcement: 'tag-gray', Maintenance: 'tag-gray', Holiday: 'tag-green', Urgent: 'tag-red' };
    const statusColors = { Active: 'tag-green', Expired: 'tag-gray' };
    const animClass = animate ? 'fade-in' : '';

    el.innerHTML = myNotices.map((n) => {
        const expired = isExpired(n.expiryDate);
        const status = expired ? 'Expired' : 'Active';
        return `
            <div class="notice-card ${animClass}">
                <div class="nc-top">
                    <div class="nc-title">${n.title}</div>
                </div>
                <div class="nc-meta">
                    <span class="tag ${catColors[n.category] || 'tag-gray'}">${n.category}</span>
                    <span class="tag tag-blue">${n.department}</span>
                    <span class="tag ${statusColors[status]}">${status}</span>
                </div>
                <div class="nc-content">${n.description || 'No description'}</div>
                <div class="nc-footer">
                    <div class="nc-date">Expires: ${n.expiryDate || 'No expiry'}</div>
                    <div class="nc-actions">
                        <button class="btn btn-ghost btn-sm" onclick="handleEdit(${n.id})">✏️ Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="handleDelete(${n.id})">🗑️ Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

let editId = null;

function handleEdit(id) {
    editId = id;
    const notice = myNotices.find(n => n.id === id);
    if (!notice) return;
    document.getElementById('modalTitle').textContent = 'Edit Notice';
    document.getElementById('mTitle').value = notice.title || '';
    document.getElementById('mContent').value = notice.description || '';
    document.getElementById('mCat').value = notice.category || 'Academic';
    document.getElementById('mDept').value = notice.department || 'General';
    document.getElementById('mPriority').value = notice.priority || 'Medium';
    document.getElementById('mExpiry').value = notice.expiryDate || '';
    document.getElementById('postModal').classList.add('show');
}

function handleDelete(id) {
    const notice = myNotices.find(n => n.id === id);
    if (!notice) return;
    if (confirm('Are you sure you want to delete this notice?')) {
        deleteNotice(id);
        showToast('Notice Deleted');
        renderMyNotices(true);
    }
}

function openPostModal() {
    editId = null;
    document.getElementById('modalTitle').textContent = 'Post Notice';
    document.getElementById('mTitle').value = '';
    document.getElementById('mContent').value = '';
    document.getElementById('mCat').value = 'Academic';
    document.getElementById('mDept').value = 'General';
    document.getElementById('mPriority').value = 'Medium';
    document.getElementById('mExpiry').value = '';
    document.getElementById('postModal').classList.add('show');
}

function closeModal() {
    document.getElementById('postModal').classList.remove('show');
}

function saveModal() {
    const title = document.getElementById('mTitle').value.trim();
    if (!title) { showToast('Title is required', 'error'); return; }
    
    const notice = {
        title,
        description: document.getElementById('mContent').value,
        department: document.getElementById('mDept').value,
        category: document.getElementById('mCat').value,
        priority: document.getElementById('mPriority').value,
        expiryDate: document.getElementById('mExpiry').value,
        createdBy: faculty.email
    };

    if (editId !== null) {
        updateNotice(editId, notice);
        showToast('Notice Updated');
    } else {
        addNotice(notice);
        showToast('Notice Added');
    }
    
    closeModal();
    renderMyNotices(true);
}

function postNotice() {
    const title = document.getElementById('pTitle').value.trim();
    if (!title) { showToast('Title is required', 'error'); return; }
    
    const notice = {
        title,
        description: document.getElementById('pContent').value,
        department: 'General',
        category: document.getElementById('pCat').value,
        priority: 'Medium',
        expiryDate: document.getElementById('pExpiry').value,
        createdBy: faculty.email
    };
    
    addNotice(notice);
    showToast('Notice Added');
    document.getElementById('pTitle').value = '';
    document.getElementById('pContent').value = '';
    document.getElementById('pExpiry').value = '';
    showSection('my-notices');
    renderMyNotices(true);
}

function showSection(name, el) {
    ['my-notices', 'post', 'profile'].forEach(s => {
        document.getElementById('section-' + s).style.display = s === name ? '' : 'none';
    });
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if (el) el.classList.add('active');
}

function logout() {
    sessionStorage.clear();
    window.location.href = '../index.html';
}

window.showSection = showSection;
window.handleEdit = handleEdit;
window.handleDelete = handleDelete;
window.openPostModal = openPostModal;
window.closeModal = closeModal;
window.saveModal = saveModal;
window.postNotice = postNotice;

document.addEventListener('DOMContentLoaded', init);
