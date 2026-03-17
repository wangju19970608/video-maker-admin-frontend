<template>
  <div>
    <div class="toolbar">
      <PermissionButton permission="sys:role:create,sys:role:view" @click="openCreate">新建角色</PermissionButton>
    </div>

    <div v-if="formVisible" class="form-card">
      <h4>{{ formMode === "create" ? "新建角色" : "编辑角色" }}</h4>
      <div class="form-grid">
        <label>
          角色编码
          <input v-model.trim="form.roleCode" :disabled="formMode === 'edit'" />
        </label>
        <label>
          角色名称
          <input v-model.trim="form.roleName" />
        </label>
        <label>
          状态
          <select v-model.number="form.status">
            <option :value="1">启用</option>
            <option :value="0">禁用</option>
          </select>
        </label>
        <label>
          角色说明
          <input v-model.trim="form.description" />
        </label>
      </div>

      <div class="check-group">
        <span>菜单权限：</span>
        <label v-for="menu in flatMenuOptions" :key="menu.id" class="check-item">
          <input v-model="form.menuIds" type="checkbox" :value="menu.id" />
          {{ menu.indent + menu.menuName }}
        </label>
      </div>

      <div class="form-actions">
        <PermissionButton permission="sys:role:update,sys:role:create,sys:role:view" @click="saveRole">保存</PermissionButton>
        <button class="ghost" @click="formVisible = false">取消</button>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>角色编码</th>
            <th>角色名称</th>
            <th>状态</th>
            <th>菜单数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in roles" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.roleCode }}</td>
            <td>{{ item.roleName }}</td>
            <td>{{ item.status === 1 ? "启用" : "禁用" }}</td>
            <td>{{ (item.menuIds || []).length }}</td>
            <td>
              <PermissionButton class="mini" permission="sys:role:update,sys:role:view" @click="openEdit(item)">编辑</PermissionButton>
              <PermissionButton class="mini danger" permission="sys:role:delete,sys:role:view" @click="removeRole(item)">删除</PermissionButton>
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

const roles = ref([]);
const menuTree = ref([]);

const formVisible = ref(false);
const formMode = ref("create");
const form = reactive({
  id: null,
  roleCode: "",
  roleName: "",
  description: "",
  status: 1,
  menuIds: []
});

const flatMenuOptions = computed(() => flattenMenus(menuTree.value));

async function loadRoles() {
  roles.value = await adminApi.getRoles();
}

async function loadMenus() {
  menuTree.value = await adminApi.getMenus(false);
}

function openCreate() {
  formMode.value = "create";
  Object.assign(form, {
    id: null,
    roleCode: "",
    roleName: "",
    description: "",
    status: 1,
    menuIds: []
  });
  formVisible.value = true;
}

function openEdit(item) {
  formMode.value = "edit";
  Object.assign(form, {
    id: item.id,
    roleCode: item.roleCode,
    roleName: item.roleName,
    description: item.description,
    status: item.status,
    menuIds: [...(item.menuIds || [])]
  });
  formVisible.value = true;
}

async function saveRole() {
  try {
    const payload = {
      roleCode: form.roleCode,
      roleName: form.roleName,
      description: form.description,
      status: form.status,
      menuIds: form.menuIds
    };
    if (formMode.value === "create") {
      await adminApi.createRole(payload);
    } else {
      await adminApi.updateRole(form.id, payload);
    }
    formVisible.value = false;
    await loadRoles();
    store.setNotice("角色保存成功", "success");
  } catch (error) {
    store.handleError(error, "保存角色失败");
  }
}

async function removeRole(item) {
  if (!confirm(`确认删除角色【${item.roleName}】吗？`)) {
    return;
  }
  try {
    await adminApi.deleteRole(item.id);
    await loadRoles();
    store.setNotice("角色已删除", "success");
  } catch (error) {
    store.handleError(error, "删除角色失败");
  }
}

onMounted(async () => {
  try {
    await Promise.all([loadRoles(), loadMenus()]);
  } catch (error) {
    store.handleError(error, "初始化角色页面失败");
  }
});
</script>
