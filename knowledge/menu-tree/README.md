# 菜单树知识库 (Menu Tree Database)

本目录用于存放从原始 Excel 文件转换而来的结构化菜单树 JSON 数据。

## 目录结构

- `CN/menu-tree.json`：国内灵悉 UI 设置菜单树。
- `Overseas/menu-tree.json`：海外灵悉设置菜单树（由 Google TV 与 Fire TV 平台共享）。

## JSON 字段定义规范

菜单树 JSON 将包含以下核心字段：
- `region`: 区域（CN/Overseas）
- `platform`: 平台（TCL-OS / GoogleTV / FireTV）
- `menu_level`: 菜单层级（1 / 2 / 3）
- `menu_path`: 完整的菜单节点路径（以 ` > ` 分割）
- `feature`: 功能项名称
- `visibility_rule`: 菜单显示条件与规则（例如：特定的信号源下显示，或随特定硬件配置显示）
- `dependency`: 前置依赖或互斥条件
