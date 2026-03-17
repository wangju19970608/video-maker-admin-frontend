# Birthday Admin Frontend

## 安装依赖

```bash
npm install
```

## 本地开发

```bash
npm run dev
```

## 生产构建

```bash
npm run build
```

## 环境变量

- `VITE_ADMIN_API_BASE`：后台接口地址，默认 `http://localhost:8080/api/admin`

## 当前架构

- `src/router/index.js`：路由定义 + 登录态守卫 + 页面权限拦截
- `src/stores/adminStore.js`：会话状态、权限集合、全局通知
- `src/api/adminApi.js`：后台 RESTful 接口封装
- `src/components/layout/AdminLayout.vue`：后台整体布局
- `src/components/PermissionButton.vue`：按钮级权限控制
- `src/views/*.vue`：业务页面模块化拆分
