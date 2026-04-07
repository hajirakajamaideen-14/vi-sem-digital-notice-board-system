# EduBoard — Digital Notice Board System

A complete frontend web design for a college Digital Notice Board System.

## 📁 File Structure
```
notice-board/
├── index.html              → Landing page (role selection)
├── pages/
│   ├── admin-login.html    → Admin login
│   ├── admin-dashboard.html→ Admin panel (manage all notices)
│   ├── faculty-login.html  → Faculty login
│   ├── faculty-dashboard.html → Faculty panel (post & manage notices)
│   └── student.html        → Student notice board (view, filter, search)
└── README.md
```

## 🚀 How to Open
Simply open `index.html` in any modern browser (Chrome, Edge, Firefox).
No server or installation required — it's fully static HTML/CSS/JS.

## 🔐 Demo Credentials
- **Admin:** admin@college.edu / admin123
- **Faculty:** faculty@college.edu / faculty123
- **Student:** No login required — open pages/student.html directly

## 📋 Features Implemented

### Admin Module
- ✅ Secure login with credential validation
- ✅ Dashboard with stats (total notices, active, departments, faculty)
- ✅ Add, edit, delete notices with full modal form
- ✅ Assign notices to departments (CSE, ECE, Mechanical, General)
- ✅ Set expiry dates on notices
- ✅ Filter notices by department and status
- ✅ Search notices by keyword
- ✅ Department overview panel
- ✅ Sidebar navigation with role indicator

### Faculty Module
- ✅ Secure login (separate from admin)
- ✅ Post new notices with category and expiry
- ✅ Edit or delete own notices
- ✅ View stats for personal notices
- ✅ Faculty profile page
- ✅ Department-specific notice management

### Student Module
- ✅ View all active notices (no login required)
- ✅ Live search by title, content, or department
- ✅ Filter by department (All / CSE / ECE / Mechanical / General)
- ✅ Filter by category (Academic / Event / Exam / Urgent / Holiday)
- ✅ Urgent notice banner at top
- ✅ Click any notice to view full details in modal
- ✅ Priority indicators (High / Medium / Low) with color coding
- ✅ Mobile-responsive layout

## 🎨 Design
- Dark theme with gold/red/blue accent colors
- Syne + DM Sans typography
- Glassmorphism-style elements
- Fully mobile-responsive
- Smooth animations and micro-interactions

## 🛠 Tech Stack (Frontend)
- HTML5, CSS3, Vanilla JavaScript
- Google Fonts (Syne, DM Sans)
- No external JS frameworks — pure browser-native

## 🔧 Backend Integration Notes
To connect to a real backend, replace:
- `handleLogin()` functions → fetch() calls to your auth API
- `notices` arrays → fetch() calls to your database API
- `sessionStorage` → proper JWT/session management
