<template>
  <div class="config-editor">
    <div class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'overlay' }]" @click="activeTab = 'overlay'">叠加规则</button>
      <button :class="['tab-btn', { active: activeTab === 'form' }]" @click="activeTab = 'form'">表单字段</button>
    </div>

    <!-- 叠加规则 Tab -->
    <div v-if="activeTab === 'overlay'" class="tab-content">
      <div class="upload-row">
        <label class="file-label">
          上传模板视频（上传后自动AI分析）
          <input type="file" accept="video/*" @change="handleVideoUpload" :disabled="analyzing" />
        </label>
        <span v-if="analyzing" class="analyzing-badge">🤖 AI分析中...</span>
      </div>
      <div v-if="analyzeMsg" class="analyze-msg" :class="analyzeMsgType">{{ analyzeMsg }}</div>

      <div class="section-header">
        <span>叠加规则</span>
        <button class="mini" @click="addOverlayRule">+ 添加</button>
      </div>

      <div v-for="(rule, idx) in config.overlayRules" :key="idx" class="rule-card">
        <div class="rule-card-header">
          <span>规则 #{{ idx + 1 }} — {{ rule.type || 'text' }}</span>
          <button class="mini danger" @click="removeOverlayRule(idx)">删除</button>
        </div>
        <div class="rule-grid">
          <label>
            类型
            <select v-model="rule.type">
              <option value="text">text（文字）</option>
              <option value="image">image（图片）</option>
            </select>
          </label>
          <label>
            字段Key
            <input v-model="rule.key" placeholder="name / age / photo..." />
          </label>
          <label>
            开始时间(s)
            <input v-model.number="rule.startTime" type="number" step="0.1" />
          </label>
          <label>
            结束时间(s)
            <input v-model.number="rule.endTime" type="number" step="0.1" />
          </label>
          <label>
            X坐标（0~1比例）
            <input v-model.number="rule.x" type="number" step="0.01" min="0" max="1" />
          </label>
          <label>
            Y坐标（0~1比例）
            <input v-model.number="rule.y" type="number" step="0.01" min="0" max="1" />
          </label>
          <template v-if="rule.type === 'text'">
            <label>
              字体大小
              <input v-model.number="rule.fontSize" type="number" />
            </label>
            <label>
              字体颜色
              <input v-model="rule.fontColor" placeholder="#ffffff" />
            </label>
          </template>
          <template v-if="rule.type === 'image'">
            <label>
              宽度（0~1比例）
              <input v-model.number="rule.width" type="number" step="0.01" min="0" max="1" />
            </label>
            <label>
              高度（0~1比例）
              <input v-model.number="rule.height" type="number" step="0.01" min="0" max="1" />
            </label>
          </template>
        </div>
      </div>
      <div v-if="config.overlayRules.length === 0" class="empty-tip">暂无叠加规则，点击 + 添加或使用AI分析自动生成</div>
    </div>

    <!-- 表单字段 Tab -->
    <div v-if="activeTab === 'form'" class="tab-content">
      <div class="section-header">
        <span>表单字段</span>
        <button class="mini" @click="addFormField">+ 添加</button>
      </div>

      <div v-for="(field, idx) in config.formFields" :key="idx" class="rule-card">
        <div class="rule-card-header">
          <span>字段 #{{ idx + 1 }} — {{ field.label || field.key }}</span>
          <button class="mini danger" @click="removeFormField(idx)">删除</button>
        </div>
        <div class="rule-grid">
          <label>
            字段Key
            <input v-model="field.key" placeholder="name / age / photo..." />
          </label>
          <label>
            标签
            <input v-model="field.label" placeholder="显示名称" />
          </label>
          <label>
            类型
            <select v-model="field.type">
              <option value="text">text（文本）</option>
              <option value="image">image（图片上传）</option>
              <option value="number">number（数字）</option>
              <option value="date">date（日期）</option>
            </select>
          </label>
          <label>
            提示语
            <input v-model="field.placeholder" placeholder="请输入..." />
          </label>
          <label>
            必填
            <select v-model="field.required">
              <option :value="true">是</option>
              <option :value="false">否</option>
            </select>
          </label>
        </div>
      </div>
      <div v-if="config.formFields.length === 0" class="empty-tip">暂无表单字段，点击 + 添加</div>
    </div>

    <div class="editor-footer">
      <button @click="save" :disabled="saving">{{ saving ? '保存中...' : '保存配置' }}</button>
      <button class="ghost" @click="$emit('cancel')">取消</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { adminApi } from '../api/adminApi';
import { useAdminStore } from '../stores/adminStore';

const props = defineProps({
  templateId: { type: Number, required: true }
});
const emit = defineEmits(['cancel', 'saved']);

const store = useAdminStore();
const activeTab = ref('overlay');
const analyzing = ref(false);
const analyzeMsg = ref('');
const analyzeMsgType = ref('');
const saving = ref(false);

const config = reactive({
  overlayRules: [],
  formFields: []
});

async function load() {
  try {
    const data = await adminApi.getTemplateConfig(props.templateId);
    if (data) {
      config.overlayRules = Array.isArray(data.overlayRules) ? data.overlayRules : [];
      config.formFields = Array.isArray(data.formFields) ? data.formFields : [];
    }
  } catch (e) {
    // 新模板可能还没有配置，忽略404
  }
}

load();

function addOverlayRule() {
  config.overlayRules.push({ type: 'text', key: '', startTime: 0, endTime: 999, x: 0.5, y: 0.5, fontSize: 60, fontColor: '#ffffff' });
}

function removeOverlayRule(idx) {
  config.overlayRules.splice(idx, 1);
}

function addFormField() {
  config.formFields.push({ key: '', label: '', type: 'text', placeholder: '', required: true });
}

function removeFormField(idx) {
  config.formFields.splice(idx, 1);
}

async function handleVideoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    analyzeMsg.value = '视频上传中...';
    analyzeMsgType.value = '';
    analyzing.value = true;
    await adminApi.uploadTemplateVideo(props.templateId, file);
    analyzeMsg.value = 'AI分析中，请稍候...';
    await pollAnalysisStatus();
  } catch (err) {
    analyzeMsg.value = '上传失败：' + (err?.message || '未知错误');
    analyzeMsgType.value = 'error';
    analyzing.value = false;
  }
  e.target.value = '';
}

async function pollAnalysisStatus() {
  const maxWait = 120000;
  const interval = 2000;
  const startAt = Date.now();
  while (Date.now() - startAt < maxWait) {
    await new Promise(r => setTimeout(r, interval));
    try {
      const data = await adminApi.getTemplateConfig(props.templateId);
      if (data.analysisStatus === 'done') {
        if (Array.isArray(data.overlayRules)) config.overlayRules = data.overlayRules;
        if (Array.isArray(data.formFields)) config.formFields = data.formFields;
        analyzeMsg.value = 'AI分析完成，规则已自动填入';
        analyzeMsgType.value = 'success';
        analyzing.value = false;
        return;
      }
      if (data.analysisStatus === 'failed') {
        analyzeMsg.value = 'AI分析失败：' + (data.analysisError || '未知错误');
        analyzeMsgType.value = 'error';
        analyzing.value = false;
        return;
      }
    } catch (_) {}
  }
  analyzeMsg.value = 'AI分析超时，请稍后刷新查看';
  analyzeMsgType.value = 'error';
  analyzing.value = false;
}

async function save() {
  saving.value = true;
  try {
    await adminApi.saveTemplateConfig(props.templateId, {
      overlayRules: JSON.stringify(config.overlayRules),
      formFields: JSON.stringify(config.formFields)
    });
    store.setNotice('配置保存成功', 'success');
    emit('saved');
  } catch (err) {
    store.handleError(err, '保存配置失败');
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.config-editor { display: flex; flex-direction: column; gap: 16px; }

.tabs { display: flex; gap: 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
.tab-btn { padding: 6px 16px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f9fafb; cursor: pointer; font-size: 14px; }
.tab-btn.active { background: #1d4ed8; color: #fff; border-color: #1d4ed8; }

.tab-content { display: flex; flex-direction: column; gap: 12px; }

.upload-row { display: flex; align-items: center; gap: 12px; }
.file-label { font-size: 14px; display: flex; flex-direction: column; gap: 4px; }
.analyze-btn { padding: 8px 16px; background: #7c3aed; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.analyze-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.analyzing-badge { font-size: 13px; color: #7c3aed; font-weight: 600; animation: pulse 1.5s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.analyze-msg { font-size: 13px; padding: 8px 12px; border-radius: 6px; background: #f3f4f6; }
.analyze-msg.success { background: #dcfce7; color: #166534; }
.analyze-msg.error { background: #fee2e2; color: #991b1b; }

.section-header { display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 14px; }

.rule-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.rule-card-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #6b7280; }

.rule-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; }
.rule-grid label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
.rule-grid input, .rule-grid select { padding: 5px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; }

.empty-tip { text-align: center; color: #9ca3af; font-size: 13px; padding: 20px; }

.editor-footer { display: flex; gap: 10px; padding-top: 8px; border-top: 1px solid #e5e7eb; }
.editor-footer button { padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; }
.editor-footer button:first-child { background: #1d4ed8; color: #fff; border: none; }
.editor-footer button:first-child:disabled { opacity: 0.6; cursor: not-allowed; }
.editor-footer button.ghost { background: transparent; border: 1px solid #d1d5db; }

button.mini { padding: 3px 10px; font-size: 12px; border-radius: 4px; border: 1px solid #d1d5db; background: #f9fafb; cursor: pointer; }
button.mini.danger { border-color: #fca5a5; color: #dc2626; background: #fff; }
</style>
