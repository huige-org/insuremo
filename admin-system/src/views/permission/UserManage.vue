<template>
  <div class="user-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon>
              <Plus />
            </el-icon>新增用户
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="邮箱/昵称" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon>
              <Search />
            </el-icon>查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon>
              <Refresh />
            </el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="roles" label="角色" min-width="150">
          <template #default="{ row }">
            <el-tag v-for="roleCode in row.roles" :key="roleCode" size="small" style="margin-right: 5px">
              {{ getRoleName(roleCode) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success">启用</el-tag>
            <el-tag v-else-if="row.status === 'inactive'" type="info">禁用</el-tag>
            <el-tag v-else-if="row.status === 'banned'" type="danger">封禁</el-tag>
            <el-tag v-else>{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleResetPwd(row)">重置密码</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination v-model:current-page="pageParams.page" v-model:page-size="pageParams.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="80px" :rules="rules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="full_name">
              <el-input v-model="form.full_name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog v-model="pwdDialogVisible" title="重置密码" width="400px">
      <el-form :model="pwdForm" label-width="100px" :rules="pwdRules" ref="pwdFormRef">
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleResetPwdSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi, roleApi, authApi } from '../../api'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

const loading = ref(false)
const total = ref(0)
const dialogVisible = ref(false)
const pwdDialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const isEdit = ref(false)
const currentUser = ref(null)

const roles = ref([])

const searchForm = reactive({
  keyword: ''
})

const pageParams = reactive({
  page: 1,
  pageSize: 10
})

const form = reactive({
  id: null,
  email: '',
  full_name: '',
  phone: '',
  roleIds: [],
  status: 'active'
})

const pwdForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  full_name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const pwdRules = {
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }, { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }]
}

const tableData = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await userApi.getList({ ...pageParams, keyword: searchForm.keyword })
    tableData.value = res.data || []
    total.value = res.meta?.total || 0
  } catch (error) {
    ElMessage.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const res = await roleApi.getList({ page: 1, pageSize: 100 })
    roles.value = res.data || []
  } catch (error) {
    console.error('获取角色失败:', error)
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
  dialogTitle.value = '新增用户'

  form.id = null
  form.email = ''
  form.full_name = ''
  form.phone = ''
  form.roleIds = []
  form.status = 'active'
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑用户'
  try {
    const res = await userApi.getById(row.id)
    // Map role codes to role IDs by finding matching roles
    const roleIds = res.data.roles?.map(roleCode => {
      const role = roles.value.find(r => r.code === roleCode)
      return role ? role.id : null
    }).filter(id => id !== null) || []

    Object.assign(form, {
      id: row.id,
      email: res.data.email,
      nickname: res.data.full_name || '',
      phone: res.data.phone || '',
      roleIds: roleIds,
      status: res.data.status || 'active'
    })
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
  dialogVisible.value = true
}

const handleResetPwd = (row) => {
  currentUser.value = row
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  pwdDialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户"${row.email}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await userApi.delete(row.id)
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
      await userApi.update(form.id, {
        email: form.email,
        full_name: form.full_name,
        phone: form.phone,
        status: form.status,
        roleIds: form.roleIds
      })
      if (form.id === userStore.state.user?.id) {
        await userStore.fetchUserInfo()
      }
    } else {
      await userApi.create({
        email: form.email,
        password: 'Aa123456!',
        full_name: form.full_name,
        phone: form.phone,
        roleIds: form.roleIds
      })
    }
    ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handleResetPwdSubmit = async () => {
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  try {
    await authApi.changePassword({
      userId: currentUser.value.id,
      newPassword: pwdForm.newPassword
    })
    ElMessage.success('密码重置成功')
    pwdDialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.message || '密码重置失败')
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

const getRoleName = (roleCode) => {
  const role = roles.value.find(r => r.code === roleCode)
  return role ? role.name : roleCode
}

onMounted(() => {
  fetchData()
  fetchRoles()
})
</script>

<style scoped>
.user-manage {
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
</style>
