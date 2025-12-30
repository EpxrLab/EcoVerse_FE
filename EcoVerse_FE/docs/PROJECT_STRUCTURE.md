# Project Structure

Cấu trúc file và folder của EcoVerse Frontend.

## Sơ đồ cấu trúc

```
EcoVerse_FE/
├── src/
│   ├── assets/                 # Hình ảnh, fonts, icons
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   ├── components/             # Reusable UI components
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── ...
│   ├── config/                 # Cấu hình ứng dụng
│   │   ├── environment.js
│   │   └── api.config.js
│   ├── constants/              # Hằng số và config tĩnh
│   │   ├── api.constants.js
│   │   └── app.constants.js
│   ├── context/                # React Context (Global state)
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useFetch.js
│   ├── pages/                  # Page components (Route components)
│   │   ├── Home/
│   │   ├── About/
│   │   └── ...
│   ├── routes/                 # Routing configuration
│   │   └── index.jsx
│   ├── services/               # API services
│   │   ├── apiServices.js
│   │   ├── authService.js
│   │   └── ...
│   ├── styles/                 # Global styles
│   │   ├── globals.css
│   │   └── variables.css
│   ├── utils/                  # Utility functions
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── App.jsx                 # Root component
│   ├── index.css               # Root styles
│   └── main.jsx                # Entry point
├── public/                     # Static files
│   └── favicon.ico
├── .github/                    # GitHub config
│   └── workflows/              # CI/CD workflows
├── .env.example                # Environment variables template
├── .gitignore
├── eslint.config.js
├── tailwind.config.js
├── vite.config.js
├── package.json
├── CONTRIBUTING.md             # Contributing guidelines
├── README.md                   # Project README
└── LICENSE
```

## Mô tả các thư mục chính

### `/src/assets`
Tất cả các static assets như hình ảnh, fonts, icons.

### `/src/components`
Reusable UI components. Mỗi component nên có:
- `ComponentName.jsx` - Component chính
- `ComponentName.module.css` - Styles (optional)
- `index.js` - Export component

### `/src/config`
Cấu hình ứng dụng, environment variables, API configuration.

### `/src/constants`
Các hằng số, API endpoints, validation rules.

### `/src/context`
React Context API để quản lý global state (authentication, theme, etc).

### `/src/hooks`
Custom React hooks để tái sử dụng logic.

### `/src/pages`
Page components được dùng trong routing. Mỗi page thường include multiple components.

### `/src/routes`
Routing configuration, route guards, route definitions.

### `/src/services`
API service functions để gọi backend endpoints.

### `/src/styles`
Global styles, CSS variables, animations.

### `/src/types`
TypeScript types và interfaces (nếu sử dụng TypeScript).

### `/src/utils`
Helper functions, formatters, validators, utilities.

### `/tests`
Test files - unit tests, integration tests.

### `/public`
Static files được serve directly (favicon, manifest, etc).

## Component Structure Example

```
src/components/UserCard/
├── UserCard.jsx          # Component file
├── UserCard.module.css   # Component styles
├── useUserCard.js        # Custom hook (if needed)
└── index.js              # Export file
```

```javascript
// index.js
export { default } from './UserCard';
```

## Best Practices

1. **Keep components small and focused** - Một component nên làm một việc
2. **Use custom hooks for logic reuse** - Tái sử dụng logic qua custom hooks
3. **Centralize API calls** - Tất cả API calls nên qua services
4. **Use constants** - Không hard-code values
5. **Structure by feature** - Grouping components by feature (optional, advanced)
6. **Test coverage** - Write tests cho components, functions, services

## Naming Conventions

- **Components**: `PascalCase` (VD: `UserCard.jsx`)
- **Files**: `camelCase` hoặc `PascalCase` (follow convention)
- **Folders**: `kebab-case` hoặc `camelCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **CSS Classes**: `kebab-case`
