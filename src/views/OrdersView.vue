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
              <div v-if="item.taskId" style="display: flex; gap: 4px; flex-wrap: wrap;">
                <a :href="getTaskUrl(item.taskId, 'image')" target="_blank" class="action-btn ghost mini">预览图片</a>
                <a :href="getTaskUrl(item.taskId, 'video')" target="_blank" class="action-btn ghost mini">预览视频</a>
                <a :href="getTaskUrl(item.taskId, 'image') + '?download=1'" download class="action-btn primary mini">下载图片</a>
                <a :href="getTaskUrl(item.taskId, 'video')" target="_blank" download class="action-btn primary mini">下载视频</a>
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
import { formatAmount, statusLabel } from "../utils/format";

const store = useAdminStore();

const orders = ref([]);
const editingAmountId = ref(null);
const editingAmount = ref(0);
const filters = reactive({
  keyword: "",
  status: "",
  startDate: "",
  endDate: ""
});

const canUpdateStatus = computed(() => store.hasPermission("mall:order:update,mall:order:view"));

function getTaskUrl(taskId, type) {
  const baseUrl = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";
  const rootUrl = baseUrl.replace(/\/api\/admin\/?$/, "").replace(/\/api\/?$/, "");
  return `${rootUrl}/api/video/tasks/${taskId}/${type}`;
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

onMounted(loadOrders);
</script>
