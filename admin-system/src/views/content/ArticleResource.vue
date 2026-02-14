<template>
  <div class="article-resource">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文章资源管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>新增文章
          </el-button>
        </div>
      </template>
      
      <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="文章标题" clearable @keyup.enter="handleSearch" />
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
        <el-table-column prop="title" label="文章标题" min-width="250" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.category === 'tech'" type="primary">技术文章</el-tag>
            <el-tag v-else-if="row.category === 'news'" type="success">新闻资讯</el-tag>
            <el-tag v-else-if="row.category === 'industry'" type="warning">行业动态</el-tag>
            <el-tag v-else>{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author" label="作者" width="120" />
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
      title="文章详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="currentArticle" class="article-detail">
        <div class="detail-header">
          <h2 class="detail-title">{{ currentArticle.title }}</h2>
          <div class="detail-meta">
            <el-tag :type="getStatusType(currentArticle.status)" size="small">{{ getStatusText(currentArticle.status) }}</el-tag>
            <el-tag type="info" size="small" class="ml-2">{{ getCategoryText(currentArticle.category) }}</el-tag>
            <span class="meta-item">
              <el-icon><User /></el-icon>
              {{ currentArticle.author || '-' }}
            </span>
            <span class="meta-item">
              <el-icon><Clock /></el-icon>
              {{ formatDateTime(currentArticle.created_at) }}
            </span>
          </div>
        </div>
        <el-divider />
        <div v-if="currentArticle.cover" class="detail-cover">
          <el-image :src="currentArticle.cover" fit="cover" style="width: 100%; max-height: 300px;" />
        </div>
        <div class="detail-content" v-html="currentArticle.content"></div>
        <div class="detail-stats">
          <span class="stat-item">
            <el-icon><View /></el-icon>
            浏览: {{ currentArticle.view_count || 0 }}
          </span>
          <span class="stat-item">
            <el-icon><Star /></el-icon>
            点赞: {{ currentArticle.like_count || 0 }}
          </span>
          <span class="stat-item">
            <el-icon><Share /></el-icon>
            分享: {{ currentArticle.share_count || 0 }}
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
      width="900px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="文章标题">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="分类">
              <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
                <el-option label="技术文章" value="tech" />
                <el-option label="新闻资讯" value="news" />
                <el-option label="行业动态" value="industry" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="作者">
              <el-input v-model="form.author" placeholder="请输入作者" />
            </el-form-item>
          </el-col>
        </el-row>
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
            <img v-if="form.cover" :src="form.cover" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持 JPG、PNG、GIF 格式，大小不超过 5MB</div>
        </el-form-item>
        <el-form-item label="文章内容">
          <RichEditor v-model="form.content" placeholder="请输入文章内容..." style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="published">已发布</el-radio>
            <el-radio label="draft">草稿</el-radio>
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
import RichEditor from '../../components/RichEditor/index.vue'
import { articleApi, uploadApi } from '../../api'

const loading = ref(false)
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('新增文章')
const isEdit = ref(false)
const formRef = ref(null)
const viewDialogVisible = ref(false)
const currentArticle = ref(null)

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
  author: '',
  cover: '',
  content: '',
  status: 'draft'
})

const rules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }]
}

const tableData = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await articleApi.getList({ ...pageParams, keyword: searchForm.keyword })
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
  dialogTitle.value = '新增文章'
  Object.assign(form, {
    id: null,
    title: '',
    category: '',
    author: '',
    cover: '',
    content: '',
    status: 'draft'
  })
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑文章'
  try {
    const res = await articleApi.getById(row.id)
    const data = res.data
    Object.assign(form, {
      id: data.id,
      title: data.title,
      category: data.category,
      author: data.author,
      cover: data.cover_url || data.cover || '',
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
    const res = await articleApi.getById(row.id)
    currentArticle.value = res.data
    viewDialogVisible.value = true
  } catch (error) {
    ElMessage.error(error.message || '获取详情失败')
  }
}

const handleEditFromView = () => {
  viewDialogVisible.value = false
  handleEdit(currentArticle.value)
}

const handleClone = async (row) => {
  try {
    const res = await articleApi.getById(row.id)
    const articleData = res.data
    
    // 准备克隆数据
    const cloneData = {
      title: articleData.title + '_副本',
      category: articleData.category,
      author: articleData.author,
      cover: articleData.cover,
      content: articleData.content,
      status: 'draft'
    }
    
    await articleApi.create(cloneData)
    ElMessage.success('克隆成功')
    fetchData()
  } catch (error) {
    ElMessage.error(error.message || '克隆失败')
  }
}

const handlePreviewFromView = () => {
  window.open(currentArticle.value.url || `#/article/${currentArticle.value.id}`, '_blank')
}

const handlePreview = (row) => {
  window.open(row.url || `#/article/${row.id}`, '_blank')
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
    tech: '技术文章',
    news: '新闻资讯',
    industry: '行业动态'
  }
  return map[category] || category
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除文章"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await articleApi.delete(row.id)
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
      await articleApi.update(form.id, form)
    } else {
      await articleApi.create(form)
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

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.article-resource {
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

.article-detail {
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

.detail-content {
  line-height: 1.8;
  color: #606266;
  font-size: 14px;
  padding: 20px 0;
}

.detail-content :deep(img) {
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
