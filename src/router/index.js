import { createRouter, createWebHistory } from "vue-router";
import AdminLayout from "../components/layout/AdminLayout.vue";
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import UsersView from "../views/UsersView.vue";
import RolesView from "../views/RolesView.vue";
import MenusView from "../views/MenusView.vue";
import TemplatesView from "../views/TemplatesView.vue";
import OrdersView from "../views/OrdersView.vue";
import SalesView from "../views/SalesView.vue";
import AlipayConfigView from "../views/AlipayConfigView.vue";
import { PAGE_CONFIG } from "../constants/navigation";
import { useAdminStore } from "../stores/adminStore";

const PROTECTED_ROUTES = Object.values(PAGE_CONFIG).map((item) => ({
  path: item.path,
  permission: item.permission
}));

function findFirstAccessiblePath(store) {
  const found = PROTECTED_ROUTES.find((item) => store.hasPermission(item.permission));
  return found?.path || null;
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { public: true, title: "登录" }
    },
    {
      path: "/",
      component: AdminLayout,
      redirect: "/dashboard",
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          component: DashboardView,
          meta: {
            title: PAGE_CONFIG.dashboard.title,
            description: PAGE_CONFIG.dashboard.description,
            permission: PAGE_CONFIG.dashboard.permission
          }
        },
        {
          path: "users",
          name: "users",
          component: UsersView,
          meta: {
            title: PAGE_CONFIG.users.title,
            description: PAGE_CONFIG.users.description,
            permission: PAGE_CONFIG.users.permission
          }
        },
        {
          path: "roles",
          name: "roles",
          component: RolesView,
          meta: {
            title: PAGE_CONFIG.roles.title,
            description: PAGE_CONFIG.roles.description,
            permission: PAGE_CONFIG.roles.permission
          }
        },
        {
          path: "menus",
          name: "menus",
          component: MenusView,
          meta: {
            title: PAGE_CONFIG.menus.title,
            description: PAGE_CONFIG.menus.description,
            permission: PAGE_CONFIG.menus.permission
          }
        },
        {
          path: "templates",
          name: "templates",
          component: TemplatesView,
          meta: {
            title: PAGE_CONFIG.templates.title,
            description: PAGE_CONFIG.templates.description,
            permission: PAGE_CONFIG.templates.permission
          }
        },
        {
          path: "orders",
          name: "orders",
          component: OrdersView,
          meta: {
            title: PAGE_CONFIG.orders.title,
            description: PAGE_CONFIG.orders.description,
            permission: PAGE_CONFIG.orders.permission
          }
        },
        {
          path: "sales",
          name: "sales",
          component: SalesView,
          meta: {
            title: PAGE_CONFIG.sales.title,
            description: PAGE_CONFIG.sales.description,
            permission: PAGE_CONFIG.sales.permission
          }
        },
        {
          path: "alipay-config",
          name: "alipay-config",
          component: AlipayConfigView,
          meta: {
            title: PAGE_CONFIG.alipayConfig.title,
            description: PAGE_CONFIG.alipayConfig.description,
            permission: PAGE_CONFIG.alipayConfig.permission
          }
        }
      ]
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/dashboard"
    }
  ]
});

router.beforeEach(async (to) => {
  const store = useAdminStore();

  if (to.meta.public) {
    if (!store.state.token) {
      return true;
    }
    try {
      if (!store.state.user) {
        await store.restoreSession();
      }
      const firstPath = findFirstAccessiblePath(store);
      return firstPath || "/login";
    } catch (error) {
      store.clearSession();
      return true;
    }
  }

  if (!store.state.token) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  if (!store.state.user) {
    try {
      await store.restoreSession();
    } catch (error) {
      store.clearSession();
      store.setNotice("登录状态已失效，请重新登录", "error");
      return { path: "/login", query: { redirect: to.fullPath } };
    }
  }

  if (to.meta.permission && !store.hasPermission(to.meta.permission)) {
    const firstPath = findFirstAccessiblePath(store);
    if (!firstPath) {
      await store.logout();
      store.setNotice("当前账号没有可访问页面", "error");
      return "/login";
    }
    if (firstPath !== to.path) {
      store.setNotice("无权访问该页面", "error");
      return firstPath;
    }
  }

  return true;
});

export default router;
