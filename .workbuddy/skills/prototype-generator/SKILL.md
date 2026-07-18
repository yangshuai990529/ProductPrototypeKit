---
name: prototype-generator
description: 交互式原型与规范生成能力。根据通过评审的设计方案，自动生成符合 TV 遥控器交互标准的原生 HTML 页面（单文件）、README 说明、PRD 产品规格书及测试用例。
---

## 职责介绍

在方案获得用户明确授权后，将设计思路转化为可直接运行的高保真可交互 Demo。Demo 必须能够模拟电视终端特有的遥控器焦点逻辑与视觉动效，且不依赖任何外部 CDN 或复杂编译环境。

## 基础模版注入指南

为了确保所生成的 Demo 满足高质量的 TV 视觉与交互体验，AI 助手在构建 `index.html` 时必须加载并嵌入以下模板代码：

1. **样式注入**：
   从 [templates/tv-theme.css](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/templates/tv-theme.css) 读取标准的电视色彩变量、安全区域布局、可聚焦按钮（`.focusable`）、高亮焦点状态（`.focusable.focused`）、Dialog 和 Toast 基础 CSS 样式，并将其完整嵌入到 HTML 页面的 `<style>` 标签中。如果需要自定义样式，必须作为补充 CSS 变量写入，而不要破坏基础样式。

2. **焦点引擎注入**：
   从 [templates/focus-manager.js](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/templates/focus-manager.js) 读取 `TVFocusManager` 核心焦点控制类，并将其完整嵌入到 HTML 页面的 `<script>` 标签中。引擎实例化后会自动挂载在 `window.tvFocusManager` 下。

3. **组件拼装规范**：
   - 所有的可聚焦点击元素（如菜单项、切换按钮、桌面卡片等）必须添加 `class="focusable"`。
   - 页面初始加载或弹窗显示时，首选按钮可以添加 `data-default-focus="true"` 属性作为起始焦点。
   - 所有的弹窗元素必须拥有 `class="dialog-overlay"` 并在内部包装 `class="dialog-box"`。显示和隐藏必须通过调用 `tvFocusManager.openDialog('.dialog-overlay-class')` 和 `tvFocusManager.closeDialog('.dialog-overlay-class')` 进行，以便引擎自动进行焦点捕获与焦点还原。

## 技术要求

本生成技能支持以下两种原型技术选型，根据产品环境或用户显式指令决定生成模式：

### 【模式一】原生单文件 HTML5 / Vanilla CSS / JS (默认)
1. **核心文件**：输出为单个独立的 `index.html`。
2. **模版集成**：必须加载 [templates/tv-theme.css](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/templates/tv-theme.css)（使用最新中国区设计规范色彩变量与 TV Tokens）和 [templates/focus-manager.js](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/templates/focus-manager.js) 并将其完整内嵌至 HTML 中。
3. **零外部依赖**：禁止引用外部 CDN 资源，确保双击运行。

### 【模式二】React + Tailwind 4 + Shadcn UI 项目工程
当用户要求生成 React 规范版本时，应根据区域上下文（中国区/海外区）选择对应的模板进行工程初始化与组件库调用：
1. **中国区 (China Region)**：
   - **模板来源**：[templates/react-template/](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/templates/react-template/)。
   - **视觉特性**：背景 `#12152a`，品牌主色 `#4b7bff`，高亮外发光；支持中文字体与侧边栏“聚焦展开、非聚焦收缩”交互。
2. **海外区 (Overseas Region - Google TV / Fire TV)**：
   - **模板来源**：[templates/react-template-overseas/](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/templates/react-template-overseas/)。
   - **视觉特性**：背景 `#000000`（纯黑画布），卡片面 `#1c1c1e`，聚焦前景色为 `#000000` 配合 `#d4d4d4` 底色，滑动条与激活开关使用 Google 蓝 `#4285f4`；字体采用 `Inter`，圆角设为较大弧度（`0.75rem` / `12px`）。
3. **共享组件调用与逻辑重写**：
   - 导入模板内置的 Shadcn UI 大屏交互组件（`button`、`slider`、`switch`、`dialog`、`sidebar` 等）。
   - 修改 `src/app/App.tsx` 中的 React `useState` 模型，将 PM 的具体业务需求（如级联解锁、模式切换、阻断弹窗）拼装实现。

---

## TV 交互与设计约束（核心实现，包含国内与海外全局优化）

为了确保生成的原型完全符合电视大屏（TV）的物理体验与设计直觉，你生成的代码（无论单文件 HTML 还是 React）必须严格遵守以下三大设计约束：

### 1. 严格的菜单组件限制（三类组件）
电视设置项的设计不得包含任何奇怪的输入框、文本域或复杂表单。所有菜单项组件必须**且仅能**映射为以下三类之一：
- **【进入型 (Entry / Sub-menu Link)】**：左侧为文字标签，右侧可选展示当前选择的选项状态字样，且右侧边缘必须包含指向箭头 `>`（或 `ChevronRight`）。点击它必须触发面板向左滑动展开下一级子菜单，或者弹窗展示选项列表（支持 Checkmark 标记选中项）。
- **【Bar条型 (Bar / Slider)】**：左侧为文字标签，右侧为进度条轨道、滑块滑块及当前数值（等宽展示，如 `50` 或 `50%`）。在焦点停留于该行时，按遥控器左右键可以直接增减数值，按上下键可以移走焦点。
- **【开关型 (Switch / Toggle)】**：左侧为文字标签，右侧为药丸状的 On/Off 开关按钮。点击它直接在开与关的视觉颜色状态之间切换。

*严禁生成任何其他自定义文本输入框、复选框、搜索栏等多余组件。*

### 2. 视频流背景层模拟约束
- **固定背景播放**：生成的页面底部（背景层）必须包含一个 `<video>` 播放元素，该元素需要固定播放视频文件并保持循环（`autoplay loop muted playsinline`）。必须优先使用本地的 1080P 高保真演示视频（在单文件 HTML 模式下优先引用同级或相对路径的 "DV2_demo_1080P.mp4"；在 React 模式下优先引用 "src/imports/DV2_demo_1080P.mp4"）。
- **毛玻璃与透明叠加**：覆盖于视频上方的控制面板和主设置栏必须使用半透明的背景，并启用 `backdrop-filter: blur(...)` 毛玻璃滤镜。模拟用户在电视看片过程中突然按菜单键滑出设置的真实场景，保证背景视频继续常驻播放。

### 3. 屏幕分辨率自适应 (Aspect Ratio & Scale Adaptation)
- **1080P等比缩放引擎**：生成的原型（包括 HTML 和 React）必须内置自适应分辨率缩放逻辑。主渲染画布必须锁定为固定的 `1920x1080` 空间（使用外层容器包装），并通过 JS 监听窗口 `resize` 事件动态计算缩放比例：
  `const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);`
  利用 CSS `transform: scale(scale)` 与 `transform-origin: top left`（配合绝对定位居中计算）进行动态调整，确保原型在任何分辨率 of 电脑显示器、笔记本或电视屏幕上都呈比例完美缩放居中，绝不出现变形或原生浏览器滚动条。

### 4. 级联导航路径完整实现 (Full Path Menu Navigation Flow)
- **从一级菜单起航**：生成的原型 Demo 禁止做成一个孤立的、直接加载最终设置项的单页面。原型必须还原从 **“系统设置一级主菜单”**（例如：Picture, Sound, Network, System 等）开始的完整交互流。
- **逐级聚焦与进入**：用户使用遥控器 D-pad 物理按键进行导航，必须能够从一级菜单的“图像 (Picture)”聚焦、点击进入二级子菜单、聚焦到特定级联（如其他设置/健康护眼），点击进入三级或四级菜单，直至到达用户核心修改的“命中项”（例如低蓝光模式）。
- **逐级返回闭环**：必须实现完整的返回（Escape / Back 键）回溯逻辑。按返回键时，菜单焦点应倒退回上一层级的触发按钮上，直至退回一级菜单并关闭设置面板，提供完整的链路导航体验。

### 5. 菜单内容完整度与静态占位约束 (Menu Tree Sibling Completeness)
- **展示全部同级菜单**：为了保证原型的视觉绝对真实，生成的菜单面板中不能只显示孤零零的命中节点。必须根据当前区域（国内/海外）的菜单树数据库，在各级面板中渲染出该层级下的**所有真实同级菜单项 (Sibling Items)**。
- **命中路径交互，非命中路径静态占位**：
  - 只有命中的路径及设置项（例如：`Picture > Eye Health Protection > Blue Light Filter`）需要具备完整的二级/三级滑入、按钮点击或数值调节的**全交互**。
  - 其他未命中的同级项（例如：`Brightness` 亮度, `Color` 色彩, `Sound` 声音 等）**也必须渲染出来，并支持遥控器聚焦 (Focusable) 以实现光标移动**，但点击它们可以没有任何交互响应（或仅弹窗提示“暂不支持演示”），务必保证菜单界面的完整填充度。

### 6. 遥控器键值映射
必须绑定键盘事件监听（`keydown`），映射标准电视遥控器按键：
- `ArrowUp` (上)
- `ArrowDown` (下)
- `ArrowLeft` (左)
- `ArrowRight` (右)
- `Enter` (确定)
- `Escape` (返回/Back)

### 7. 焦点管理 (Focus Management)
- **焦点状态**：拥有焦点态的元素必须有极其清晰的视觉变化（如发光边框、放大动效、背景色高亮）。
- **默认焦点**：页面加载时、弹窗弹出时，必须有预设的默认获取焦点元素，不可出现“焦点丢失”状态。
- **焦点移动**：根据物理方向键移动焦点。通常可以通过维护一个二维数组、网格结构或利用 `data-focus-up`, `data-focus-down` 等自定义属性在 DOM 上显式定义移动目标。
- **焦点返回**：点击遥控器 Back 键（Escape）或返回按钮时，焦点应退回至上一层级的触发节点。
- **Dialog 焦点锁定 (Focus Trap)**：当弹窗（Dialog/Modal）显示时，焦点必须被锁定在弹窗内部的按钮上，遥控器上下左右无法移出弹窗范围，直到弹窗关闭。

### 8. 多状态支持
原型中必须内置并可演示以下页面状态：
- 页面跳转 / 模块切换
- 弹窗 (Dialog/Popup)
- 轻提示 (Toast)
- 加载中 (Loading)
- 成功 (Success) / 失败 (Error)
- 失败重试 (Retry)

---

## Demo 输出文件结构

每次生成 Demo，必须在 `prototype/` 目录下提供以下四个文件：

```text
prototype/
├── index.html          # 主运行原型（单文件交互）
├── README.md           # 运行说明书（包含打开方式、支持按键、交互范围）
├── PRODUCT_SPEC.md     # PRD 规格书（背景、功能目标、流程、字段及交互规则）
└── TEST_CASE.md        # 测试用例库（正常流、异常流、遥控器按键边界条件）
```

---

## 质量自检清单 (QA Checklist)

在生成完 Demo 后，AI 助手必须在内部运行以下自检，确保零缺陷交付：

- **业务符合度**：
  - [ ] 是否完整实现了评审提案中的全部业务功能？
  - [ ] 是否遗漏了状态转换或异常提示？
- **TV 交互自检**：
  - [ ] 所有视觉按钮是否都可以通过遥控器到达并按 Enter 激活？
  - [ ] 点击 Escape (Back) 能否正常退出弹窗或返回上级？
  - [ ] 是否在任何操作路径下都不会发生焦点丢失（Focus Loss）？
- **视觉与体验**：
  - [ ] 是否预留了 TV 安全区域（Safe Area，四周至少留出 5%-8% 的边距）？
  - [ ] 极端长文案下是否会出现溢出（Overflow）或重叠？
  - [ ] 字体大小层级是否清晰，在远距离观看时是否易读？
- **技术规范**：
  - [ ] 双击本地 `index.html` 是否能完美运行？
  - [ ] 浏览器控制台（Console）是否无任何报错或未定义引用？
  - [ ] 是否没有使用任何绝对路径？
