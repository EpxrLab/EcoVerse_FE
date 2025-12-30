# Custom Hooks

Custom React hooks sử dụng lại logic trong các components.

## Cấu trúc
- `useAuth.js` - Quản lý xác thực
- `useFetch.js` - Xử lý fetch dữ liệu
- `useLocalStorage.js` - Quản lý local storage
- Các hooks custom khác...

## Ví dụ
```javascript
import { useCustomHook } from '@/hooks/useCustomHook';

function Component() {
  const { data } = useCustomHook();
  return <div>{data}</div>;
}
```
