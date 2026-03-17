<template>
  <section class="layout-page">
    <aside class="sidebar">
      <div class="brand-block">
        <strong>生日视频商城后台</strong>
        <small>运营管理中心</small>
      </div>
      <router-link
        v-for="item in visibleNavItems"
        :key="item.key"
        class="nav-btn"
        :class="{ active: route.path === item.path }"
        :to="item.path"
      >
        {{ item.label }}
      </router-link>
    </aside>

    <main class="main-panel">
      <header class="topbar">
        <div>
          <h3>{{ currentTitle }}</h3>
          <p>{{ currentDescription }}</p>
        </div>
        <div class="topbar-actions">
          <span class="user-pill">当前用户：{{ displayName }}</span>
          <button class="ghost" @click="refreshCurrentView">刷新页面</button>
          <button class="danger" @click="handleLogout">退出登录</button>
        </div>
      </header>

      <section class="content-area">
        <router-view v-slot="{ Component }">
          <component :is="Component" :key="route.fullPath + '-' + refreshKey" />
        </router-view>
      </section>
    </main>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NAV_ITEMS } from "../../constants/navigation";
import { useAdminStore } from "../../stores/adminStore";

const route = useRoute();
const router = useRouter();
const store = useAdminStore();
const refreshKey = ref(0);

const visibleNavItems = computed(() => NAV_ITEMS.filter((item) => store.hasPermission(item.permission)));
const currentTitle = computed(() => route.meta.title || "后台管理");
const currentDescription = computed(() => route.meta.description || "");
const displayName = computed(() => store.state.user?.nickname || store.state.user?.username || "-");

function refreshCurrentView() {
  refreshKey.value += 1;
}

async function handleLogout() {
  await store.logout();
  store.setNotice("已退出登录", "success");
  router.push("/login");
}
</script>
