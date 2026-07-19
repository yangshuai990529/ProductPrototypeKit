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
- [**`templates/`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/templates/): TV 专属高保真 React 组件模板。
- [**`Product Design RAG/`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/Product%20Design%20RAG/): 产品设计 RAG 文件夹，包含杜比护眼测试视频 `DV2_demo_1080P.mp4`，便于未来在此快速增减文件及更新。
- [**`Secure_Vault.zip`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/Secure_Vault.zip): 加密保护的文件包（密码为 `PPK CPGHB123`），用于存放敏感设计文档及高保真原型私密包，防公开泄露。
- [**`vault.sh`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/vault.sh): 快捷加密/解密管理脚本，支持 `./vault.sh lock` 加密与 `./vault.sh unlock` 解密。
- [**`knowledge/`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/knowledge/): 国内/海外菜单树数据库（已配置 `.gitignore` 排除索引以大幅省下 Token）。
- [**`scripts/`**](file:///Users/eric/Downloads/需求原型设计/ProductPrototypeKit/scripts/): 
  - `validate-project.js`: 一键诊断项目环境。
  - `menu-helper.js`: 供 Agent 调用的本地高效模糊搜索工具。

---

## 🔌 MCP (Model Context Protocol) 服务配置

项目内置了零依赖的 MCP 服务，能够将菜单树数据库查询工具（`search_menu`、`get_menu_path`、`diff_menu`）直接作为 AI Agent 的原生工具加载，进一步提升在 Workbuddy/Gemini 中的检索和推理体验。

### 配置步骤：

1. 点击 Workbuddy 界面上的 **配置 MCP** 按钮（或直接打开配置文件 `~/.workbuddy/mcp.json`）。
2. 在 `mcpServers` 对象中，加入以下配置：
   ```json
   "product-prototype-kit": {
     "command": "node",
     "args": [
       "/Users/eric/Downloads/需求原型设计/ProductPrototypeKit/scripts/menu-helper-mcp.js"
     ]
   }
   ```
   *(注意：如果您的项目路径有变动，请将 `args` 中的路径修改为本地实际的 `scripts/menu-helper-mcp.js` 绝对路径)*
3. 点击 **保存**，重新载入 MCP 服务即可激活。

---

## 🔍 环境自检

在终端运行以下命令，确保所有技能与数据库完全就绪：
```bash
node scripts/validate-project.js
```
