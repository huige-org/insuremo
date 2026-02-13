<template>
  <div class="video-resource">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>视频资源管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增视频
          </el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="视频标题" clearable @keyup.enter="handleSearch" />
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
        <el-table-column prop="title" label="视频标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.category === 'tech'" type="primary">技术教程</el-tag>
            <el-tag v-else-if="row.category === 'product'" type="success">产品演示</el-tag>
            <el-tag v-else-if="row.category === 'case'" type="warning">案例分享</el-tag>
            <el-tag v-else>{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'published'" type="success">已发布</el-tag>
            <el-tag v-else-if="row.status === 'draft'" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 'offline'" type="danger">已下架</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="handleClone(row)">克隆</el-button>
            <el-button link type="success" @click="handlePreview(row)">预览</el-button>
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
      title="视频详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentVideo" class="video-detail">
        <div class="detail-header">
          <h2 class="detail-title">{{ currentVideo.title }}</h2>
          <div class="detail-meta">
            <el-tag :type="getStatusType(currentVideo.status)" size="small">{{ getStatusText(currentVideo.status) }}</el-tag>
            <el-tag type="info" size="small" class="ml-2">{{ getCategoryText(currentVideo.category) }}</el-tag>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              {{ formatDateTime(currentVideo.created_at) }}
            </span>
          </div>
        </div>
        <el-divider />
        <div v-if="currentVideo.cover_url" class="detail-cover">
          <el-image :src="currentVideo.cover_url" fit="cover" style="width: 100%; max-height: 300px;" />
        </div>
        <div v-if="currentVideo.video_url" class="detail-video">
          <video 
            :src="currentVideo.video_url" 
            controls 
            style="width: 100%; max-height: 400px;"
            :poster="currentVideo.cover_url"
          ></video>
        </div>
        <div class="detail-description" v-html="currentVideo.description"></div>
        <div class="detail-stats">
          <span class="stat-item">
            <el-icon><View /></el-icon>
            浏览: {{ currentVideo.view_count || 0 }}
          </span>
          <span class="stat-item">
            <el-icon><Star /></el-icon>
            点赞: {{ currentVideo.like_count || 0 }}
          </span>
          <span class="stat-item">
            <el-icon><Share /></el-icon>
            分享: {{ currentVideo.share_count || 0 }}
          </span>
          <span v-if="currentVideo.duration" class="stat-item">
            <el-icon><Timer /></el-icon>
            时长: {{ formatDuration(currentVideo.duration) }}
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
      width="600px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="视频标题">
          <el-input v-model="form.title" placeholder="请输入视频标题" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="技术教程" value="tech" />
            <el-option label="产品演示" value="product" />
            <el-option label="案例分享" value="case" />
          </el-select>
        </el-form-item>
        <el-form-item label="视频来源">
          <el-radio-group v-model="videoSourceType">
            <el-radio label="url">外部链接</el-radio>
            <el-radio label="upload">本地上传</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="videoSourceType === 'url'" label="视频链接">
          <el-input v-model="form.video_url" placeholder="请输入视频链接（支持优酷、B站、腾讯视频等）" />
        </el-form-item>
        <el-form-item v-else label="视频文件">
          <el-upload
            class="video-uploader"
            action="#"
            accept="video/*"
            :show-file-list="true"
            :auto-upload="true"
            :limit="1"
            :file-list="videoFileList"
            :before-upload="beforeVideoUpload"
            :http-request="handleVideoUpload"
            :on-remove="handleVideoRemove"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>选择视频文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">支持 MP4、WebM、OGG 格式，大小不超过 50MB</div>
            </template>
          </el-upload>
          <div v-if="form.video_url && videoSourceType === 'upload'" class="current-video">
            当前视频：<a :href="form.video_url" target="_blank" style="color: #409EFF;">查看视频</a>
          </div>
        </el-form-item>
          <el-form-item label="封面图">
            <el-upload
              class="avatar-uploader"
              action="#"
              accept="image/*"
              :show-file-list="false"
              :auto-upload="true"
              :before-upload="beforeUpload"
              :http-request="handleCoverUpload"
            >
              <img v-if="form.cover_url" :src="form.cover_url" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">支持 JPG、PNG、GIF 格式，大小不超过 5MB</div>
          </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="published">已发布</el-radio>
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="offline">已下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="描述">
          <RichEditor v-model="form.description" placeholder="请输入视频描述..." style="width: 100%" />
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
import { ref, reactive, onMounted, watch } from 'vue'
import { Plus, Search, Refresh, Upload, Clock, View, Star, Share, Timer } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { videoApi, uploadApi } from '../../api'
import RichEditor from '../../components/RichEditor/index.vue'

const loading = ref(false)
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('新增视频')
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
  category: '',
  video_url: '',
  cover_url: '',
  status: 'draft',
  description: ''
})

const videoSourceType = ref('url')
const viewDialogVisible = ref(false)
const currentVideo = ref(null)
const videoFileList = ref([])

// 监听视频来源类型变化，清空文件列表
watch(videoSourceType, (newVal) => {
  if (newVal === 'url') {
    // 切换到链接时保留当前视频URL，文件列表清空
    videoFileList.value = []
  } else {
    // 切换到上传时，如果已有视频，显示在文件列表中
    if (form.video_url && form.video_url.includes('/uploads/videos/')) {
      videoFileList.value = [{
        name: form.video_url.split('/').pop(),
        url: form.video_url
      }]
    } else {
      videoFileList.value = []
    }
  }
})

const rules = {
  title: [{ required: true, message: '请输入视频标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

const tableData = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await videoApi.getList({ ...pageParams, keyword: searchForm.keyword })
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
  dialogTitle.value = '新增视频'
  videoSourceType.value = 'url'
  videoFileList.value = []
  Object.assign(form, {
    id: null,
    title: '',
    category: '',
    video_url: '',
    cover_url: '',
    status: 'draft',
    description: ''
  })
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑视频'
  try {
    const res = await videoApi.getById(row.id)
    const data = res.data
    // 根据视频URL判断来源类型
    videoSourceType.value = data.video_url && data.video_url.includes('/uploads/videos/') ? 'upload' : 'url'
    // 设置已上传文件列表
    if (videoSourceType.value === 'upload' && data.video_url) {
      videoFileList.value = [{
        name: data.video_url.split('/').pop(),
        url: data.video_url
      }]
    } else {
      videoFileList.value = []
    }
    Object.assign(form, {
      id: data.id,
      title: data.title,
      category: data.category,
      video_url: data.video_url,
      cover_url: data.cover_url,
      status: data.status,
      description: data.description
    })
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error(error.message || '获取详情失败')
  }
}

const handlePreview = (row) => {
  window.open(row.video_url, '_blank')
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除视频"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await videoApi.delete(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await videoApi.update(form.id, form)
    } else {
      await videoApi.create(form)
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
    if (res.success) {
      form.cover_url = res.data.url
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '上传失败')
  }
}

// 视频上传前校验
const beforeVideoUpload = (file) => {
  const isVideo = file.type.startsWith('video/')
  const isLt50M = file.size / 1024 / 1024 < 50

  if (!isVideo) {
    ElMessage.error('只能上传视频文件!')
    return false
  }
  if (!isLt50M) {
    ElMessage.error('视频大小不能超过 50MB!')
    return false
  }
  return true
}

// 处理视频上传
const handleVideoUpload = async ({ file }) => {
  try {
    const res = await uploadApi.uploadVideo(file)
    if (res.success) {
      form.video_url = res.data.url
      ElMessage.success('视频上传成功')
    } else {
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    ElMessage.error(error.message || '上传失败')
  }
}

// 处理视频移除
const handleVideoRemove = () => {
  form.video_url = ''
}

const handleView = async (row) => {
  try {
    const res = await videoApi.getById(row.id)
    currentVideo.value = res.data
    viewDialogVisible.value = true
  } catch (error) {
    ElMessage.error(error.message || '获取详情失败')
  }
}

const handleEditFromView = () => {
  viewDialogVisible.value = false
  handleEdit(currentVideo.value)
}

const handleClone = async (row) => {
  try {
    const res = await videoApi.getById(row.id)
    const videoData = res.data
    
    // 准备克隆数据
    const cloneData = {
      title: videoData.title + '_副本',
      category: videoData.category,
      video_url: videoData.video_url,
      cover_url: videoData.cover_url,
      description: videoData.description,
      status: 'draft'
    }
    
    await videoApi.create(cloneData)
    ElMessage.success('克隆成功')
    fetchData()
  } catch (error) {
    ElMessage.error(error.message || '克隆失败')
  }
}

const handlePreviewFromView = () => {
  window.open(currentVideo.value.video_url || `#/video/${currentVideo.value.id}`, '_blank')
}

const getStatusType = (status) => {
  const map = {
    published: 'success',
    draft: 'info',
    offline: 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    published: '已发布',
    draft: '草稿',
    offline: '已下架'
  }
  return map[status] || status
}

const getCategoryText = (category) => {
  const map = {
    tech: '技术教程',
    product: '产品演示',
    case: '案例分享'
  }
  return map[category] || category
}

const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
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

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.video-resource {
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

.video-uploader {
  width: 100%;
}

.video-uploader .el-upload {
  width: 100%;
}

.video-uploader .el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}

.current-video {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.video-detail {
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

.detail-cover {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
}

.detail-video {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
}

.detail-description {
  line-height: 1.8;
  color: #606266;
  font-size: 14px;
  padding: 20px 0;
}

.detail-description :deep(img) {
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
