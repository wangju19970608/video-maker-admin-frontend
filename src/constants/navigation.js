export const PAGE_CONFIG = {
  dashboard: {
    path: "/dashboard",
    title: "数据看板",
    description: "核心经营指标与趋势总览",
    permission: "dashboard:view"
  },
  users: {
    path: "/users",
    title: "用户管理",
    description: "维护后台账号、角色与状态",
    permission: "sys:user:view"
  },
  roles: {
    path: "/roles",
    title: "角色管理",
    description: "配置角色与菜单权限",
    permission: "sys:role:view"
  },
  menus: {
    path: "/menus",
    title: "菜单管理",
    description: "维护后台路由与权限键",
    permission: "sys:menu:view"
  },
  templates: {
    path: "/templates",
    title: "模板管理",
    description: "模板上下架与库存管理",
    permission: "mall:template:view"
  },
  orders: {
    path: "/orders",
    title: "订单管理",
    description: "订单查询、状态流转与删除",
    permission: "mall:order:view"
  },
  sales: {
    path: "/sales",
    title: "销售统计",
    description: "每日销售与模板销售排行",
    permission: "stats:sales:view"
  }
};

export const NAV_ITEMS = Object.values(PAGE_CONFIG).map((item) => ({
  key: item.path,
  label: item.title,
  path: item.path,
  permission: item.permission
}));
