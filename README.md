# ProductPrototypeKit 📺

`ProductPrototypeKit` 是一个专为电视大屏（TV）产品经理打造的 **Workbuddy AI 原型生成工作区**。支持零配置一键生成符合国内（TCL OS）与海外（Google TV/Fire TV）交互规范的高保真原型。

---

## ⚡️ 2步使用指南（零配置）

### 1. 在 WorkBuddy 中打开项目
克隆本项目，并使用 **WorkBuddy 客户端** 直接打开此项目目录：
```bash
git clone https://github.com/yangshuai990529/ProductPrototypeKit.git
```

### 2. 键入指令激活
在 Workbuddy 聊天框中，直接输入以下指令之一即可激活：
- **`/ppk`**：一键激活大屏 PM 自动化原型设计工作流。
- **`/ProductPrototypeKit`**：同上。

---

## 📦 项目目录结构

- [**`.workbuddy/skills/`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/.workbuddy/skills/): 自动注册的 6 个 Workbuddy 独立命令（含 `/ppk` 主编排指令与分类/寻址/生成等子指令）。
- [**`.agents/AGENTS.md`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/.agents/AGENTS.md): 项目级全局指令路由与串联编排规则。
- [**`templates/`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/templates/): TV 专属高保真 React 组件模板，包含新加入的杜比护眼测试视频 `DV2_demo_1080P.mp4`。
- [**`knowledge/`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/knowledge/): 国内/海外菜单树数据库（已配置 `.gitignore` 排除索引以大幅省下 Token）。
- [**`scripts/`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/scripts/): 
  - `validate-project.js`: 一键诊断项目环境。
  - `menu-helper.js`: 供 Agent 调用的本地高效模糊搜索工具。

---

## 🔍 环境自检

在终端运行以下命令，确保所有技能与数据库完全就绪：
```bash
node scripts/validate-project.js
```
