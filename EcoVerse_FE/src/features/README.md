# Features - Chức năng chung

Chứa các chức năng **chung** mà không phụ thuộc vào role cụ thể.

## 📂 Chứa

- **auth/** - Authentication & Authorization
  - login, register, forgot password, reset password, etc.

## 📌 Nguyên tắc

- Features là **tính năng độc lập** không liên quan đến role
- Tất cả roles có thể sử dụng feature này
- Mỗi feature có cấu trúc đầy đủ: components, hooks, services, utils

## ✅ Cấu trúc mỗi feature

```
feature-name/
├── components/
├── hooks/
├── pages/
├── services/
├── utils/
└── index.js (main export)
```

## 💡 Ví dụ

```
features/auth/
├── components/
│   ├── LoginForm.jsx
│   ├── RegisterForm.jsx
│   └── ForgotPasswordForm.jsx
├── hooks/
│   ├── useLogin.js
│   └── useRegister.js
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   └── ForgotPasswordPage.jsx
├── services/
│   └── auth.service.js
└── utils/
    └── validation.js
```
