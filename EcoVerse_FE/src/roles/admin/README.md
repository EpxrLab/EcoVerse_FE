# Admin Role

Chi tiết các chức năng và components dành riêng cho **Quản trị viên (Admin)**.

## 📂 Cấu trúc

```
admin/
├── features/
│   ├── dashboard/                 # Bảng điều khiển hệ thống
│   ├── users-management/          # Quản lý người dùng
│   ├── system-config/             # Cấu hình hệ thống
│   ├── analytics/                 # Thống kê & báo cáo
│   └── settings/                  # Cài đặt admin
├── components/                    # Admin-specific components
├── hooks/                         # Admin-specific hooks
├── pages/                         # Page layouts
├── services/                      # Admin-specific API services
└── AdminLayout.jsx                # Main layout component
```

## 🎯 Features

### Dashboard
- Tổng quan toàn hệ thống
- Số lượng users, schools, students
- Hoạt động gần đây
- Biểu đồ phân tích toàn cầu

### Users Management
- Danh sách tất cả người dùng
- Phân quyền (role, permissions)
- Kích hoạt/vô hiệu hóa tài khoản
- Xem lịch sử hoạt động user
- Quản lý account school/student

### System Config
- Cài đặt ứng dụng toàn cục
- Cấu hình email
- Cấu hình thông báo
- Quản lý quy tắc hệ thống
- Bảo trì, sao lưu dữ liệu

### Analytics
- Báo cáo chi tiết về users
- Thống kê sử dụng tính năng
- Xem dữ liệu học tập
- Biểu đồ, đồ thị toàn hệ thống
- Xuất báo cáo

### Settings
- Cài đặt admin account
- Quản lý API keys
- Bảo mật hệ thống
- Logs & monitoring

## 🔧 Services

Tất cả API calls liên quan tới admin sẽ được định nghĩa ở `services/`.

Ví dụ:
- `usersManagement.service.js` - Quản lý người dùng
- `systemConfig.service.js` - Cấu hình hệ thống
- `analytics.service.js` - Thống kê & báo cáo
- `adminDashboard.service.js` - Dashboard admin

## 📝 Hướng dẫn

1. Tạo feature mới trong `features/feature-name/`
2. Tạo components trong `features/feature-name/components/`
3. Tạo hooks trong `features/feature-name/hooks/`
4. Tạo services trong `features/feature-name/services/`
5. Sử dụng `AdminLayout.jsx` làm wrapper cho tất cả admin pages

## ⚠️ Lưu ý bảo mật

- Luôn kiểm tra quyền trước khi truy cập tính năng admin
- Không lưu sensitive data ở localStorage
- Sử dụng HTTPS cho tất cả API calls
- Log tất cả các thao tác admin
