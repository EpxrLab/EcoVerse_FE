# Context

React Context API để quản lý global state.

## Cấu trúc
- `AuthContext.jsx` - Context xác thực
- `ThemeContext.jsx` - Context theme
- Các context khác...

## Ví dụ
```javascript
import { useAuth } from '@/context/AuthContext';

function Component() {
  const { user } = useAuth();
  return <div>{user?.name}</div>;
}
```
