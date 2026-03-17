<template>
  <div v-if="notice.text" class="notice" :class="notice.type">
    {{ notice.text }}
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useAdminStore } from "../stores/adminStore";

const store = useAdminStore();
const notice = computed(() => store.state.notice);
</script>
