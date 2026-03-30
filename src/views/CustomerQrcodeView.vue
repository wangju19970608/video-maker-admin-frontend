<template>
  <div>
    <div class="toolbar">
      <input v-model.trim="filters.keyword" placeholder="按名称搜索" />
      <button class="ghost" @click="loadData">查询</button>
      <PermissionButton permission="mall:qrcode:create" @click="openCreate">新建二维码</PermissionButton>
    </div>

    <div v-if="formVisible" class="form-card">
      <h4>{{ formMode === "create" ? "新建客服二维码" : "编辑客服二维码" }}</h4>
      <div class="form-grid">
        <label>
          名称
          <input v-model.trim="form.name" placeholder="例如：企业微信客服" />
        </label>
        <label>
          唯一标识 Key
          <input v-model.trim="form.qrcodeKey" placeholder="例如：wechat_customer" :disabled="formMode === 'edit'" />
        </label>
        <label>
          排序
          <input v-model.number="form.sortOrder" type="number" />
        </label>
        <label>
          状态
          <select v-model="form.enabled">
            <option :value="true">启用</option>
            <option :value="false">禁用</option>
          </select>
        </label>
        <label class="full">
          二维码图片 URL
          <input v-model.trim="form.qrcodeUrl" placeholder="https://example.com/qrcode.jpg" />
        </label>
        <label v-if="form.qrcodeUrl" class="full">
          预览
          <div class="qrcode-preview">
            <img :src="form.qrcodeUrl" alt="二维码预览" />
          </div>
        </label>
      </div>
      <div class="form-actions">
        <PermissionButton permission="mall:qrcode:update,mall:qrcode:create" @click="saveData">保存</PermissionButton>
        <button class="ghost" @click="formVisible = false">取消</button>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>Key</th>
            <th>二维码</th>
            <th>排序</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in dataList" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.qrcodeKey }}</td>
            <td>
              <img v-if="item.qrcodeUrl" :src="item.qrcodeUrl" class="table-qrcode" @click="previewImage(item.qrcodeUrl)" />
              <span v-else>-</span>
            </td>
            <td>{{ item.sortOrder }}</td>
            <td>{{ item.enabled ? "启用" : "禁用" }}</td>
            <td>
              <PermissionButton class="mini" permission="mall:qrcode:update" @click="openEdit(item)">编辑</PermissionButton>
              <PermissionButton class="mini danger" permission="mall:qrcode:delete" @click="removeData(item)">删除</PermissionButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="previewVisible" class="modal-overlay" @click.self="previewVisible = false">
      <div class="modal-content">
        <img :src="previewUrl" style="max-height: 80vh; max-width: 100%;" />
        <div class="modal-close" @click="previewVisible = false">✕</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import PermissionButton from "../components/PermissionButton.vue";
import { adminApi } from "../api/adminApi";
import { useAdminStore } from "../stores/adminStore";

const store = useAdminStore();

const dataList = ref([]);
const filters = reactive({ keyword: "" });

const formVisible = ref(false);
const formMode = ref("create");
const form = reactive({
  id: null,
  name: "",
  qrcodeKey: "",
  qrcodeUrl: "",
  sortOrder: 0,
  enabled: true
});

const previewVisible = ref(false);
const previewUrl = ref("");

async function loadData() {
  try {
    dataList.value = await adminApi.getCustomerQrcodes();
  } catch (error) {
    store.handleError(error, "加载数据失败");
  }
}

function openCreate() {
  formMode.value = "create";
  Object.assign(form, {
    id: null,
    name: "",
    qrcodeKey: "",
    qrcodeUrl: "",
    sortOrder: 0,
    enabled: true
  });
  formVisible.value = true;
}

function openEdit(item) {
  formMode.value = "edit";
  Object.assign(form, {
    id: item.id,
    name: item.name,
    qrcodeKey: item.qrcodeKey,
    qrcodeUrl: item.qrcodeUrl,
    sortOrder: item.sortOrder || 0,
    enabled: item.enabled
  });
  formVisible.value = true;
}

async function saveData() {
  try {
    if (formMode.value === "create") {
      await adminApi.createCustomerQrcode(form);
    } else {
      await adminApi.updateCustomerQrcode(form.id, form);
    }
    formVisible.value = false;
    await loadData();
    store.setNotice("保存成功", "success");
  } catch (error) {
    store.handleError(error, "保存失败");
  }
}

async function removeData(item) {
  if (!confirm(`确认删除【${item.name}】吗？`)) {
    return;
  }
  try {
    await adminApi.deleteCustomerQrcode(item.id);
    await loadData();
    store.setNotice("删除成功", "success");
  } catch (error) {
    store.handleError(error, "删除失败");
  }
}

function previewImage(url) {
  previewUrl.value = url;
  previewVisible.value = true;
}

onMounted(loadData);
</script>

<style scoped>
.qrcode-preview {
  margin-top: 8px;
  max-width: 150px;
}
.qrcode-preview img {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #eee;
}
.table-qrcode {
  width: 40px;
  height: 40px;
  object-fit: contain;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #eee;
}
</style>