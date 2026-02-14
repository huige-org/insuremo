<template>
  <div class="rich-editor">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      style="border-bottom: 1px solid #ccc"
    />
    <Editor
      :defaultConfig="editorConfig"
      :mode="mode"
      v-model="valueHtml"
      style="height: 400px; overflow-y: hidden"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script setup>
import { shallowRef, computed, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  },
  mode: {
    type: String,
    default: 'default'
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  }
})

// 工具栏配置
const toolbarConfig = {
  excludeKeys: []
}

// 编辑器配置
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1'

const editorConfig = {
  placeholder: props.placeholder,
  MENU_CONF: {
    // 上传图片配置
    uploadImage: {
      server: `${API_BASE}/upload/image?editor=wangeditor`,
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      metaWithUrl: true,
      base64LimitSize: 5 * 1024, // 5kb 以下插入 base64
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      },
      onBeforeUpload(file) {
        console.log('onBeforeUpload', file)
        return file
      },
      onProgress(progress) {
        console.log('onProgress', progress)
      },
      onSuccess(file, res) {
        console.log('onSuccess', file, res)
      },
      onFailed(file, res) {
        console.log('onFailed', file, res)
      },
      onError(file, err, res) {
        console.error('onError', file, err, res)
      }
    },
    // 上传视频配置
    uploadVideo: {
      server: `${API_BASE}/upload/video`,
      fieldName: 'file',
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxNumberOfFiles: 3,
      allowedFileTypes: ['video/*'],
      metaWithUrl: true,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      },
      onBeforeUpload(file) {
        console.log('onBeforeUpload', file)
        return file
      },
      onProgress(progress) {
        console.log('onProgress', progress)
      },
      onSuccess(file, res) {
        console.log('onSuccess', file, res)
      },
      onFailed(file, res) {
        console.log('onFailed', file, res)
      },
      onError(file, err, res) {
        console.error('onError', file, err, res)
      }
    }
  }
}

// 编辑器创建完成
const handleCreated = (editor) => {
  editorRef.value = editor
}

// 内容变化
const handleChange = (editor) => {
  const html = editor.getHtml()
  emit('update:modelValue', html)
  emit('change', html)
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && newVal !== editorRef.value.getHtml()) {
    editorRef.value.setHtml(newVal)
  }
})

// 组件销毁时，也及时销毁编辑器
const handleDestroy = () => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
}

// 暴露方法给父组件
defineExpose({
  editor: editorRef,
  insertText: (text) => {
    editorRef.value?.insertText(text)
  },
  getHtml: () => {
    return editorRef.value?.getHtml()
  },
  getText: () => {
    return editorRef.value?.getText()
  },
  clear: () => {
    editorRef.value?.clear()
  },
  destroy: handleDestroy
})
</script>

<style scoped>
.rich-editor {
  border: 1px solid #ccc;
  z-index: 100;
}

:deep(.w-e-text-container) {
  background-color: #fff;
}

:deep(.w-e-toolbar) {
  background-color: #f8f9fa;
}
</style>
