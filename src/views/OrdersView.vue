<template>
  <div>
    <div class="toolbar">
      <input v-model.trim="filters.keyword" placeholder="按订单号、模板名搜索" />
      <select v-model="filters.status">
        <option value="">全部状态</option>
        <option value="pending">待支付</option>
        <option value="paid">已支付</option>
        <option value="cancelled">已取消</option>
      </select>
      <label>
        开始日期
        <input v-model="filters.startDate" type="date" />
      </label>
      <label>
        结束日期
        <input v-model="filters.endDate" type="date" />
      </label>
      <button class="ghost" @click="loadOrders">查询</button>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>订单号</th>
            <th>模板</th>
            <th>客户</th>
            <th>金额</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>制作次数</th>
            <th>生成内容</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in orders" :key="item.id">
            <td>{{ item.orderNo }}</td>
            <td>{{ item.template?.name || "-" }}</td>
            <td>{{ item.customerName || "-" }}</td>
            <td>
              <div v-if="editingAmountId === item.id">
                <input v-model.number="editingAmount" type="number" step="0.01" style="width: 80px;" />
                <button @click="saveAmount(item)">保存</button>
                <button @click="cancelEditAmount">取消</button>
              </div>
              <div v-else>
                ￥ {{ formatAmount(item.amount) }}
                <button v-if="canUpdateStatus" class="ghost mini" @click="startEditAmount(item)">✎</button>
              </div>
            </td>
            <td>{{ statusLabel(item.status) }}</td>
            <td>{{ item.createdAt }}</td>
            <td>
              <div v-if="editingCountId === item.id">
                <input v-model.number="editingCount" type="number" min="0" style="width: 60px;" />
                <button @click="saveCount(item)">保存</button>
                <button @click="cancelEditCount">取消</button>
              </div>
              <div v-else>
                {{ item.usedGenerateCount || 0 }} / {{ item.maxGenerateCount || 5 }}
                <button v-if="canUpdateStatus" class="ghost mini" @click="startEditCount(item)">✎</button>
              </div>
            </td>
            <td>
              <div v-if="item.historicalTasks && item.historicalTasks.length > 0" style="display: flex; flex-direction: column; gap: 6px; max-width: 260px;">
                <div v-for="(task, index) in item.historicalTasks" :key="task.taskId" style="background: #fcfcfc; border: 1px solid #eee; padding: 6px; border-radius: 4px;">
                  <div style="font-size: 11px; color: #999; margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>记录 #{{ item.historicalTasks.length - index }}</span>
                    <span :style="{ color: task.status === 'completed' ? '#52c41a' : task.status === 'failed' ? '#f5222d' : '#1890ff' }">
                      {{ task.status === 'completed' ? '完成' : task.status === 'processing' ? '制作中' : '失败' }}
                    </span>
                  </div>
                  <div style="display: flex; gap: 2px; flex-wrap: wrap;">
                    <button v-if="item.template?.templateType === 'video'" type="button" @click="viewParameters(task.parametersUrl)" class="action-btn ghost mini" style="padding: 1px 4px; font-size: 11px;">看参数</button>
                    <a :href="getTaskUrl(task.taskId, 'image')" target="_blank" class="action-btn ghost mini" style="padding: 1px 4px; font-size: 11px;">看图</a>
                    <a :href="getTaskUrl(task.taskId, 'video')" target="_blank" class="action-btn ghost mini" style="padding: 1px 4px; font-size: 11px;">视频</a>
                    <button type="button" @click="downloadTaskFile(task.taskId, 'image')" class="action-btn primary mini" style="padding: 1px 4px; font-size: 11px;">下图片</button>
                    <button type="button" @click="downloadTaskFile(task.taskId, 'video')" class="action-btn primary mini" style="padding: 1px 4px; font-size: 11px;">下视频</button>
                  </div>
                </div>
              </div>
              <div v-else-if="item.taskId" style="display: flex; gap: 4px; flex-wrap: wrap;">
                <a :href="getTaskUrl(item.taskId, 'image')" target="_blank" class="action-btn ghost mini">预览图片</a>
                <a :href="getTaskUrl(item.taskId, 'video')" target="_blank" class="action-btn ghost mini">预览视频</a>
                <button type="button" @click="downloadTaskFile(item.taskId, 'image')" class="action-btn primary mini">下载图片</button>
                <button type="button" @click="downloadTaskFile(item.taskId, 'video')" class="action-btn primary mini">下载视频</button>
              </div>
              <span v-else>-</span>
            </td>
            <td>
              <select :value="item.status" :disabled="!canUpdateStatus" @change="changeStatus(item, $event.target.value)">
                <option value="pending">待支付</option>
                <option value="paid">已支付</option>
                <option value="cancelled">已取消</option>
              </select>
              <PermissionButton class="mini danger" permission="mall:order:delete,mall:order:view" @click="removeOrder(item)">
                删除
              </PermissionButton>
              <div v-if="item.template?.templateType !== 'video'" style="margin-top: 4px; display: flex; gap: 4px; flex-wrap: wrap;">
                <button v-if="canUpdateStatus" class="ghost mini" @click="downloadTemplate(item)">提取模板</button>
                <button v-if="canUpdateStatus" class="primary mini" @click="triggerUpload(item)">定制生成</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <input type="file" accept=".docx" ref="fileInput" style="display: none" @change="handleFileUpload" />
    </div>

    <!-- 参数预览弹窗 -->
    <div v-if="previewParams" class="modal-overlay" @click.self="previewParams = null">
      <div class="modal-content" style="max-width: 400px;">
        <h3>用户填报参数</h3>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; text-align: left; overflow: auto; max-height: 300px;">{{ JSON.stringify(previewParams, null, 2) }}</pre>
        <div style="text-align: right; margin-top: 15px;">
          <button @click="previewParams = null" class="primary">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import PermissionButton from "../components/PermissionButton.vue";
import { adminApi } from "../api/adminApi";
import { useAdminStore } from "../stores/adminStore";
import { formatAmount, statusLabel } from "../utils/format";

const store = useAdminStore();

const orders = ref([]);
const editingAmountId = ref(null);
const editingAmount = ref(0);
const editingCountId = ref(null);
const editingCount = ref(5);
const fileInput = ref(null);
const uploadOrderId = ref(null);
const previewParams = ref(null);
const filters = reactive({
  keyword: "",
  status: "",
  startDate: "",
  endDate: ""
});

async function viewParameters(url) {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE || "http://118.178.169.23:38080/api";
    const rootUrl = baseUrl.replace(/\/api\/admin\/?$/, "").replace(/\/api\/?$/, "");
    const res = await fetch(`${rootUrl}${url}`);
    if (res.ok) {
      previewParams.value = await res.json();
    } else {
      store.setNotice("未找到参数数据或已过期", "error");
    }
  } catch(e) {
    store.handleError(e, "读取参数失败");
  }
}

const canUpdateStatus = computed(() => store.hasPermission("mall:order:update,mall:order:view"));

function getTaskUrl(taskId, type) {
  const baseUrl = import.meta.env.VITE_API_BASE || "http://118.178.169.23:38080/api";
  const rootUrl = baseUrl.replace(/\/api\/admin\/?$/, "").replace(/\/api\/?$/, "");
  return `${rootUrl}/api/video/tasks/${taskId}/${type}`;
}

async function downloadTaskFile(taskId, type) {
  try {
    const ext = type === 'image' ? 'png' : type === 'video' ? 'mp4' : 'docx';
    const filename = `${taskId}_${type}.${ext}`;
    const url = getTaskUrl(taskId, type) + "?download=true";
    
    // Use native fetch to stream blob
    const res = await fetch(url);
    if (!res.ok) throw new Error("下载请求失败");
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    store.handleError(error, "文件下载失败");
  }
}

async function loadOrders() {
  try {
    orders.value = await adminApi.getOrders({
      keyword: filters.keyword || undefined,
      status: filters.status || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    });
  } catch (error) {
    store.handleError(error, "加载订单失败");
  }
}

async function changeStatus(item, status) {
  if (!canUpdateStatus.value) {
    return;
  }
  try {
    await adminApi.updateOrder(item.id, { status, amount: item.amount });
    await loadOrders();
    store.setNotice("订单状态已更新", "success");
  } catch (error) {
    store.handleError(error, "更新订单状态失败");
  }
}

function startEditAmount(item) {
  editingAmountId.value = item.id;
  editingAmount.value = item.amount;
}

function cancelEditAmount() {
  editingAmountId.value = null;
}

async function saveAmount(item) {
  try {
    await adminApi.updateOrder(item.id, { status: item.status, amount: editingAmount.value });
    await loadOrders();
    store.setNotice("金额已更新", "success");
    cancelEditAmount();
  } catch (error) {
    store.handleError(error, "更新金额失败");
  }
}

function startEditCount(item) {
  editingCountId.value = item.id;
  editingCount.value = item.maxGenerateCount || 5;
}

function cancelEditCount() {
  editingCountId.value = null;
}

async function saveCount(item) {
  try {
    await adminApi.updateOrder(item.id, { status: item.status, maxGenerateCount: editingCount.value });
    await loadOrders();
    store.setNotice("允许制作次数已更新", "success");
    cancelEditCount();
  } catch (error) {
    store.handleError(error, "更新制作次数失败");
  }
}

async function removeOrder(item) {
  if (!confirm(`确认删除订单【${item.orderNo}】吗？`)) {
    return;
  }
  try {
    await adminApi.deleteOrder(item.id);
    await loadOrders();
    store.setNotice("订单已删除", "success");
  } catch (error) {
    store.handleError(error, "删除订单失败");
  }
}

async function downloadTemplate(item) {
  try {
    const blob = await adminApi.downloadTemplateDocx(item.id);
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `template_order_${item.id}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    store.setNotice("模板下载成功", "success");
  } catch (err) {
    store.handleError(err, "提取模板失败");
  }
}

function triggerUpload(item) {
  uploadOrderId.value = item.id;
  if (fileInput.value) {
    fileInput.value.value = '';
    fileInput.value.click();
  }
}

async function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file || !uploadOrderId.value) return;

  try {
    store.setNotice("正在上传并基于定制文档生成中，请耐心等待数十秒...", "info");
    await adminApi.uploadCustomDocx(uploadOrderId.value, file);
    store.setNotice("后台已成功接收并开始生成，请稍后刷新页面查看生成内容！", "success");
    await loadOrders();
  } catch (err) {
    store.handleError(err, "定制生成失败");
  } finally {
    e.target.value = '';
    uploadOrderId.value = null;
  }
}

onMounted(loadOrders);
</script>
