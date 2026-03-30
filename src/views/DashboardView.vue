<template>
  <div>
    <div class="cards-grid">
      <article class="card">
        <h4>今日销售额</h4>
        <p>￥ {{ formatAmount(overview.todaySalesAmount) }}</p>
      </article>
      <article class="card">
        <h4>累计销售额</h4>
        <p>￥ {{ formatAmount(overview.totalSalesAmount) }}</p>
      </article>
      <article class="card">
        <h4>后台用户数</h4>
        <p>{{ overview.totalUsers || 0 }}</p>
      </article>
      <article class="card">
        <h4>订单总数</h4>
        <p>{{ overview.totalOrders || 0 }}</p>
      </article>
      <article class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <h4>全站微信客服入口</h4>
        <div style="margin-top: 10px;">
          <span style="margin-right: 15px; font-weight: bold; color: var(--primary-color);">{{ isCustomerServiceEnabled ? '🟢 运行中' : '🔴 已关停' }}</span>
          <button class="ghost mini" @click="toggleCustomerService">{{ isCustomerServiceEnabled ? '点击关闭' : '点击开启' }}</button>
        </div>
      </article>
    </div>

    <div class="panel-grid">
      <article class="panel">
        <h4>每日销售趋势</h4>
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>销售额</th>
              <th>已支付订单</th>
              <th>总订单数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in dailySales" :key="row.day">
              <td>{{ row.day }}</td>
              <td>￥ {{ formatAmount(row.salesAmount) }}</td>
              <td>{{ row.paidOrders }}</td>
              <td>{{ row.totalOrders }}</td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="panel">
        <h4>热销模板排行</h4>
        <table>
          <thead>
            <tr>
              <th>模板名称</th>
              <th>支付订单数</th>
              <th>销售额</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in topTemplates" :key="row.templateId">
              <td>{{ row.templateName }}</td>
              <td>{{ row.paidOrders }}</td>
              <td>￥ {{ formatAmount(row.salesAmount) }}</td>
            </tr>
          </tbody>
        </table>
      </article>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { adminApi } from "../api/adminApi";
import { useAdminStore } from "../stores/adminStore";
import { formatAmount } from "../utils/format";

const store = useAdminStore();

const overview = reactive({
  todaySalesAmount: 0,
  totalSalesAmount: 0,
  totalUsers: 0,
  totalOrders: 0
});
const dailySales = ref([]);
const topTemplates = ref([]);

const isCustomerServiceEnabled = ref(false);

async function loadData() {
  try {
    const [overviewData, dailyData, topData, csConfig] = await Promise.all([
      adminApi.getOverview(),
      adminApi.getDailySales(14),
      adminApi.getTopTemplates(10),
      adminApi.getConfig("CUSTOMER_SERVICE_ENABLED").catch(() => ({ value: "false" }))
    ]);
    Object.assign(overview, overviewData || {});
    dailySales.value = dailyData || [];
    topTemplates.value = topData || [];
    isCustomerServiceEnabled.value = String(csConfig.value).toLowerCase() === "true";
  } catch (error) {
    store.handleError(error, "加载看板数据失败");
  }
}

async function toggleCustomerService() {
  const nextVal = !isCustomerServiceEnabled.value ? "true" : "false";
  try {
    await adminApi.setConfig("CUSTOMER_SERVICE_ENABLED", nextVal, "全站微信客服模块总开关");
    isCustomerServiceEnabled.value = nextVal === "true";
    store.setNotice(`已${isCustomerServiceEnabled.value ? '开启' : '关闭'}全站客服系统`, "success");
  } catch (error) {
    store.handleError(error, "切换客服状态失败");
  }
}

onMounted(loadData);
</script>
