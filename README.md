# ProductPrototypeKit

`ProductPrototypeKit` 是一个专为电视大屏（TV）产品经理团队打造的 **AI Copilot 原型生成工作区**。

它通过预置的 **5 个核心 AI 技能** 与 **国内/海外大屏组件模板库**，帮助不懂代码的产品经理通过自然语言输入，一键完成“业务理解 -> 菜单树寻址 -> 10点方案评审 -> 高保真交互原型 & 完整的 PRD 与测试用例”的全链路交付。

---

## 🚀 极其简单的部署与使用指南

要在您的 **Workbuddy** 中使用这套能力，只需两步：

### 第一步：克隆并用 IDE 打开项目
1. 将本项目克隆（Clone）或下载解压到本地。
2. 使用集成了 Workbuddy 的 IDE 直接打开项目根目录。

### 第二步：一键激活快捷指令 (Slash Command)
打开 Workbuddy 聊天框，直接输入以下任一指令即可激活：
- **`/ProductPrototypeKit`** 或 **`/ppk`**：立刻激活大屏 PM 自动化设计流。
- 也可以在对话中直接提及 `ProductPrototypeKit`。

> [!NOTE]
> **零配置原理**：项目根目录下的 `.agents/` 目录是 Workbuddy 的本地扩展根目录。IDE 在载入工作区时会自动扫描并注册其中的技能与规则，无需安装任何第三方插件或环境依赖。

---

## 📦 项目资源目录结构

- [**`.agents/`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/.agents/): Workbuddy 专属定制扩展目录。
  - `skills/`: 内置 5 个核心 AI Brains 提示词规则。
  - `AGENTS.md`: 定义了快捷命令路由与串联逻辑。
- [**`templates/`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/templates/): 大屏组件模板库。
  - `react-template/`: 中国区（TCL OS 5.2） React + Tailwind 4 + Shadcn UI 组件模板。
  - `react-template-overseas/`: 海外区（Google TV & Fire TV）纯黑材质 React 组件模板。
  - `tv-theme.css` & `focus-manager.js`: 兼容 Vanilla HTML5 的 1080p 电视 safe area 布局与 D-pad 空间高亮寻址引擎。
- [**`knowledge/`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/knowledge/): 大屏业务知识库（包含中国区与海外合并后的 Settings 菜单树 JSON、画质/音响信源协议标准等）。
- [**`scripts/`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/scripts/): 
  - `menu-helper.js`: 命令行模糊搜索工具，供 Agent 运行时毫秒级定位菜单路径。
  - `validate-project.js`: 一键诊断脚本，运行 `node scripts/validate-project.js` 检查环境是否完整。
- [**`prototype/`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/prototype/): 示例项目成果文件夹（内置“智能低蓝光护眼模式”的交互 HTML、PRD、测试用例与操作指南）。

---

## 🛠 开发自检运行

您可以在终端中运行以下命令，确保所有技能与数据库完全就绪：
```bash
node scripts/validate-project.js
```
