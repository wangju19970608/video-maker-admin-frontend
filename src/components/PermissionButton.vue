<template>
  <button v-if="visible" v-bind="$attrs" @click="onClick">
    <slot />
  </button>
</template>

<script setup>
import { computed } from "vue";
import { useAdminStore } from "../stores/adminStore";

defineOptions({
  inheritAttrs: false
});

const props = defineProps({
  permission: {
    type: [String, Array],
    default: ""
  }
});

const emit = defineEmits(["click"]);
const store = useAdminStore();

const visible = computed(() => store.hasPermission(props.permission));

function onClick(event) {
  emit("click", event);
}
</script>
