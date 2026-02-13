<template>
  <div class="menu-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜单管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon>
              <Plus />
            </el-icon>新增菜单
          </el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%" row-key="id" default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" v-loading="loading">
        <el-table-column prop="name" label="菜单名称" min-width="200">
          <template #default="{ row }">
            <el-icon v-if="row.icon" style="margin-right: 5px">
              <component :is="row.icon" />
            </el-icon>
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="150" />
        <el-table-column prop="component" label="组件路径" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'directory'" type="primary">目录</el-tag>
            <el-tag v-else-if="row.type === 'menu'" type="success">菜单</el-tag>
            <el-tag v-else type="warning">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success">启用</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleAddSub(row)">新增</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="上级菜单">
          <el-tree-select v-model="form.parentId" :data="menuTreeData"
            :props="{ label: 'title', value: 'id', children: 'children' }" placeholder="请选择上级菜单" check-strictly
            style="width: 100%" />
        </el-form-item>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio label="directory">目录</el-radio>
            <el-radio label="menu">菜单</el-radio>
            <el-radio label="button">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入路由路径" />
        </el-form-item>
        <el-form-item label="组件路径" v-if="form.type === 'menu'">
          <el-input v-model="form.component" placeholder="请输入组件路径，如：views/content/VideoResource.vue" />
        </el-form-item>
        <el-form-item label="菜单图标" v-if="form.type !== 'button'">
          <el-input v-model="form.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态">
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { menuApi } from '../../api'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()

const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增菜单')
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  parentId: null,
  type: 'menu',
  name: '',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  status: 'active'
})

const rules = {
  type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }]
}

const tableData = ref([])
const menuTreeData = ref([{ id: 0, title: '根目录', children: [] }])

const fetchData = async () => {
  loading.value = true
  try {
    const res = await menuApi.getTree()
    tableData.value = res.data || []
    menuTreeData.value[0].children = tableData.value
  } catch (error) {
    ElMessage.error(error.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增菜单'
  Object.assign(form, {
    id: null,
    parentId: null,
    type: 'menu',
    name: '',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    status: 'active'
  })
  dialogVisible.value = true
}

const handleAddSub = (row) => {
  isEdit.value = false
  dialogTitle.value = '新增子菜单'
  Object.assign(form, {
    id: null,
    parentId: row.id,
    type: 'menu',
    name: '',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    status: 'active'
  })
  dialogVisible.value = true
}

const handleEdit = async (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑菜单'
  try {
    const res = await menuApi.getById(row.id)
    Object.assign(form, {
      id: row.id,
      parentId: res.data.parentId || null,
      type: res.data.type || 'menu',
      name: res.data.name || '',
      path: res.data.path || '',
      component: res.data.component || '',
      icon: res.data.icon || '',
      sort: res.data.sort || 0,
      status: res.data.status || 'active'
    })
  } catch (error) {
    ElMessage.error('获取菜单信息失败')
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除菜单"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await menuApi.delete(row.id)
      await userStore.fetchUserInfo()
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
      await menuApi.update(form.id, form)
    } else {
      await menuApi.create(form)
    }
    await userStore.fetchUserInfo()
    ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.menu-manage {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
