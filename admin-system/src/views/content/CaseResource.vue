<template>
  <div class="case-resource">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>案例资源管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增案例
          </el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="案例名称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column prop="title" label="案例名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="industry" label="行业" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.industry === 'internet'" type="primary">互联网</el-tag>
            <el-tag v-else-if="row.industry === 'finance'" type="success">金融</el-tag>
            <el-tag v-else-if="row.industry === 'education'" type="warning">教育</el-tag>
            <el-tag v-else-if="row.industry === 'medical'" type="danger">医疗</el-tag>
            <el-tag v-else-if="row.industry === 'manufacturing'">制造</el-tag>
            <el-tag v-else>{{ row.industry }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="client" label="客户" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'published'" type="success">已发布</el-tag>
            <el-tag v-else-if="row.status === 'reviewing'" type="warning">审核中</el-tag>
            <el-tag v-else-if="row.status === 'offline'" type="info">已下架</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="340" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="handleClone(row)">克隆</el-button>
            <el-button link type="success" @click="handlePreview(row)">预览</el-button>
            <el-button v-if="row.status === 'published'" link type="warning" @click="handleOffline(row)">下架</el-button>
            <el-button v-else link type="success" @click="handlePublish(row)">发布</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pageParams.page"
          v-model:page-size="pageParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 查看详情弹窗 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="案例详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentCase" class="case-detail">
          <div class="detail-header">
          <h2 class="detail-title">{{ currentCase.title }}</h2>
          <div class="detail-meta">
            <el-tag :type="getStatusType(currentCase.status)" size="small">{{ getStatusText(currentCase.status) }}</el-tag>
            <el-tag type="info" size="small" class="ml-2">{{ getIndustryText(currentCase.industry) }}</el-tag>
            <span class="meta-item">
              <el-icon><User /></el-icon>
              客户: {{ currentCase.client || '-' }}
            </span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              {{ formatDateTime(currentCase.created_at) }}
            </span>
          </div>
        </div>
        <el-divider />
        <div class="detail-info">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">项目周期:</span>
                <span class="info-value">{{ currentCase.duration || '-' }}</span>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="info-item">
                <span class="info-label">完成时间:</span>
                <span class="info-value">{{ formatDate(currentCase.completionDate) || '-' }}</span>
              </div>
            </el-col>
          </el-row>
        </div>
        <div v-if="currentCase.cover" class="detail-cover">
          <el-image :src="currentCase.cover" fit="cover" style="width: 100%; max-height: 300px;" />
        </div>
        <div class="detail-section">
          <h3 class="section-title">案例简介</h3>
          <div class="section-content" v-html="currentCase.summary"></div>
        </div>
        <div class="detail-section">
          <h3 class="section-title">案例详情</h3>
          <div class="section-content" v-html="currentCase.content"></div>
        </div>
        <div class="detail-stats">
          <span class="stat-item">
            <el-icon><View /></el-icon>
            浏览: {{ currentCase.view_count || 0 }}
          </span>
          <span class="stat-item">
            <el-icon><Star /></el-icon>
            点赞: {{ currentCase.like_count || 0 }}
          </span>
          <span class="stat-item">
            <el-icon><Share /></el-icon>
            分享: {{ currentCase.share_count || 0 }}
          </span>
        </div>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEditFromView">编辑</el-button>
        <el-button type="success" @click="handlePreviewFromView">在新窗口预览</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="700px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="案例名称">
          <el-input v-model="form.title" placeholder="请输入案例名称" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="行业">
              <el-select v-model="form.industry" placeholder="请选择行业" style="width: 100%">
                <el-option label="互联网" value="internet" />
                <el-option label="金融" value="finance" />
                <el-option label="教育" value="education" />
                <el-option label="医疗" value="medical" />
                <el-option label="制造" value="manufacturing" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户名称">
              <el-input v-model="form.client" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="完成时间">
              <el-date-picker
                v-model="form.completionDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目周期">
              <el-input v-model="form.duration" placeholder="如：3个月" />
            </el-form-item>
          </el-col>
        </el-row>
          <el-form-item label="案例封面">
            <el-upload
              class="avatar-uploader"
              action="#"
              accept="image/*"
              :show-file-list="false"
              :auto-upload="true"
              :before-upload="beforeUpload"
              :http-request="handleCoverUpload"
            >
              <img v-if="form.cover" :src="form.cover" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">支持 JPG、PNG、GIF 格式，大小不超过 5MB</div>
          </el-form-item>
        <el-form-item label="案例简介">
          <RichEditor v-model="form.summary" placeholder="请输入案例简介..." style="width: 100%" />
        </el-form-item>
        <el-form-item label="案例详情">
          <RichEditor v-model="form.content" placeholder="请输入案例详情..." style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="published">已发布</el-radio>
            <el-radio label="reviewing">审核中</el-radio>
            <el-radio label="offline">已下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search, Refresh, User, Clock, View, Star, Share } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { caseApi, uploadApi } from '../../api'
import RichEditor from '../../components/RichEditor/index.vue'

const loading = ref(false)
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('新增案例')
const isEdit = ref(false)
const formRef = ref(null)

const searchForm = reactive({
  keyword: ''
})

const pageParams = reactive({
  page: 1,
  pageSize: 10
})

const form = reactive({
  id: null,
  title: '',
  industry: '',
  client: '',
  completionDate: '',
  duration: '',
  cover: '',
  summary: '',
  content: '',
  status: 'reviewing'
})

const viewDialogVisible = ref(false)
const currentCase = ref(null)

const rules = {
  title: [{ required: true, message: '请输入案例名称', trigger: 'blur' }]
}

const tableData = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await caseApi.getList({ ...pageParams, keyword: searchForm.keyword })
    tableData.value = res.data || []
    total.value = res.meta?.total || 0
  } catch (error) {
    ElMessage.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pageParams.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增案例'
  Object.assign(form, {
    id: null,
    title: '',
    industry: '',
    client: '',
    completionDate: '',
    duration: '',
    cover: '',
    summary: '',
    content: '',
    status: 'reviewing'
  })
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑案例'
  try {
    const res = await caseApi.getById(row.id)
    const data = res.data
    Object.assign(form, {
      id: data.id,
      title: data.title,
      industry: data.industry,
      client: data.company_name || data.client || '',
      completionDate: data.completionDate ? new Date(data.completionDate) : null,
      duration: data.duration,
      cover: data.cover_url || data.cover || '',
      summary: data.summary,
      content: data.content,
      status: data.status
    })
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error(error.message || '获取详情失败')
  }
}

const handleView = async (row) => {
  try {
    const res = await caseApi.getById(row.id)
    currentCase.value = res.data
    viewDialogVisible.value = true
  } catch (error) {
    ElMessage.error(error.message || '获取详情失败')
  }
}

const handleEditFromView = () => {
  viewDialogVisible.value = false
  handleEdit(currentCase.value)
}

const handlePreviewFromView = () => {
  window.open(currentCase.value.url || `#/case/${currentCase.value.id}`, '_blank')
}

const handlePreview = (row) => {
  window.open(row.url || `#/case/${row.id}`, '_blank')
}

const getStatusType = (status) => {
  const map = {
    published: 'success',
    reviewing: 'warning',
    offline: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    published: '已发布',
    reviewing: '审核中',
    offline: '已下架'
  }
  return map[status] || status
}

const getIndustryText = (industry) => {
  const map = {
    internet: '互联网',
    finance: '金融',
    education: '教育',
    medical: '医疗',
    manufacturing: '制造'
  }
  return map[industry] || industry
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除案例"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await caseApi.delete(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

const handlePublish = async (row) => {
  try {
    await caseApi.update(row.id, { status: 'published' })
    ElMessage.success('发布成功')
    fetchData()
  } catch (error) {
    ElMessage.error(error.message || '发布失败')
  }
}

const handleOffline = async (row) => {
  try {
    await caseApi.update(row.id, { status: 'offline' })
    ElMessage.success('下架成功')
    fetchData()
  } catch (error) {
    ElMessage.error(error.message || '下架失败')
  }
}

const handleClone = async (row) => {
  try {
    const res = await caseApi.getById(row.id)
    const caseData = res.data
    
    // 准备克隆数据
    const cloneData = {
      title: caseData.title + '_副本',
      industry: caseData.industry,
      client: caseData.company_name || caseData.client || '',
      completionDate: caseData.completionDate,
      duration: caseData.duration,
      cover: caseData.cover_url || caseData.cover || '',
      summary: caseData.summary,
      content: caseData.content,
      status: 'reviewing'
    }
    
    await caseApi.create(cloneData)
    ElMessage.success('克隆成功')
    fetchData()
  } catch (error) {
    ElMessage.error(error.message || '克隆失败')
  }
}

const handleSubmit = async () => {
  try {
    // 处理日期格式
    const submitData = {
      ...form,
      completionDate: form.completionDate ? new Date(form.completionDate).toISOString() : null
    }
    
    if (isEdit.value) {
      await caseApi.update(form.id, submitData)
    } else {
      await caseApi.create(submitData)
    }
    ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleSizeChange = (val) => {
  pageParams.pageSize = val
  fetchData()
}

const handleCurrentChange = (val) => {
  pageParams.page = val
  fetchData()
}

// 上传前校验
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

// 处理封面上传
const handleCoverUpload = async ({ file }) => {
  try {
    const res = await uploadApi.uploadImage(file)
    const url = res.errno === 0 ? res.data?.url : res.url
    if (url) {
      form.cover = url
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '上传失败')
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  if (isNaN(date.getTime())) return '-'
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 格式化日期
const formatDate = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  if (isNaN(date.getTime())) return ''
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.case-resource {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 178px;
  height: 178px;
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.5;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.case-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-header {
  margin-bottom: 20px;
}

.detail-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #909399;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.detail-info {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-label {
  color: #909399;
  font-size: 14px;
}

.info-value {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.detail-cover {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
}

.detail-section {
  margin: 20px 0;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.section-content {
  line-height: 1.8;
  color: #606266;
  font-size: 14px;
}

.section-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.detail-stats {
  display: flex;
  gap: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
