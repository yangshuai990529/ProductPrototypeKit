# TV 界面入口模板库

本目录用于存放适配不同系统入口的原生 HTML/CSS 组件模板，用于在 Demo 生成阶段快速拼装页面。

## 目录结构说明

### 1. `desktop/` (桌面与 Launcher 入口)
- 适配电视桌面卡片（Cards）、磁贴（Tiles）、横幅（Banners）、全局焦点栏（Global Navigation Rail）。
- 内置焦点放大、边缘滚动渐隐样式。

### 2. `control-center/` (控制中心与快捷设置)
- 包含快捷开关（Toggle Switches）、进度滑块（Sliders for Brightness/Volume）、快速面板切换、多选弹出框。
- 适配半屏或抽屉式小窗口。

### 3. `settings/` (系统设置菜单)
- 适配一、二、三级菜单列表结构。
- 包含标准选项（单选列表、多选列表）、Dialog 交互弹窗、无数据状态（Grey State/Empty State）、加载失败与重试界面。

### 4. `three-panel/` (三合一面板)
- 适配多源合一、常用设置与信息流整合的侧边抽屉面板。

---

## 模板通用设计要求
- 所有模板内的 CSS 样式使用清晰的 CSS 变量（CSS Variables）定义，例如 `--focus-border-color`, `--safe-area-padding`，便于针对不同操作系统（TCL OS、Google TV、Fire TV）进行色彩与字体的主题化一键替换。
- 默认内置支持 D-pad 键盘控制的 `tabindex` 或自定义焦点属性（如 `data-focusable="true"`）。
