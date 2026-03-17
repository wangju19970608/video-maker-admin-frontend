<template>
  <div>
    <div class="toolbar">
      <PermissionButton permission="sys:menu:create,sys:menu:view" @click="openCreate">新建菜单</PermissionButton>
    </div>

    <div v-if="formVisible" class="form-card">
      <h4>{{ formMode === "create" ? "新建菜单" : "编辑菜单" }}</h4>
      <div class="form-grid">
        <label>
          菜单名称
          <input v-model.trim="form.menuName" />
        </label>
        <label>
          上级菜单
          <select v-model.number="form.parentId">
            <option :value="0">顶级菜单</option>
            <option v-for="menu in flatMenuOptions" :key="menu.id" :value="menu.id">
              {{ menu.indent + menu.menuName }}
            </option>
          </select>
        </label>
        <label>
          菜单类型
          <select v-model="form.menuType">
            <option value="CATALOG">目录</option>
            <option value="MENU">菜单</option>
            <option value="BUTTON">按钮</option>
          </select>
        </label>
        <label>
          路由地址
          <input v-model.trim="form.routePath" />
        </label>
        <label>
          组件路径
          <input v-model.trim="form.componentPath" />
        </label>
        <label>
          权限标识
          <input v-model.trim="form.permissionKey" placeholder="例如 mall:order:view" />
        </label>
        <label>
          图标
          <input v-model.trim="form.icon" />
        </label>
        <label>
          排序
          <input v-model.number="form.sortOrder" type="number" />
        </label>
        <label>
          是否可见
          <select v-model="form.visible">
            <option :value="true">是</option>
            <option :value="false">否</option>
          </select>
        </label>
        <label>
          状态
          <select v-model.number="form.status">
            <option :value="1">启用</option>
            <option :value="0">禁用</option>
          </select>
        </label>
      </div>

      <div class="form-actions">
        <PermissionButton permission="sys:menu:update,sys:menu:create,sys:menu:view" @click="saveMenu">保存</PermissionButton>
        <button class="ghost" @click="formVisible = false">取消</button>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>菜单名称</th>
            <th>类型</th>
            <th>路由</th>
            <th>权限标识</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in flatMenuOptions" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.indent + item.menuName }}</td>
            <td>{{ formatMenuType(item.menuType) }}</td>
            <td>{{ item.routePath }}</td>
            <td>{{ item.permissionKey }}</td>
            <td>{{ item.status === 1 ? "启用" : "禁用" }}</td>
            <td>
              <PermissionButton class="mini" permission="sys:menu:update,sys:menu:view" @click="openEdit(item)">编辑</PermissionButton>
              <PermissionButton class="mini danger" permission="sys:menu:delete,sys:menu:view" @click="removeMenu(item)">删除</PermissionButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import PermissionButton from "../components/PermissionButton.vue";
import { adminApi } from "../api/adminApi";
import { useAdminStore } from "../stores/adminStore";
import { flattenMenus } from "../utils/menu";

const store = useAdminStore();
const menuTree = ref([]);

const formVisible = ref(false);
const formMode = ref("create");
const form = reactive({
  id: null,
  parentId: 0,
  menuName: "",
  menuType: "MENU",
  routePath: "",
  componentPath: "",
  permissionKey: "",
  icon: "",
  sortOrder: 0,
  visible: true,
  status: 1
});

const flatMenuOptions = computed(() => flattenMenus(menuTree.value));

function formatMenuType(type) {
  const map = {
    CATALOG: "目录",
    MENU: "菜单",
    BUTTON: "按钮"
  };
  return map[type] || type;
}

async function loadMenus() {
  try {
    menuTree.value = await adminApi.getMenus(false);
  } catch (error) {
    store.handleError(error, "加载菜单失败");
  }
}

function openCreate() {
  formMode.value = "create";
  Object.assign(form, {
    id: null,
    parentId: 0,
    menuName: "",
    menuType: "MENU",
    routePath: "",
    componentPath: "",
    permissionKey: "",
    icon: "",
    sortOrder: 0,
    visible: true,
    status: 1
  });
  formVisible.value = true;
}

function openEdit(item) {
  formMode.value = "edit";
  Object.assign(form, {
    id: item.id,
    parentId: item.parentId ?? 0,
    menuName: item.menuName,
    menuType: item.menuType,
    routePath: item.routePath,
    componentPath: item.componentPath,
    permissionKey: item.permissionKey,
    icon: item.icon,
    sortOrder: item.sortOrder,
    visible: item.visible,
    status: item.status
  });
  formVisible.value = true;
}

async function saveMenu() {
  try {
    const payload = {
      parentId: form.parentId,
      menuName: form.menuName,
      menuType: form.menuType,
      routePath: form.routePath,
      componentPath: form.componentPath,
      permissionKey: form.permissionKey,
      icon: form.icon,
      sortOrder: form.sortOrder,
      visible: form.visible,
      status: form.status
    };
    if (formMode.value === "create") {
      await adminApi.createMenu(payload);
    } else {
      await adminApi.updateMenu(form.id, payload);
    }
    formVisible.value = false;
    await loadMenus();
    store.setNotice("菜单保存成功", "success");
  } catch (error) {
    store.handleError(error, "保存菜单失败");
  }
}

async function removeMenu(item) {
  if (!confirm(`确认删除菜单【${item.menuName}】吗？`)) {
    return;
  }
  try {
    await adminApi.deleteMenu(item.id);
    await loadMenus();
    store.setNotice("菜单已删除", "success");
  } catch (error) {
    store.handleError(error, "删除菜单失败");
  }
}

onMounted(loadMenus);
</script>
