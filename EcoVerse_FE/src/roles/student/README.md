# Student Role

Chi tiết các chức năng và components dành riêng cho **Học sinh (Student)**.

## 📂 Cấu trúc

```
student/
├── features/
│   ├── dashboard/              # Bảng điều khiển
│   ├── courses/                # Danh sách khóa học & chi tiết
│   ├── profile/                # Hồ sơ cá nhân
│   ├── progress/               # Theo dõi tiến độ
│   └── settings/               # Cài đặt tài khoản
├── components/                 # Student-specific components
├── hooks/                      # Student-specific hooks
├── pages/                      # Page layouts
├── services/                   # Student-specific API services
└── StudentLayout.jsx           # Main layout component
```

## 🎯 Features

### Dashboard
- Hiển thị tổng quan khóa học đang học
- Thống kê bài tập, bài kiểm tra
- Quick links tới các chức năng chính

### Courses
- Danh sách tất cả khóa học
- Chi tiết khóa học (bài học, tài liệu, video)
- Đăng ký khóa học

### Profile
- Xem & chỉnh sửa thông tin cá nhân
- Quản lý avatar
- Lịch sử học tập

### Progress
- Theo dõi tiến độ học tập
- Xem điểm số
- Xem báo cáo chi tiết

### Settings
- Đổi mật khẩu
- Quản lý thông báo
- Cài đặt riêng tư

## 🔧 Services

Tất cả API calls liên quan tới student sẽ được định nghĩa ở `services/`.

Ví dụ:
- `studentDashboard.service.js` - API cho dashboard
- `courses.service.js` - API cho khóa học
- `profile.service.js` - API cho hồ sơ

## 📝 Hướng dẫn

1. Tạo feature mới trong `features/feature-name/`
2. Tạo components trong `features/feature-name/components/`
3. Tạo hooks trong `features/feature-name/hooks/`
4. Tạo services trong `features/feature-name/services/` (nếu cần API calls)
5. Sử dụng `StudentLayout.jsx` làm wrapper cho tất cả student pages
