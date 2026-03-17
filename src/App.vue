<template>
  <div class="admin-shell">
    <NoticeBar />
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import NoticeBar from "./components/NoticeBar.vue";
</script>
