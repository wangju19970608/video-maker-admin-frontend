<template>
  <div>
    <div class="toolbar">
      <label>
        统计天数
        <select v-model.number="days">
          <option :value="7">7天</option>
          <option :value="14">14天</option>
          <option :value="30">30天</option>
        </select>
      </label>
      <button class="ghost" @click="loadData">刷新统计</button>
    </div>

    <div class="panel-grid">
      <article class="panel">
        <h4>每日销售明细</h4>
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>销售额</th>
              <th>已支付订单</th>
              <th>总订单</th>
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
        <h4>模板销售排行</h4>
        <table>
          <thead>
            <tr>
              <th>模板</th>
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
import { onMounted, ref, watch } from "vue";
import { adminApi } from "../api/adminApi";
import { useAdminStore } from "../stores/adminStore";
import { formatAmount } from "../utils/format";

const store = useAdminStore();
const days = ref(14);
const dailySales = ref([]);
const topTemplates = ref([]);

async function loadData() {
  try {
    const [dailyData, topData] = await Promise.all([
      adminApi.getDailySales(days.value),
      adminApi.getTopTemplates(20)
    ]);
    dailySales.value = dailyData || [];
    topTemplates.value = topData || [];
  } catch (error) {
    store.handleError(error, "加载销售统计失败");
  }
}

watch(days, loadData);
onMounted(loadData);
</script>
