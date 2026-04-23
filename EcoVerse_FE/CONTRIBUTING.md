# Contributing Guidelines

## Cài đặt Development Environment

### Yêu cầu
- Node.js >= 16.0.0
- npm >= 8.0.0 hoặc yarn >= 3.0.0

### Các bước cài đặt
```bash
# Clone repository
git clone <repository-url>

# Cài đặt dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Chạy development server
npm run dev
```

## Quy ước Code

### Naming Convention
- Components: `PascalCase` (VD: `UserCard.jsx`)
- Functions/variables: `camelCase` (VD: `getUserData()`)
- Constants: `UPPER_SNAKE_CASE` (VD: `API_BASE_URL`)
- CSS classes: `kebab-case` (VD: `.user-card`)

### Git Workflow
1. Tạo branch từ `develop`: `git checkout -b feature/feature-name`
2. Commit theo convention: `git commit -m "feat: description"` 
3. Push branch: `git push origin feature/feature-name`
4. Tạo Pull Request

### Commit Message Format
```
type(scope): subject

body

footer
```

**Types:**
- `feat:` Tính năng mới
- `fix:` Sửa lỗi
- `docs:` Tài liệu
- `style:` Formatting code
- `refactor:` Refactor code
- `test:` Thêm tests
- `chore:` Build, dependencies

### Linting và Formatting
```bash
npm run lint        # Check linting
npm run lint:fix    # Fix linting issues
npm run format      # Format code
```

### Testing
```bash
npm run test           # Chạy tests
npm run test:coverage  # Check coverage
```

## Code Review Process

1. Tất cả PRs phải được review trước khi merge
2. PRs phải pass CI/CD checks
3. Độ cover của tests phải >= 80%

## Cấu trúc Project

Tham khảo [Project Structure](./docs/PROJECT_STRUCTURE.md) để hiểu rõ cấu trúc thư mục.

## Câu hỏi hoặc Vấn đề?

Mở issue trên GitHub hoặc liên hệ với team.
