import { reactive } from "vue";
import { adminApi } from "../api/adminApi";
import { TOKEN_KEY } from "../constants/auth";
import { collectPermissionKeys } from "../utils/menu";

const state = reactive({
  token: localStorage.getItem(TOKEN_KEY) || "",
  user: null,
  menus: [],
  permissions: [],
  initialized: false,
  notice: {
    text: "",
    type: "info"
  }
});

let restorePromise = null;
let noticeTimer = null;

function setNotice(text, type = "info") {
  state.notice.text = text;
  state.notice.type = type;
  if (noticeTimer) {
    clearTimeout(noticeTimer);
  }
  noticeTimer = setTimeout(() => {
    state.notice.text = "";
  }, 2600);
}

function applySession(payload) {
  if (payload?.token) {
    state.token = payload.token;
    localStorage.setItem(TOKEN_KEY, payload.token);
  }
  state.user = payload?.user || null;
  state.menus = payload?.menus || [];
  state.permissions = collectPermissionKeys(state.menus);
  state.initialized = true;
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  state.token = "";
  state.user = null;
  state.menus = [];
  state.permissions = [];
  state.initialized = true;
}

async function login(form) {
  const result = await adminApi.login(form);
  applySession(result);
  return result;
}

async function restoreSession() {
  if (!state.token) {
    state.initialized = true;
    return null;
  }
  if (restorePromise) {
    return restorePromise;
  }

  restorePromise = (async () => {
    const result = await adminApi.me();
    applySession({
      token: state.token,
      user: result.user,
      menus: result.menus || []
    });
    return result;
  })();

  try {
    return await restorePromise;
  } finally {
    restorePromise = null;
  }
}

async function logout() {
  try {
    if (state.token) {
      await adminApi.logout();
    }
  } catch (_) {
    // 退出时后端异常不影响前端清理状态
  }
  clearSession();
}

function parseRequiredPermission(required) {
  if (!required) {
    return [];
  }
  if (Array.isArray(required)) {
    return required.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(required)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasPermission(required) {
  const needed = parseRequiredPermission(required);
  if (!needed.length) {
    return true;
  }
  if (state.user?.username === "admin") {
    return true;
  }
  return needed.some((key) => state.permissions.includes(key));
}

function handleError(error, fallback = "请求失败") {
  if (error?.response?.status === 401) {
    clearSession();
    setNotice("登录状态已失效，请重新登录", "error");
    return;
  }
  setNotice(error?.message || fallback, "error");
}

export function useAdminStore() {
  return {
    state,
    setNotice,
    applySession,
    clearSession,
    login,
    restoreSession,
    logout,
    hasPermission,
    handleError
  };
}
