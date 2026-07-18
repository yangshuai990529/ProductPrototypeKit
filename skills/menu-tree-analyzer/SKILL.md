---
name: menu-tree-analyzer
description: 菜单树分析与定位能力。针对涉及系统设置路径变化的需求进行深度的菜单树路径推荐、合理性分析和差分（Diff）生成。
---

## 职责介绍

仅在确实需要时载入系统菜单树，分析用户功能在设置层级中的合理归属，推荐最符合用户直觉的插入点，并以清晰的 Diff 形式展示层级结构的变化。

## 本地工具调用指南

为了高效、准确地检索数万条菜单数据，AI 助手必须使用本地命令行工具 `scripts/menu-helper.js` 进行分析：

1. **模糊搜索关联节点**：
   运行命令：`node scripts/menu-helper.js search <cn|overseas> "<关键字>"`
   *示例*：搜索中国区画质设置：`node scripts/menu-helper.js search cn "图像"`

2. **获取节点完整路径与详细属性**：
   运行命令：`node scripts/menu-helper.js get-path <cn|overseas> "<节点ID>"`
   *示例*：`node scripts/menu-helper.js get-path cn china_图像-image_82479eb839`

3. **辅助生成菜单变更差分 (Diff)**：
   运行命令：`node scripts/menu-helper.js diff <cn|overseas> "<父节点ID>" <add|delete|modify> "<目标项名称>"`
   *示例*：`node scripts/menu-helper.js diff cn china_图像-image_82479eb839 add "智能眼睛保护"`

## 触发规则（防冗余过滤）

**重要规则**：并非所有需求都需要读取和处理菜单树。

### 1. 允许加载菜单树的场景：
- 新增菜单入口
- 修改已有菜单名称或属性
- 调整菜单层级结构与父子关系
- 修改或重定向设置项的跳转路径

### 2. 禁止加载菜单树的场景：
- 独立的独立应用（APK）设计（例如“拍照校准 APK 设计”）
- 纯画质/音质算法参数优化
- 内部底层参数逻辑调整（非前台菜单项调整）
- 桌面（Launcher）卡片及横幅内容修改

*在禁止加载的场景下，AI 应跳过菜单树读取，以减少上下文干扰并提升运行速度。*

---

## 分析与输出规范


当判定需要进行菜单分析时，本 Skill 必须输出以下内容：

### 1. 路径推荐对比
清晰对比当前菜单路径与推荐新增后的路径：
- **当前路径示例**：`Settings > Picture > Advanced Settings`
- **推荐新增路径示例**：`Settings > Picture > Advanced Settings > [New Feature Name]`

### 2. 推荐合理性阐述
必须从产品体验角度说明推荐理由，如：
1. **符合用户认知**：该功能属于画质相关，与 Picture 目录下其他项强关联。
2. **保持层级扁平**：不新增一级菜单，维护设置页整体简洁度。
3. **低学习成本**：利用已有父节点，用户可根据旧有路径直观找到。

### 3. 菜单差分 (Menu Diff)
使用标准 Diff 格式标记菜单变化：
- `+` 表示新增菜单项
- `-` 表示删除/下线菜单项
- `→` 表示菜单路径移动或名称修改

**Diff 示例**：
```diff
  Settings
    Picture
      Advanced Settings
+       Color Calibration (新功能)
-       Old Legacy Mode (废弃模式)
        Brightness → Panel Brightness (更名)
```
