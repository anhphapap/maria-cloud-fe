# 🚀 Hướng dẫn Setup API với Spring Boot Backend

## 📋 Cấu trúc thư mục

```
src/
├── config/
│   └── api.config.js       # Cấu hình API endpoints và base URL
├── lib/
│   └── axios.js            # Axios instance với interceptors
├── services/
│   ├── auth.service.js     # Auth API calls
│   ├── project.service.js  # Projects API calls
│   ├── database.service.js # Databases API calls
│   ├── backup.service.js   # Backups API calls
│   └── index.js            # Export tất cả services
└── hooks/
    ├── useApi.js           # Generic API hook
    ├── useAuth.js          # Authentication hook
    ├── useProjects.js      # Projects hook
    ├── useDatabases.js     # Databases hook
    └── index.js            # Export tất cả hooks
```

## ⚙️ Cấu hình

### 1. Thay đổi API Base URL

Mở file `src/config/api.config.js` và cập nhật:

```javascript
export const API_CONFIG = {
  baseURL: 'http://localhost:8080/api', // Thay đổi port nếu cần
  timeout: 30000,
  // ...
}
```

### 2. Cấu hình CORS trên Spring Boot

Thêm CORS configuration trong Spring Boot:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5175")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## 📝 Ví dụ sử dụng

### 1. Sử dụng trong Component với Hook

#### Login Component

```jsx
import { useAuth } from '../hooks'

function LoginPage() {
  const { login, loading, error } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {error && <p className="text-red-500">{error}</p>}
      <button disabled={loading}>
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  )
}
```

#### Dashboard Component

```jsx
import { useProjects, useDatabases } from '../hooks'

function Dashboard() {
  const { projects, loading, error } = useProjects()
  const { databases, stats } = useDatabases()

  if (loading) return <div>Đang tải...</div>
  if (error) return <div>Lỗi: {error}</div>

  return (
    <div>
      <h2>Projects ({projects.length})</h2>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  )
}
```

### 2. Sử dụng trực tiếp Service

```jsx
import { projectService, databaseService } from '../services'

// Trong component hoặc function
const handleCreateProject = async () => {
  try {
    const newProject = await projectService.create({
      name: 'My Project',
      type: 'PostgreSQL'
    })
    console.log('Created:', newProject)
  } catch (error) {
    console.error('Error:', error)
  }
}
```

### 3. Sử dụng Generic useApi Hook

```jsx
import { useApi } from '../hooks'
import { projectService } from '../services'

function MyComponent() {
  const { data, loading, error, execute } = useApi(
    () => projectService.getAll(),
    [], // dependencies
    true // immediate call
  )

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={execute}>Refresh</button>
    </div>
  )
}
```

## 🔐 Authentication Flow

1. User đăng nhập → `authService.login()` được gọi
2. Backend trả về `accessToken` và `refreshToken`
3. Tokens được lưu vào `localStorage`
4. Mọi request tiếp theo tự động thêm `Authorization: Bearer {token}` header
5. Nếu token hết hạn (401), tự động gọi refresh token API
6. Nếu refresh thất bại, redirect về trang login

## 📡 API Endpoints

Đã cấu hình sẵn các endpoints trong `src/config/api.config.js`:

- **Auth**: `/auth/login`, `/auth/register`, `/auth/logout`
- **Projects**: `/projects`, `/projects/:id`
- **Databases**: `/databases`, `/databases/:id`, `/databases/stats`
- **Backups**: `/backups`, `/backups/:id`, `/backups/:id/restore`
- **Logs**: `/logs`, `/logs/:id`

## 🛠️ Thêm Endpoint mới

### 1. Thêm vào config

```javascript
// src/config/api.config.js
export const API_ENDPOINTS = {
  // ... existing endpoints
  USERS: {
    LIST: '/users',
    GET: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`
  }
}
```

### 2. Tạo service

```javascript
// src/services/user.service.js
import apiClient from '../lib/axios'
import { API_ENDPOINTS } from '../config/api.config'

export const userService = {
  getAll: async () => {
    return await apiClient.get(API_ENDPOINTS.USERS.LIST)
  },
  // ... other methods
}
```

### 3. Tạo hook (optional)

```javascript
// src/hooks/useUsers.js
import { useState, useEffect } from 'react'
import { userService } from '../services'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  
  // ... implementation
  
  return { users, loading, /* ... */ }
}
```

## 🐛 Debug

Trong development mode, tất cả API requests và responses đều được log ra console:

```
🚀 API Request: { method: 'POST', url: '/auth/login', data: {...} }
✅ API Response: { status: 200, url: '/auth/login', data: {...} }
❌ API Error: { status: 401, message: 'Unauthorized', url: '/auth/login' }
```

## 📌 Lưu ý

1. **Token Storage**: Hiện tại dùng `localStorage`. Nếu cần bảo mật hơn, có thể dùng `httpOnly cookies`
2. **Environment Variables**: Có thể tạo file `.env` để quản lý API URL cho các môi trường khác nhau
3. **Error Handling**: Tất cả errors đã được handle trong interceptor, nhưng vẫn nên thêm try-catch
4. **CORS**: Đảm bảo Spring Boot đã enable CORS cho origin frontend (http://localhost:5175)

## 🎯 Next Steps

1. Tích hợp API vào LoginPage và Dashboard
2. Thêm loading states và error messages
3. Setup environment variables
4. Thêm toast notifications cho success/error messages
5. Implement refresh token rotation

