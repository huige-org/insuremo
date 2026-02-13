<template>
  <div v-if="!item.hidden">
    <template v-if="isMenuItem">
      <el-menu-item :index="item.path" @click="handleClick" :key="item.path">
        <el-icon v-if="item.meta && item.meta.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <template #title>{{ item.meta.title }}</template>
      </el-menu-item>
    </template>
    
    <el-sub-menu v-else :index="item.path || item.name" :key="item.path || item.name" popper-append-to-body>
      <template #title>
        <el-icon v-if="item.meta && item.meta.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta.title }}</span>
      </template>
      <SidebarItem
        v-for="child in item.children"
        :key="child.path || child.name"
        :item="child"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const isMenuItem = computed(() => {
  return !props.item.children || props.item.children.length === 0
})

const handleClick = () => {
  if (props.item.path) {
    router.push(props.item.path)
  }
}
</script>

<style scoped>
.nest-menu .el-menu-item {
  background-color: #1f2d3d !important;
}

.nest-menu .el-menu-item:hover {
  background-color: #001528 !important;
}
</style>
