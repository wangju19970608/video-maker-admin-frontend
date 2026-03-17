<template>
  <div>
    <div class="toolbar">
      <input v-model.trim="filters.keyword" placeholder="按模板名称搜索" />
      <select v-model="filters.enabled">
        <option value="">全部状态</option>
        <option value="true">已上架</option>
        <option value="false">已下架</option>
      </select>
      <button class="ghost" @click="loadTemplates">查询</button>
      <PermissionButton permission="mall:template:create,mall:template:view" @click="openCreate">新建模板</PermissionButton>
    </div>

    <div v-if="formVisible" class="form-card">
      <h4>{{ formMode === "create" ? "新建模板" : "编辑模板" }}</h4>
      <div class="form-grid">
        <label>
          模板编码
          <input v-model.trim="form.templateCode" :disabled="formMode === 'edit'" />
        </label>
        <label>
          模板名称
          <input v-model.trim="form.name" />
        </label>
        <label>
          主题Key
          <input v-model.trim="form.themeKey" />
        </label>
        <label>
          主题名称
          <input v-model.trim="form.themeName" />
        </label>
        <label>
          分类Key
          <input v-model.trim="form.categoryKey" />
        </label>
        <label>
          分类名称
          <input v-model.trim="form.categoryName" />
        </label>
        <label>
          价格
          <input v-model.number="form.price" type="number" step="0.1" />
        </label>
        <label>
          标签
          <input v-model.trim="form.tagName" />
        </label>
        <label>
          渐变色起始
          <input v-model.trim="form.colorStart" />
        </label>
        <label>
          渐变色结束
          <input v-model.trim="form.colorEnd" />
        </label>
        <label>
          库存
          <input v-model.number="form.inventoryCount" type="number" />
        </label>
        <label>
          排序
          <input v-model.number="form.sortOrder" type="number" />
        </label>
        <label class="full">
          副标题
          <input v-model.trim="form.subtitle" />
        </label>
        <label class="full">
          描述
          <textarea v-model.trim="form.description" rows="2" />
        </label>
      </div>
      <div class="form-actions">
        <PermissionButton permission="mall:template:update,mall:template:create,mall:template:view" @click="saveTemplate">保存</PermissionButton>
        <button class="ghost" @click="formVisible = false">取消</button>
      </div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>名称</th>
            <th>主题</th>
            <th>分类</th>
            <th>价格</th>
            <th>销量</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in templates" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.themeName || item.theme }}</td>
            <td>{{ item.categoryName || item.category }}</td>
            <td>￥ {{ formatAmount(item.price) }}</td>
            <td>{{ item.salesCount || 0 }}</td>
            <td>{{ item.enabled ? "已上架" : "已下架" }}</td>
            <td>
              <PermissionButton class="mini" permission="mall:template:update,mall:template:view" @click="openEdit(item)">编辑</PermissionButton>
              <PermissionButton class="mini" permission="mall:template:update,mall:template:view" @click="toggleStatus(item)">
                {{ item.enabled ? "下架" : "上架" }}
              </PermissionButton>
              <PermissionButton class="mini danger" permission="mall:template:delete,mall:template:view" @click="removeTemplate(item)">删除</PermissionButton>
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
import { formatAmount } from "../utils/format";

const store = useAdminStore();

const templates = ref([]);
const filters = reactive({ keyword: "", enabled: "" });

const formVisible = ref(false);
const formMode = ref("create");
const form = reactive({
  id: null,
  templateCode: "",
  name: "",
  subtitle: "",
  description: "",
  themeKey: "",
  themeName: "",
  categoryKey: "",
  categoryName: "",
  tagName: "",
  price: 19.9,
  colorStart: "#c90b18",
  colorEnd: "#81000f",
  inventoryCount: 99999,
  sortOrder: 0,
  enabled: true
});

async function loadTemplates() {
  try {
    templates.value = await adminApi.getTemplates({
      keyword: filters.keyword || undefined,
      enabled: filters.enabled === "" ? undefined : filters.enabled
    });
  } catch (error) {
    store.handleError(error, "加载模板失败");
  }
}

function openCreate() {
  formMode.value = "create";
  Object.assign(form, {
    id: null,
    templateCode: "",
    name: "",
    subtitle: "",
    description: "",
    themeKey: "",
    themeName: "",
    categoryKey: "",
    categoryName: "",
    tagName: "",
    price: 19.9,
    colorStart: "#c90b18",
    colorEnd: "#81000f",
    inventoryCount: 99999,
    sortOrder: 0,
    enabled: true
  });
  formVisible.value = true;
}

function openEdit(item) {
  formMode.value = "edit";
  Object.assign(form, {
    id: item.id,
    templateCode: item.templateCode,
    name: item.name,
    subtitle: item.subtitle,
    description: item.description,
    themeKey: item.theme,
    themeName: item.themeName,
    categoryKey: item.category,
    categoryName: item.categoryName,
    tagName: item.tag,
    price: Number(item.price || 0),
    colorStart: item.colors?.[0] || "#c90b18",
    colorEnd: item.colors?.[1] || "#81000f",
    inventoryCount: item.inventoryCount || 99999,
    sortOrder: item.sortOrder || 0,
    enabled: !!item.enabled
  });
  formVisible.value = true;
}

async function saveTemplate() {
  try {
    const payload = { ...form };
    if (formMode.value === "create") {
      await adminApi.createTemplate(payload);
    } else {
      await adminApi.updateTemplate(form.id, payload);
    }
    formVisible.value = false;
    await loadTemplates();
    store.setNotice("模板保存成功", "success");
  } catch (error) {
    store.handleError(error, "保存模板失败");
  }
}

async function toggleStatus(item) {
  try {
    await adminApi.updateTemplate(item.id, { enabled: !item.enabled });
    await loadTemplates();
    store.setNotice("模板状态已更新", "success");
  } catch (error) {
    store.handleError(error, "更新模板状态失败");
  }
}

async function removeTemplate(item) {
  if (!confirm(`确认删除模板【${item.name}】吗？`)) {
    return;
  }
  try {
    await adminApi.deleteTemplate(item.id);
    await loadTemplates();
    store.setNotice("模板已删除", "success");
  } catch (error) {
    store.handleError(error, "删除模板失败");
  }
}

onMounted(loadTemplates);
</script>
