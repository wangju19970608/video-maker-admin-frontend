<template>
  <div>
    <div class="toolbar">
      <input v-model.trim="filters.keyword" placeholder="按用户名或昵称搜索" />
      <select v-model="filters.status">
        <option value="">全部状态</option>
        <option value="1">启用</option>
        <option value="0">禁用</option>
      </select>
      <button class="ghost" @click="loadUsers">查询</button>
      <PermissionButton permission="sys:user:create,sys:user:view" @click="openCreate">新建用户</PermissionButton>
    </div>

    <div v-if="formVisible" class="form-card">
      <h4>{{ formMode === "create" ? "新建用户" : "编辑用户" }}</h4>
      <div class="form-grid">
        <label>
          用户名
          <input v-model.trim="form.username" :disabled="formMode === 'edit'" />
        </label>
        <label>
          密码
          <input v-model="form.password" type="password" placeholder="编辑时留空表示不修改" />
        </label>
        <label>
          昵称
          <input v-model.trim="form.nickname" />
        </label>
        <label>
          邮箱
          <input v-model.trim="form.email" />
        </label>
        <label>
          手机号
          <input v-model.trim="form.phone" />
        </label>
        <label>
          状态
          <select v-model.number="form.status">
            <option :value="1">启用</option>
            <option :value="0">禁用</option>
          </select>
        </label>
        <label>
          企微客服工作状态
          <select v-model="form.customerServiceActive">
            <option :value="true">接单中</option>
            <option :value="false">休息中</option>
          </select>
        </label>
        <label>
          客服权重(分配优先级)
          <input v-model.number="form.customerServiceWeight" type="number" min="1" />
        </label>
        <label class="full">
          企微二维码图片 URL
          <div style="display: flex; gap: 10px;">
            <input v-model.trim="form.wechatQrUrl" placeholder="输入 URL 或点击上传" style="flex: 1;" />
            <input type="file" ref="qrFileInput" style="display: none;" @change="handleQrUpload" accept="image/*" />
            <button type="button" class="ghost" @click="$refs.qrFileInput.click()">上传图片</button>
          </div>
        </label>
        <label class="full">
          企微直跳链接
          <input v-model.trim="form.wechatLink" placeholder="例如: https://work.weixin.qq.com/kfid/kfc..." />
        </label>
      </div>
      <div class="check-group">
        <span>角色分配：</span>
        <label v-for="role in roles" :key="role.id" class="check-item">
          <input v-model="form.roleIds" type="checkbox" :value="role.id" />
          {{ role.roleName }}
        </label>
      </div>
      <div class="form-actions">
        <PermissionButton permission="sys:user:update,sys:user:create,sys:user:view" @click="saveUser">保存</PermissionButton>
        <button class="ghost" @click="formVisible = false">取消</button>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>用户名</th>
            <th>昵称</th>
            <th>角色</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in users" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.username }}</td>
            <td>{{ item.nickname }}</td>
            <td>{{ (item.roleNames || []).join(" / ") }}</td>
            <td>{{ item.status === 1 ? "启用" : "禁用" }}</td>
            <td>{{ item.createdAt }}</td>
            <td>
              <PermissionButton class="mini" permission="sys:user:update,sys:user:view" @click="openEdit(item)">编辑</PermissionButton>
              <PermissionButton class="mini" permission="sys:user:update,sys:user:view" @click="toggleStatus(item)">
                {{ item.status === 1 ? "禁用" : "启用" }}
              </PermissionButton>
              <PermissionButton class="mini danger" permission="sys:user:delete,sys:user:view" @click="removeUser(item)">删除</PermissionButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import PermissionButton from "../components/PermissionButton.vue";
import { adminApi } from "../api/adminApi";
import { useAdminStore } from "../stores/adminStore";

const store = useAdminStore();

const users = ref([]);
const roles = ref([]);
const filters = reactive({ keyword: "", status: "" });

const formVisible = ref(false);
const formMode = ref("create");
const form = reactive({
  id: null,
  username: "",
  password: "",
  nickname: "",
  email: "",
  phone: "",
  status: 1,
  roleIds: [],
  customerServiceActive: false,
  customerServiceWeight: 1,
  wechatQrUrl: "",
  wechatLink: ""
});

const qrFileInput = ref(null);

async function handleQrUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const url = await adminApi.uploadAsset(file);
    form.wechatQrUrl = url;
    store.setNotice("二维码上传成功", "success");
  } catch (error) {
    store.handleError(error, "上传失败");
  } finally {
    event.target.value = "";
  }
}

async function loadRoles() {
  roles.value = await adminApi.getRoles();
}

async function loadUsers() {
  try {
    users.value = await adminApi.getUsers({
      keyword: filters.keyword || undefined,
      status: filters.status === "" ? undefined : Number(filters.status)
    });
  } catch (error) {
    store.handleError(error, "加载用户列表失败");
  }
}

function openCreate() {
  formMode.value = "create";
  Object.assign(form, {
    id: null,
    username: "",
    password: "",
    nickname: "",
    email: "",
    phone: "",
    status: 1,
    roleIds: [],
    customerServiceActive: false,
    customerServiceWeight: 1,
    wechatQrUrl: "",
    wechatLink: ""
  });
  formVisible.value = true;
}

function openEdit(item) {
  formMode.value = "edit";
  Object.assign(form, {
    id: item.id,
    username: item.username,
    password: "",
    nickname: item.nickname,
    email: item.email,
    phone: item.phone,
    status: item.status,
    roleIds: [...(item.roleIds || [])],
    customerServiceActive: item.customerServiceActive || false,
    customerServiceWeight: item.customerServiceWeight || 1,
    wechatQrUrl: item.wechatQrUrl || "",
    wechatLink: item.wechatLink || ""
  });
  formVisible.value = true;
}

async function saveUser() {
  try {
    const payload = { ...form };
    if (formMode.value === "create") {
      await adminApi.createUser(payload);
    } else {
      await adminApi.updateUser(form.id, payload);
    }
    formVisible.value = false;
    await loadUsers();
    store.setNotice("用户保存成功", "success");
  } catch (error) {
    store.handleError(error, "保存用户失败");
  }
}

async function toggleStatus(item) {
  try {
    await adminApi.updateUser(item.id, { status: item.status === 1 ? 0 : 1 });
    await loadUsers();
    store.setNotice("用户状态已更新", "success");
  } catch (error) {
    store.handleError(error, "更新用户状态失败");
  }
}

async function removeUser(item) {
  if (!confirm(`确认删除用户【${item.username}】吗？`)) {
    return;
  }
  try {
    await adminApi.deleteUser(item.id);
    await loadUsers();
    store.setNotice("用户已删除", "success");
  } catch (error) {
    store.handleError(error, "删除用户失败");
  }
}

onMounted(async () => {
  try {
    await loadRoles();
    await loadUsers();
  } catch (error) {
    store.handleError(error, "初始化用户页面失败");
  }
});
</script>
