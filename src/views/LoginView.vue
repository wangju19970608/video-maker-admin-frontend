<template>
  <section class="login-page">
    <div class="login-card">
      <h1>生日视频商城后台</h1>
<!--      <p>默认管理员账号：admin / Admin@123456</p>-->
      <label>
        用户名
        <input v-model.trim="loginForm.username" autocomplete="username" />
      </label>
      <label>
        密码
        <input v-model="loginForm.password" type="password" autocomplete="current-password" @keyup.enter="submitLogin" />
      </label>
      <button :disabled="loading" @click="submitLogin">
        {{ loading ? "登录中..." : "登录" }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { NAV_ITEMS } from "../constants/navigation";
import { useAdminStore } from "../stores/adminStore";

const route = useRoute();
const router = useRouter();
const store = useAdminStore();

const loading = ref(false);
const loginForm = reactive({
  username: "",
  password: ""
});

function firstAccessiblePath() {
  const found = NAV_ITEMS.find((item) => store.hasPermission(item.permission));
  return found?.path || "/dashboard";
}

async function submitLogin() {
  loading.value = true;
  try {
    await store.login(loginForm);
    store.setNotice("登录成功", "success");

    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "";
    router.replace(redirect || firstAccessiblePath());
  } catch (error) {
    store.handleError(error, "登录失败");
  } finally {
    loading.value = false;
  }
}
</script>
