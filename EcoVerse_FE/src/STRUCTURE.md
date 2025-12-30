# EcoVerse Frontend - Cấu Trúc Dự Án

## 📁 Sơ đồ cấu trúc tổng quát

```
src/
├── shared/                           # 🔄 Dùng chung cho tất cả roles
│   ├── components/                   # Reusable UI components (Header, Footer, Button, etc.)
│   ├── hooks/                        # Custom hooks dùng chung (useFetch, useLocalStorage, etc.)
│   ├── services/                     # API services dùng chung
│   ├── utils/                        # Utility functions chung
│   ├── constants/                    # Global constants
│   └── styles/                       # Global styles & CSS variables
│
├── features/                         # ✨ Chức năng chung (không phụ thuộc vào role)
│   └── auth/
│       ├── components/               # Auth-specific components
│       ├── hooks/                    # Auth-specific hooks
│       ├── pages/                    # Auth pages (Login, Register, ForgotPassword)
│       ├── services/                 # Auth API services
│       └── utils/                    # Auth utilities
│
├── roles/                            # 👥 Tổ chức theo từng role
│   │
│   ├── student/                      # 👨‍🎓 Student Role
│   │   ├── features/
│   │   │   ├── dashboard/            # Student Dashboard
│   │   │   ├── courses/              # Course list, course details
│   │   │   ├── profile/              # Student profile
│   │   │   ├── progress/             # Learning progress tracking
│   │   │   └── settings/             # Student settings
│   │   ├── components/               # Student-specific components
│   │   ├── hooks/                    # Student-specific hooks
│   │   ├── pages/                    # Student page layouts
│   │   ├── services/                 # Student-specific API services
│   │   └── StudentLayout.jsx         # Layout component cho student
│   │
│   ├── school/                       # 🏫 School Role (Nhà trường)
│   │   ├── features/
│   │   │   ├── dashboard/            # School Dashboard
│   │   │   ├── students-management/  # Quản lý học sinh
│   │   │   ├── classes-management/   # Quản lý lớp học
│   │   │   ├── courses-management/   # Quản lý khóa học
│   │   │   ├── profile/              # School profile
│   │   │   └── settings/             # School settings
│   │   ├── components/               # School-specific components
│   │   ├── hooks/                    # School-specific hooks
│   │   ├── pages/                    # School page layouts
│   │   ├── services/                 # School-specific API services
│   │   └── SchoolLayout.jsx          # Layout component cho school
│   │
│   └── admin/                        # 🔑 Admin Role
│       ├── features/
│       │   ├── dashboard/            # Admin Dashboard
│       │   ├── users-management/     # Quản lý người dùng
│       │   ├── system-config/        # Cấu hình hệ thống
│       │   ├── analytics/            # Thống kê, báo cáo
│       │   └── settings/             # Admin settings
│       ├── components/               # Admin-specific components
│       ├── hooks/                    # Admin-specific hooks
│       ├── pages/                    # Admin page layouts
│       ├── services/                 # Admin-specific API services
│       └── AdminLayout.jsx           # Layout component cho admin
│
├── assets/                           # 📦 Hình ảnh, fonts, icons
│   ├── images/
│   ├── fonts/
│   └── icons/
│
├── config/                           # ⚙️ Cấu hình ứng dụng
│   ├── environment.js
│   └── api.config.js
│
├── constants/                        # 🏷️ Hằng số toàn cục
│
├── context/                          # 📊 React Context (Global state)
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
│
├── routes/                           # 🛣️ Routing configuration
│   └── index.jsx
│
├── App.jsx                           # Root component
├── main.jsx                          # Entry point
└── index.css                         # Root styles
```

## 📋 Hướng dẫn sử dụng

### 1. **Shared** - Dùng chung cho tất cả
- Sử dụng khi tính năng này cần được chia sẻ giữa **2 hoặc nhiều roles**
- Ví dụ: Header, Footer, Button, useAuth hook

### 2. **Features** - Chức năng chung (không liên quan role)
- Dành cho chức năng như Authentication, Authorization
- Mặc dù auth có thể được dùng bởi tất cả roles, nhưng nó là một feature độc lập

### 3. **Roles** - Riêng cho từng role
- **Student**: Học sinh sử dụng để xem khóa học, theo dõi tiến độ
- **School**: Nhà trường quản lý học sinh, lớp, khóa học
- **Admin**: Quản trị viên quản lý toàn hệ thống

### 4. Cấu trúc bên trong mỗi feature/role

```
feature-name/
├── components/
│   ├── ComponentName.jsx
│   ├── ComponentName.module.css (optional)
│   └── index.js (export)
├── hooks/
│   ├── useCustomHook.js
│   └── index.js (export)
├── services/
│   ├── api.service.js
│   └── index.js (export)
└── utils/
    ├── helper.js
    └── index.js (export)
```

## 🔀 Routing Strategy

```jsx
// routes/index.jsx sẽ có cấu trúc:
<Routes>
  {/* Public routes - Auth features */}
  <Route path="/auth" element={<AuthRouter />} />
  
  {/* Role-based routes */}
  <Route path="/student/*" element={<StudentRouter />} />
  <Route path="/school/*" element={<SchoolRouter />} />
  <Route path="/admin/*" element={<AdminRouter />} />
</Routes>
```

## 🎯 Best Practices

1. **Import Paths**:
   - Từ shared: `import Button from '@/shared/components/Button'`
   - Từ features: `import LoginForm from '@/features/auth/components/LoginForm'`
   - Từ role: `import Dashboard from '@/roles/student/features/dashboard'`

2. **Component Naming**:
   - PascalCase cho React components: `StudentCard.jsx`
   - camelCase cho hooks: `useStudentData.js`
   - camelCase cho utilities: `formatDate.js`

3. **File Organization**:
   - Một feature = một thư mục
   - Mỗi component = một file riêng
   - Luôn có `index.js` để export

4. **Avoid Circular Dependencies**:
   - shared không import từ features hoặc roles
   - features có thể import từ shared nhưng không từ roles
   - roles có thể import từ shared và features

## 📝 Ví dụ thực tế

### Student Dashboard
```
roles/student/features/dashboard/
├── Dashboard.jsx
├── Dashboard.module.css
├── components/
│   ├── StatsCard.jsx
│   ├── RecentCourses.jsx
│   └── ProgressChart.jsx
├── hooks/
│   └── useDashboardData.js
└── services/
    └── dashboard.service.js
```

### School Students Management
```
roles/school/features/students-management/
├── StudentsList.jsx
├── components/
│   ├── StudentTable.jsx
│   ├── AddStudentForm.jsx
│   └── StudentDetailModal.jsx
├── hooks/
│   └── useStudentManagement.js
└── services/
    └── studentManagement.service.js
```

## 🚀 Để bắt đầu

1. Tạo component/hook/service mới trong thư mục phù hợp
2. Export nó qua `index.js`
3. Import và sử dụng trong các component khác
4. Tuân theo naming convention và structure

---

**Last Updated**: 2025-12-30
