# School Role

Chi tiết các chức năng và components dành riêng cho **Nhà trường (School)**.

## 📂 Cấu trúc

```
school/
├── features/
│   ├── dashboard/                 # Bảng điều khiển nhà trường
│   ├── students-management/       # Quản lý học sinh
│   ├── classes-management/        # Quản lý lớp học
│   ├── courses-management/        # Quản lý khóa học
│   ├── profile/                   # Thông tin nhà trường
│   └── settings/                  # Cài đặt nhà trường
├── components/                    # School-specific components
├── hooks/                         # School-specific hooks
├── pages/                         # Page layouts
├── services/                      # School-specific API services
└── SchoolLayout.jsx               # Main layout component
```

## 🎯 Features

### Dashboard
- Tổng quan về học sinh, lớp, khóa học
- Thống kê tuyên chuyên, hiệu suất
- Biểu đồ theo dõi hoạt động

### Students Management
- Danh sách tất cả học sinh
- Thêm/sửa/xóa học sinh
- Phân công học sinh vào lớp
- Xem chi tiết học sinh

### Classes Management
- Quản lý danh sách lớp học
- Tạo/chỉnh sửa lớp
- Phân công giáo viên
- Xem thành viên lớp

### Courses Management
- Quản lý khóa học
- Tạo khóa học mới
- Chỉnh sửa nội dung khóa học
- Quản lý giáo viên khóa học

### Profile
- Thông tin nhà trường
- Logo, mô tả
- Liên hệ, địa chỉ

### Settings
- Cài đặt hệ thống nhà trường
- Quản lý người dùng (giáo viên)
- Cài đặt quy tắc, chính sách

## 🔧 Services

Tất cả API calls liên quan tới school sẽ được định nghĩa ở `services/`.

Ví dụ:
- `studentsManagement.service.js` - Quản lý học sinh
- `classesManagement.service.js` - Quản lý lớp
- `coursesManagement.service.js` - Quản lý khóa học
- `schoolDashboard.service.js` - Dashboard nhà trường

## 📝 Hướng dẫn

1. Tạo feature mới trong `features/feature-name/`
2. Tạo components trong `features/feature-name/components/`
3. Tạo hooks trong `features/feature-name/hooks/`
4. Tạo services trong `features/feature-name/services/`
5. Sử dụng `SchoolLayout.jsx` làm wrapper cho tất cả school pages
