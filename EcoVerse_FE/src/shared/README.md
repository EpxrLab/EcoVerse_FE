# Shared - Thư mục dùng chung

Chứa tất cả các component, hook, service, utility và constant được sử dụng chung bởi **2 hoặc nhiều roles**.

## 📂 Cấu trúc

- **components/** - Reusable UI components (Header, Footer, Button, Modal, etc.)
- **hooks/** - Custom hooks dùng chung (useFetch, useLocalStorage, etc.)
- **services/** - API services dùng chung
- **utils/** - Utility functions chung
- **constants/** - Global constants
- **styles/** - Global styles & CSS variables

## 📌 Khi nào sử dụng Shared?

✅ Sử dụng khi:
- Component/hook được sử dụng bởi **2 hoặc nhiều roles**
- Là utility chung không liên quan đến bất kỳ role nào

❌ Không sử dụng khi:
- Chỉ dùng bởi **1 role** duy nhất → Lưu vào role-specific folder
- Là auth-related → Lưu vào `features/auth/`

## 💡 Ví dụ

### ✅ Đúng
```
shared/components/Header/         # Dùng bởi student, school, admin
shared/components/Button/         # Dùng bởi tất cả
shared/hooks/useFetch.js         # API hook dùng chung
shared/utils/formatDate.js       # Date formatter chung
```

### ❌ Sai
```
shared/features/StudentDashboard/  # Chỉ student dùng → roles/student/features/
shared/components/AdminPanel/      # Chỉ admin dùng → roles/admin/components/
```
