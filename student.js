import { getNotices } from './data.js';

let deptFilter = '';

function init() {
    renderNotices();
}

function showToast(message) {
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
        background: #4fc3f7;
        color: #000;
        border-radius: 10px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function isExpired(expiryDate) {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
}

function getPriorityWeight(priority) {
    const weights = { High: 1, Medium: 2, Low: 3 };
    return weights[priority] || 4;
}

function getFilteredAndSortedNotices() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const cat = document.getElementById('catFilter')?.value || '';

    const allNotices = getNotices();
    
    const activeNotices = allNotices.filter(n => !isExpired(n.expiryDate));
    
    const filtered = activeNotices.filter(n => {
        const matchesSearch = !search || 
            n.title.toLowerCase().includes(search) || 
            (n.description && n.description.toLowerCase().includes(search)) ||
            (n.department && n.department.toLowerCase().includes(search));
        const matchesDept = !deptFilter || n.department === deptFilter;
        const matchesCat = !cat || n.category === cat;
        return matchesSearch && matchesDept && matchesCat;
    });
    
    filtered.sort((a, b) => getPriorityWeight(a.priority) - getPriorityWeight(b.priority));
    
    return filtered;
}

function renderNotices(animate = false) {
    const notices = getFilteredAndSortedNotices();
    
    document.getElementById('resultCount').textContent = `${notices.length} notice${notices.length !== 1 ? 's' : ''}`;

    const grid = document.getElementById('noticesGrid');
    if (!notices.length) {
        grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="e-icon">📭</div><div>No notices available.</div></div>';
    } else {
        const deptTagClass = { CSE: 'tag-cse', ECE: 'tag-ece', Mechanical: 'tag-mech', General: 'tag-gen', IT: 'tag-cse', HR: 'tag-ece', Administration: 'tag-gen' };
        const catTagClass = { Exam: 'tag-exam', Event: 'tag-event', Academic: 'tag-academic', Urgent: 'tag-urgent', Holiday: 'tag-gen', Maintenance: 'tag-gen', General: 'tag-gen' };
        const priorityClass = { High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low' };
        const animClass = animate ? 'fade-in' : '';

        grid.innerHTML = notices.map(n => `
            <div class="notice-card ${(n.priority || 'Low').toLowerCase()} ${animClass}" onclick="openDetail(${n.id})">
                <div class="nc-tags">
                    <span class="tag ${deptTagClass[n.department] || 'tag-gen'}">${n.department || 'General'}</span>
                    <span class="tag ${catTagClass[n.category] || 'tag-gen'}">${n.category || 'General'}</span>
                </div>
                <div class="nc-title">${n.title}</div>
                <div class="nc-content">${n.description || 'No description available.'}</div>
                <div class="nc-footer">
                    <div class="nc-date">📅 Expires ${n.expiryDate || 'N/A'}</div>
                    <div class="nc-priority ${priorityClass[n.priority] || 'priority-low'}">${n.priority || 'Low'} Priority</div>
                </div>
            </div>
        `).join('');
    }

    renderUrgentBanner(notices);
}

function renderUrgentBanner(notices) {
    const urgentNotices = notices.filter(n => n.priority === 'High' || n.category === 'Urgent');
    const banner = document.getElementById('urgentBanner');
    const list = document.getElementById('urgentList');
    
    if (urgentNotices.length) {
        banner.style.display = 'flex';
        list.innerHTML = urgentNotices.map(n => 
            `<span class="urgent-item" onclick="openDetail(${n.id})">${n.title}</span>`
        ).join(' · ');
    } else {
        banner.style.display = 'none';
    }
}

function setDept(dept, el) {
    deptFilter = dept;
    document.querySelectorAll('.filter-chip.dept').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    renderNotices();
}

function openDetail(id) {
    const allNotices = getNotices();
    const n = allNotices.find(notice => notice.id === id);
    
    if (!n) return;

    const deptTagClass = { CSE: 'tag-cse', ECE: 'tag-ece', Mechanical: 'tag-mech', General: 'tag-gen', IT: 'tag-cse', HR: 'tag-ece', Administration: 'tag-gen' };
    const catTagClass = { Exam: 'tag-exam', Event: 'tag-event', Academic: 'tag-academic', Urgent: 'tag-urgent', Holiday: 'tag-gen', Maintenance: 'tag-gen', General: 'tag-gen' };

    document.getElementById('dTags').innerHTML = `
        <span class="tag ${deptTagClass[n.department] || 'tag-gen'}">${n.department || 'General'}</span>
        <span class="tag ${catTagClass[n.category] || 'tag-gen'}">${n.category || 'General'}</span>
        <span class="tag" style="background:rgba(255,255,255,0.06);color:var(--muted)">${n.priority || 'Low'} Priority</span>
    `;
    document.getElementById('dTitle').textContent = n.title;
    document.getElementById('dMeta').textContent = `Posted by ${n.createdBy || 'Admin'} · ${n.expiryDate ? 'Expires ' + n.expiryDate : 'No expiry'}`;
    document.getElementById('dContent').textContent = n.description || 'No description available.';
    document.getElementById('dExpiry').innerHTML = `⏰ <strong>Expiry Date:</strong> ${n.expiryDate || 'No expiry date set'}`;
    document.getElementById('detailModal').classList.add('show');
}

function closeDetail() {
    document.getElementById('detailModal').classList.remove('show');
}

window.setDept = setDept;
window.openDetail = openDetail;
window.closeDetail = closeDetail;
window.renderNotices = renderNotices;

document.addEventListener('DOMContentLoaded', init);
