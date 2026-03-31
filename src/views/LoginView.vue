<template>
  <section class="login-page">
    <div class="login-left">
      <div class="login-left-content">
        <div class="brand-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
          </div>
          <span class="logo-text">视频工坊</span>
        </div>
        <h2 class="brand-slogan">专业视频模板管理平台</h2>
        <p class="brand-desc">高效管理您的视频模板、订单与用户，一站式后台解决方案</p>
        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div class="feature-text">
              <strong>安全可靠</strong>
              <span>多重安全防护</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="feature-text">
              <strong>高效便捷</strong>
              <span>快速处理业务</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div class="feature-text">
              <strong>团队协作</strong>
              <span>多角色权限管理</span>
            </div>
          </div>
        </div>
      </div>
      <div class="login-left-footer">
        <span>&copy; 2024 视频工坊 All Rights Reserved</span>
      </div>
    </div>
    <div class="login-right">
      <div class="login-card">
        <div class="login-header">
          <h1>欢迎登录</h1>
          <p>请输入您的账号信息</p>
        </div>
        <form class="login-form" @submit.prevent="submitLogin">
          <div class="form-group">
            <label for="username">用户名</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input 
                id="username"
                v-model.trim="loginForm.username" 
                type="text" 
                placeholder="请输入用户名"
                autocomplete="username" 
              />
            </div>
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <div class="input-wrapper">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input 
                id="password"
                v-model="loginForm.password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="请输入密码"
                autocomplete="current-password"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe" />
              <span class="checkmark"></span>
              <span>记住我</span>
            </label>
            <a href="javascript:;" class="forgot-link">忘记密码？</a>
          </div>
          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="!loading">登 录</span>
            <span v-else class="loading-spinner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
              登录中...
            </span>
          </button>
        </form>
        <div class="login-footer">
          <p>首次登录请使用管理员账号</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NAV_ITEMS } from "../constants/navigation";
import { useAdminStore } from "../stores/adminStore";

const route = useRoute();
const router = useRouter();
const store = useAdminStore();

const loading = ref(false);
const showPassword = ref(false);
const rememberMe = ref(false);
const loginForm = reactive({
  username: "",
  password: ""
});

function firstAccessiblePath() {
  const found = NAV_ITEMS.find((item) => store.hasPermission(item.permission));
  return found?.path || "/dashboard";
}

async function submitLogin() {
  if (!loginForm.username || !loginForm.password) {
    store.setNotice("请输入用户名和密码", "error");
    return;
  }
  loading.value = true;
  try {
    await store.login(loginForm);
    store.setNotice("登录成功", "success");

    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "";
    router.replace(redirect || firstAccessiblePath());
  } catch (error) {
    store.handleError(error, "登录失败");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.login-left {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 60px 50px;
  position: relative;
  overflow: hidden;
}

.login-left::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(5%, 5%); }
}

.login-left-content {
  position: relative;
  z-index: 1;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.logo-icon svg {
  width: 28px;
  height: 28px;
  color: #fff;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

.brand-slogan {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 16px;
  line-height: 1.3;
}

.brand-desc {
  font-size: 16px;
  color: rgba(255,255,255,0.8);
  margin: 0 0 50px;
  line-height: 1.6;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.feature-icon {
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-icon svg {
  width: 22px;
  height: 22px;
  color: #fff;
}

.feature-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feature-text strong {
  font-size: 15px;
  color: #fff;
  font-weight: 600;
}

.feature-text span {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
}

.login-left-footer {
  position: relative;
  z-index: 1;
  padding-top: 30px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.login-left-footer span {
  font-size: 13px;
  color: rgba(255,255,255,0.6);
}

.login-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f8fafc;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 20px;
  padding: 50px 40px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.08);
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.login-header p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  width: 20px;
  height: 20px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-icon svg {
  width: 20px;
  height: 20px;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 14px 14px 44px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.input-wrapper input::placeholder {
  color: #94a3b8;
}

.toggle-password {
  position: absolute;
  right: 14px;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #667eea;
}

.toggle-password svg {
  width: 20px;
  height: 20px;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #64748b;
}

.remember-me input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remember-me input:checked + .checkmark {
  background: #667eea;
  border-color: #667eea;
}

.remember-me input:checked + .checkmark::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-bottom: 2px;
}

.forgot-link {
  font-size: 14px;
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #764ba2;
}

.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(102, 126, 234, 0.4);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-spinner svg {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 30px;
  text-align: center;
}

.login-footer p {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

@media (max-width: 1024px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-left {
    display: none;
  }

  .login-right {
    padding: 20px;
  }

  .login-card {
    padding: 40px 30px;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .form-options {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>
