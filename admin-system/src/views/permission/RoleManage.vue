<template>
  <div class="role-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon>
              <Plus />
            </el-icon>新增角色
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="角色名称/编码" clearable @keyup.enter="handleSearch" />
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
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="code" label="角色编码" min-width="150" />
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="userCount" label="用户数量" width="100" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handlePermission(row)">权限配置</el-button>
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
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入角色编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" rows="3" placeholder="请输入角色描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限配置弹窗 -->
    <el-dialog v-model="permissionDialogVisible" title="权限配置" width="600px">
      <el-tree ref="treeRef" :data="allMenus" show-checkbox node-key="id"
        :props="{ label: 'name', children: 'children' }" :default-checked-keys="checkedKeys" />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePermissionSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { roleApi, menuApi } from '../../api'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

const loading = ref(false)
const total = ref(0)
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const isEdit = ref(false)
const currentRole = ref(null)
const treeRef = ref(null)

const allMenus = ref([])

const searchForm = reactive({
  keyword: ''
})

const pageParams = reactive({
  page: 1,
  pageSize: 10
})

const form = reactive({
  id: null,
  name: '',
  code: '',
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

const checkedKeys = ref([])
const tableData = ref([])

const fetchMenus = async () => {
  try {
    const res = await menuApi.getTree()
    allMenus.value = res.data || []
  } catch (error) {
    console.error('获取菜单失败:', error)
  }
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await roleApi.getList({ ...pageParams, keyword: searchForm.keyword })
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
  dialogTitle.value = '新增角色'
  Object.assign(form, {
    id: null,
    name: '',
    code: '',
    description: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑角色'
  Object.assign(form, row)
  dialogVisible.value = true
}

const handlePermission = async (row) => {
  currentRole.value = row
  try {
    const res = await roleApi.getMenus(row.id)
    checkedKeys.value = getAllNodeIds(res.data || [])
  } catch (error) {
    checkedKeys.value = []
  }
  permissionDialogVisible.value = true
}

const getAllNodeIds = (nodes) => {
  let ids = []
  nodes.forEach(node => {
    ids.push(node.id)
    if (node.children && node.children.length > 0) {
      ids = ids.concat(getAllNodeIds(node.children))
    }
  })
  return ids
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除角色"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await roleApi.delete(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      ElMessage.error(error.message || '删除失败')
    }
  })
}

const handleSubmit = async () => {
  console.log('form', form)
  try {
    if (isEdit.value) {
      await roleApi.update(form.id, form)
    } else {
      await roleApi.create(form)
    }
    ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

const handlePermissionSubmit = async () => {
  const checkedNodes = treeRef.value?.getCheckedKeys() || []
  const halfCheckedNodes = treeRef.value?.getHalfCheckedKeys() || []
  const allChecked = [...checkedNodes, ...halfCheckedNodes]

  try {
    await roleApi.assignMenus(currentRole.value.id, allChecked)
    await userStore.fetchUserInfo()
    ElMessage.success('权限配置成功')
    permissionDialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.message || '权限配置失败')
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

onMounted(() => {
  fetchData()
  fetchMenus()
})
</script>

<style scoped>
.role-manage {
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
