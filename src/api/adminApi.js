import { http, unwrap } from "./http";

function cleanParams(params) {
  const result = {};
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      result[key] = value;
    }
  });
  return result;
}

export const adminApi = {
  login(payload) {
    return unwrap(http.post("/sessions", payload));
  },
  me() {
    return unwrap(http.get("/sessions/current"));
  },
  logout() {
    return unwrap(http.delete("/sessions/current"));
  },

  uploadAsset(file) {
    const formData = new FormData();
    formData.append("file", file);
    return unwrap(http.post("/assets/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }));
  },

  getConfigs() {
    return unwrap(http.get("/configs"));
  },
  getConfig(key) {
    return unwrap(http.get(`/configs/${key}`));
  },
  setConfig(key, value, description) {
    return unwrap(http.post(`/configs/${key}`, { value, description }));
  },

  getOverview() {
    return unwrap(http.get("/statistics/overview"));
  },
  getDailySales(days) {
    return unwrap(http.get("/statistics/daily-sales", { params: cleanParams({ days }) }));
  },
  getTopTemplates(limit = 10) {
    return unwrap(http.get("/statistics/top-templates", { params: cleanParams({ limit }) }));
  },

  getUsers(params) {
    return unwrap(http.get("/users", { params: cleanParams(params) }));
  },
  getUser(userId) {
    return unwrap(http.get(`/users/${userId}`));
  },
  createUser(payload) {
    return unwrap(http.post("/users", payload));
  },
  updateUser(userId, payload) {
    return unwrap(http.put(`/users/${userId}`, payload));
  },
  deleteUser(userId) {
    return unwrap(http.delete(`/users/${userId}`));
  },

  getRoles() {
    return unwrap(http.get("/roles"));
  },
  getRole(roleId) {
    return unwrap(http.get(`/roles/${roleId}`));
  },
  createRole(payload) {
    return unwrap(http.post("/roles", payload));
  },
  updateRole(roleId, payload) {
    return unwrap(http.put(`/roles/${roleId}`, payload));
  },
  deleteRole(roleId) {
    return unwrap(http.delete(`/roles/${roleId}`));
  },

  getMenus(enabledOnly) {
    return unwrap(http.get("/menus", { params: cleanParams({ enabledOnly }) }));
  },
  createMenu(payload) {
    return unwrap(http.post("/menus", payload));
  },
  updateMenu(menuId, payload) {
    return unwrap(http.put(`/menus/${menuId}`, payload));
  },
  deleteMenu(menuId) {
    return unwrap(http.delete(`/menus/${menuId}`));
  },

  getTemplates(params) {
    return unwrap(http.get("/templates", { params: cleanParams(params) }));
  },
  getTemplate(templateId) {
    return unwrap(http.get(`/templates/${templateId}`));
  },
  createTemplate(payload) {
    return unwrap(http.post("/templates", payload));
  },
  updateTemplate(templateId, payload) {
    return unwrap(http.put(`/templates/${templateId}`, payload));
  },
  deleteTemplate(templateId) {
    return unwrap(http.delete(`/templates/${templateId}`));
  },

  getOrders(params) {
    return unwrap(http.get("/orders", { params: cleanParams(params) }));
  },
  getOrder(orderId) {
    return unwrap(http.get(`/orders/${orderId}`));
  },
  updateOrder(orderId, payload) {
    return unwrap(http.put(`/orders/${orderId}`, payload));
  },
  deleteOrder(orderId) {
    return unwrap(http.delete(`/orders/${orderId}`));
  },
  downloadTemplateDocx(orderId) {
    return http.get(`/orders/${orderId}/template-docx`, { responseType: 'blob' }).then(res => res.data);
  },
  uploadCustomDocx(orderId, file) {
    const formData = new FormData();
    formData.append("file", file);
    return unwrap(http.post(`/orders/${orderId}/generate-custom`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }));
  }
};
