<template>
  <div class="profile-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>个人中心</span>
        </div>
      </template>
      
      <el-row :gutter="40">
        <el-col :span="8" class="avatar-col">
          <div class="avatar-wrapper">
            <el-avatar :size="120" :src="form.avatar_url || defaultAvatar" />
            <el-upload
              class="avatar-upload"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="handleAvatarUpload"
            >
              <el-button type="primary" size="small">更换头像</el-button>
            </el-upload>
          </div>
        </el-col>
        
        <el-col :span="16">
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
          >
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" disabled />
            </el-form-item>
            
            <el-form-item label="昵称" prop="full_name">
              <el-input v-model="form.full_name" placeholder="请输入昵称" />
            </el-form-item>
            
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="loading">保存</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { profileApi, uploadApi } from '../api'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

const form = reactive({
  email: '',
  full_name: '',
  phone: '',
  avatar_url: ''
})

const rules = {
  full_name: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

onMounted(() => {
  const user = userStore.state.user
  if (user) {
    form.email = user.email || ''
    form.full_name = user.full_name || ''
    form.phone = user.phone || ''
    form.avatar_url = user.avatar_url || ''
  }
})

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

const handleAvatarUpload = async ({ file }) => {
  try {
    const res = await uploadApi.uploadImage(file)
    const url = res.errno === 0 ? res.data?.url : res.url
    if (url) {
      form.avatar_url = url
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '上传失败')
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      await profileApi.updateProfile({
        full_name: form.full_name,
        phone: form.phone,
        avatar_url: form.avatar_url
      })
      
      userStore.setUser({
        ...userStore.state.user,
        full_name: form.full_name,
        phone: form.phone,
        avatar_url: form.avatar_url
      })
      
      ElMessage.success('保存成功')
    } catch (error) {
      ElMessage.error(error.message || '保存失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.profile-page {
  max-width: 800px;
}

.card-header {
  font-size: 18px;
  font-weight: 600;
}

.avatar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.avatar-upload {
  margin-top: 10px;
}
</style>
