# MariaDB Cloud Service - Frontend

Dự án frontend cho dịch vụ MariaDB Cloud được xây dựng với React + Vite, Tailwind CSS và shadcn/ui.

## 🚀 Công nghệ sử dụng

- **React 18** - Thư viện UI
- **Vite** - Build tool và dev server
- **Tailwind CSS** - CSS framework
- **React Router** - Routing
- **Lucide React** - Icons
- **shadcn/ui** - UI components (style)

## 📦 Cài đặt

```bash
npm install
```

## 🏃‍♂️ Chạy dự án

### Development mode
```bash
npm run dev
```

Ứng dụng sẽ chạy tại [http://localhost:5173](http://localhost:5173)

### Build production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## 📁 Cấu trúc thư mục

```
src/
├── components/
│   └── ui/           # UI components (Button, Input, Card)
├── pages/            # Các trang
│   ├── LoginPage.jsx
│   └── DashboardPage.jsx
├── lib/
│   └── utils.js      # Utility functions
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## ✨ Tính năng

- ✅ Trang đăng nhập với email/password
- ✅ Đăng nhập qua GitHub và Google
- ✅ Dashboard với thống kê
- ✅ Hiển thị danh sách projects
- ✅ Biểu đồ Database Access
- ✅ Sidebar navigation
- ✅ Responsive design
- ✅ Dark theme

## 🎨 Giao diện

### Login Page
- Form đăng nhập với email/password
- Nút hiện/ẩn mật khẩu
- Đăng nhập qua GitHub và Google
- Link tạo tài khoản

### Dashboard
- Thống kê tổng quan (Total Projects, Active Databases, Recent Backups)
- Bảng Recent Projects với thông tin database
- Biểu đồ truy cập database 7 ngày
- Sidebar navigation
- Search bar
- Notification bell
- User avatar

## 🔧 Customization

### Màu sắc chính
Màu emerald (xanh lá) được sử dụng làm màu chính. Bạn có thể thay đổi trong `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      // Thêm màu custom của bạn
    }
  }
}
```

### Components
Các UI components nằm trong `src/components/ui/` và có thể customize dễ dàng.

## 📝 License

MIT
