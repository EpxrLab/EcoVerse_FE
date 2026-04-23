# Roles - Tổ chức theo vai trò

Chứa tất cả các component, hook, service dành riêng cho từng **role** cụ thể.

## 👥 Các Role

### 👨‍🎓 **Student** - Học sinh
- **features/dashboard** - Bảng điều khiển học sinh
- **features/courses** - Xem và quản lý khóa học
- **features/profile** - Hồ sơ cá nhân học sinh
- **features/progress** - Theo dõi tiến độ học tập
- **features/settings** - Cài đặt tài khoản

### 🏫 **School** - Nhà trường
- **features/dashboard** - Bảng điều khiển nhà trường
- **features/students-management** - Quản lý học sinh
- **features/classes-management** - Quản lý lớp học
- **features/courses-management** - Quản lý khóa học
- **features/profile** - Thông tin nhà trường
- **features/settings** - Cài đặt nhà trường

### 🔑 **Admin** - Quản trị viên
- **features/dashboard** - Bảng điều khiển hệ thống
- **features/users-management** - Quản lý người dùng
- **features/system-config** - Cấu hình hệ thống
- **features/analytics** - Thống kê & báo cáo
- **features/settings** - Cài đặt admin

## 📂 Cấu trúc mỗi role

```
role-name/
├── features/
│   ├── feature-1/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── feature-2/
├── components/           # Role-specific shared components
├── hooks/                # Role-specific shared hooks
├── pages/                # Page layouts
├── services/             # Role-specific shared services
└── RoleLayout.jsx        # Main layout component
```

## 📌 Nguyên tắc

✅ Sử dụng khi:
- Component/hook/service chỉ dùng bởi **1 role cụ thể**
- Là tính năng đặc thù của role đó

❌ Không sử dụng khi:
- Được dùng bởi **2+ roles** → `shared/`
- Là chức năng chung (auth) → `features/`

## 💡 Ví dụ Import

```jsx
// Student importing its own components
import Dashboard from '@/roles/student/features/dashboard'
import StudentCard from '@/roles/student/components/StudentCard'

// Importing shared components
import Button from '@/shared/components/Button'

// Importing auth
import LoginForm from '@/features/auth/components/LoginForm'
```

## ⚠️ Lưu ý quan trọng

- **Không import giữa các roles** (student không import từ school/admin)
- Mỗi role là **tự đủ** để hoạt động
- Nếu cần code chung giữa roles → di chuyển vào `shared/`
