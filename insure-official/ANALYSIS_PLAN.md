# 🔗 内部链接分析执行计划

## 主要页面访问优先级

### 第一阶段：核心功能页面 (优先级 HIGH)
1. ✓ **Platform Components** - `/en/insure-platform-components/`
2. ✓ **Insurance APIs** - `/en/insuremo-platform/insurance-apis/`
3. ✓ **Core Modernization** - `/en/core-modernization/`
4. ✓ **Digital Distribution** - `/en/digital-distribution-and-connectivity/`

### 第二阶段：资源中心 (优先级 MEDIUM)
5. **Case Studies** - `/en/case-studies/`
6. **Videos** - `/en/videos/`
7. **Whitepapers** - `/en/whitepapers/`

### 第三阶段：生态链接 (优先级 MEDIUM)
8. **Service Partners** - `/en/service-partners/`
9. **App Partners** - `/en/app-partners/`
10. **Events** - `/en/events/`

### 第四阶段：其他页面 (优先级 LOW)
11. **Contact/Offices** - `/en/contact-insuremo-worldwide-offices/`
12. **News** - `/en/news/`

---

## 每个页面的分析参数

对每个页面进行以下分析：

```json
{
  "page_info": {
    "url": "页面 URL",
    "title": "页面标题",
    "meta": {
      "description": "元描述",
      "og_image": "OG 图片",
      "robots": "robots 标签"
    }
  },
  "dom_analysis": {
    "total_elements": "总 DOM 元素数",
    "headings": {
      "h1": 0,
      "h2": 0,
      "h3": 0,
      "total": 0
    },
    "content_elements": {
      "buttons": 0,
      "images": 0,
      "links": 0,
      "forms": 0
    },
    "structure": {
      "sections": 0,
      "articles": 0,
      "navigation": 0,
      "header": 0,
      "footer": 0
    }
  },
  "style_analysis": {
    "css_files": 0,
    "inline_styles": 0,
    "primary_colors": [],
    "fonts": [],
    "unique_colors": 0
  },
  "performance": {
    "page_height": "像素",
    "load_time": "秒",
    "resource_count": 0
  },
  "content": {
    "text_length": 0,
    "main_sections": [],
    "cta_count": 0
  }
}
```

---

## 执行步骤

### 步骤 1-5: 访问并分析页面
- 循环访问每个 URL
- 收集上述所有数据
- 保存截图

### 步骤 6: 对比分析
- 模板对比
- 设计一致性检查
- 内容层级分析

### 步骤 7: 生成综合报告
- 样式指南提取
- 设计系统文档
- 开发建议

---

## 注意事项

⚠️ 请确保：
- [ ] 已安装 Playwright
- [ ] 浏览器配置正确
- [ ] 网络连接稳定
- [ ] 允许足够的加载时间
- [ ] 处理任何弹窗/重定向

---

**预期完成时间**: 15-20 分钟  
**数据输出**: 12-15 个分析报告 + 截图

