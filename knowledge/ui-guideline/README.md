# UI 视觉规范说明 (UI Guidelines) — 中国区 5.2 规范版

本目录包含 TCL TV UI 视觉设计系统的核心规范（对齐最新 React/Tailwind 4 + Shadcn UI 组件库设计标识），用于指导 `prototype-generator` 生成符合官方视觉标准的原型代码。

## 1. 核心设计标识 (Design Tokens)

为了确保网页和 React 结构中的视觉高度一致，必须统一使用以下颜色标识定义样式：

### 基础颜色 (General Palette)
- **背景 (Background)**: `#12152a` (深沉灰蓝，极佳的大屏防眩光及防视觉疲劳基调)
- **卡片 (Card / Subpanel)**: `#1c2038` (略高亮的蓝色卡片体)
- **前景色 (Foreground)**: `#ffffff`
- **主色/高亮 (Primary Accent)**: `#4b7bff` (极具科技感的 TCL 智慧蓝)
- **静音/失效 (Muted-foreground)**: `#7d8aaa`
- **危险/告警 (Destructive)**: `#d4183d`

### 电视专用设计标识 (TV-Specific Tokens)
- **导航边栏背景 (TV Nav Background)**: `#0e1120`
- **设置主面板背景 (TV Panel Background)**: `#161929`
- **设置子面板背景 (TV Subpanel Background)**: `#1c2038`
- **D-pad 获焦元素底色 (TV Focus Background)**: `rgba(255, 255, 255, 0.11)`
- **D-pad 高亮聚焦底色 (TV Focus Bright)**: `rgba(255, 255, 255, 0.18)`
- **活动菜单页签底色 (TV Active Tab Background)**: `rgba(255, 255, 255, 0.12)`
- **滑动条轨道 (TV Slider Track)**: `rgba(255, 255, 255, 0.15)`
- **滑动条激活填充 (TV Slider Fill)**: `#4b7bff`

---

## 2. 核心组件交互指导 (Component Specifications)

### 2.1 按钮 (Buttons)
- **Primary Button（主按钮）**：使用主品牌色（`#4b7bff`）填充，在需要引导用户完成主任务（如“确认恢复出厂”）时调用。
- **Secondary Button（次按钮）**：使用带框线和透明背景，常在需要提供次级选项（如取消、返回）时与主按钮并列展示。
- **Focus Hover Scale（聚焦放大）**：电视端按钮被 D-pad 选中时，应支持 `scale(1.05)` 的微缩放以提供动效反馈。

### 2.2 选项切换器 (Step Picker)
- 使用左右双箭头包裹选项文本（例如 `< FILMMAKER >` 或 `< 2.2 >`）。
- 左右方向键用于在可用选项间进行轮询切换，并配合 Toast 实时反馈结果。

### 2.3 滑动控制器 (Sliders)
- 滑动条支持水平进度微调，步长通常为 5% 或 10%。
- 数值通过单独的等宽字体标签（tabular-nums）右对齐展示，确保数值变化时界面排版不发生抖动。

### 2.4 设置菜单同级项控件渲染要求 (Sibling Item Controls)
- **完整渲染控件**：在渲染整个系统设置菜单页面时，必须为列表中的每个菜单项根据其数据库功能类别渲染对应的交互或占位控件（如 Toggle 开关、Slider 进度条、Entry 的右侧指向箭头等），绝对不允许仅使用无控件的纯文字行来代替。
- **保持视觉对齐**：所有控件在右侧纵向对齐，与选中态和非选中态的元素保持一致的间距和高度，保证大屏展示的绝对平衡感。
