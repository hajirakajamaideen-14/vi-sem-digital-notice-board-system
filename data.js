const STORAGE_KEY = 'notices';

let notices = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

if (notices.length === 0) {
    notices = [
        {
            id: 1,
            title: 'System Maintenance Scheduled',
            description: 'The system will be undergoing maintenance on Saturday from 2 AM to 6 AM.',
            department: 'IT',
            category: 'Maintenance',
            priority: 'High',
            expiryDate: '2026-04-15',
            createdBy: 'admin@college.edu'
        },
        {
            id: 2,
            title: 'New Employee Orientation',
            description: 'Orientation sessions for new employees will be held on Monday.',
            department: 'HR',
            category: 'Event',
            priority: 'Medium',
            expiryDate: '2026-04-20',
            createdBy: 'admin@college.edu'
        },
        {
            id: 3,
            title: 'Holiday Schedule',
            description: 'Please review the holiday schedule for the upcoming quarter.',
            department: 'Administration',
            category: 'General',
            priority: 'Low',
            expiryDate: '2026-05-01',
            createdBy: 'admin@college.edu'
        }
    ];
    saveNotices(notices);
}

function getNotices() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveNotices(notices) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notices));
}

function addNotice(notice) {
    const notices = getNotices();
    notice.id = Date.now();
    notices.push(notice);
    saveNotices(notices);
    return notice;
}

function deleteNotice(id) {
    const notices = getNotices();
    const filtered = notices.filter(n => n.id !== id);
    saveNotices(filtered);
}

function updateNotice(id, updatedNotice) {
    const notices = getNotices();
    const index = notices.findIndex(n => n.id === id);
    if (index !== -1) {
        notices[index] = { ...notices[index], ...updatedNotice, id };
        saveNotices(notices);
        return notices[index];
    }
    return null;
}

export { getNotices, saveNotices, addNotice, deleteNotice, updateNotice };
