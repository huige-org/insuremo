<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon blue">
              <el-icon><VideoCamera /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">视频资源</div>
              <div class="stat-value">128</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon green">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">文章资源</div>
              <div class="stat-value">356</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon orange">
              <el-icon><Briefcase /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">案例资源</div>
              <div class="stat-value">89</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon purple">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">系统用户</div>
              <div class="stat-value">45</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>资源统计</span>
          </template>
          <div class="chart-placeholder">
            <el-empty description="图表区域" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>最近活动</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :timestamp="activity.timestamp"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { VideoCamera, Document, Briefcase, User } from '@element-plus/icons-vue'

const videoCount = ref(0)
const articleCount = ref(0)
const caseCount = ref(0)
const userCount = ref(0)
const loading = ref(true)

const activities = ref([
  { content: '系统启动', timestamp: new Date().toLocaleString() }
])

onMounted(async () => {
  try {
    const menus = JSON.parse(localStorage.getItem('menus') || '[]')
    userCount.value = 0
    videoCount.value = 0
    articleCount.value = 0
    caseCount.value = menus.length
  } catch (error) {
    console.error('获取数据失败:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon .el-icon {
  font-size: 30px;
  color: #fff;
}

.stat-icon.blue {
  background-color: #409EFF;
}

.stat-icon.green {
  background-color: #67C23A;
}

.stat-icon.orange {
  background-color: #E6A23C;
}

.stat-icon.purple {
  background-color: #909399;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.chart-row {
  margin-top: 20px;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
