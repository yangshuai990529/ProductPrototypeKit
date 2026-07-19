# ProductPrototypeKit MCP 菜单工具使用流程指南 📺

本手册旨在指导电视大屏（TV）产品经理、设计师与开发人员，如何通过配置和调用 `ProductPrototypeKit` 内置的 MCP（Model Context Protocol）服务，快速完成菜单节点定位、面包屑路径回溯以及生成 PRD 设置变更对比。

---

## 🧭 核心角色与使用场景
1. **大屏 PM / 产品经理**：在编写国内（TCL OS）或海外（Google TV/Fire TV）系统设置交互设计时，快速查找标准菜单层级定位，或一键生成“新功能加入”前后的树状对比。
2. **AI 原型生成助手**：在接到用户指令（如“给中国区增加防蓝光护眼三级菜单”）时，自动调用底层 MCP 工具获取标准的上下文依赖，实现 **100% 像素级高保真还原**。

---

## 🛠 第一部分：配置与激活流程

要让您的 AI 助手（如 Workbuddy / Gemini）支持自动运行这些工具，请首先完成一次性配置：

### 1. 找到配置文件
点击 IDE 或 Workbuddy 界面上的 **“配置 MCP”** 按钮，或者用文本编辑器直接打开您本地的配置文件：
* **Mac 默认路径**：`/Users/eric/.workbuddy/mcp.json`

### 2. 写入服务器参数
在 `mcpServers` 部分，粘贴以下内容（注意绝对路径）：
```json
{
  "mcpServers": {
    "product-prototype-kit": {
      "command": "node",
      "args": [
        "/Users/eric/Downloads/需求原型设计/ProductPrototypeKit/scripts/menu-helper-mcp.js"
      ]
    }
  }
}
```
*（提示：如果您克隆的文件夹路径发生改变，请将 `args` 中的路径替换为本地实际 `scripts/menu-helper-mcp.js` 文件的绝对路径）*

### 3. 保存并重载
保存 `mcp.json` 后，Workbuddy 客户端会自动重启 MCP 服务，显示绿色连接成功状态即可。

---

## 🏃‍♂️ 第二部分：使用流程与实操指令

服务激活后，您可以通过两种方式操作：**“AI 自然语言对话自动触发”**，或者 **“终端命令行手动执行”**。

### 流程一：AI 助手自动调用流程 (免命令行)

在与 AI 对话时，AI 会在后台默默为您调用这些工具。以下是常见的对话工作流程：

#### 场景 1：查找某个国内/海外设置菜单的 ID 和位置
* **用户输入**：*“帮我查一下中国区里关于图像设置有哪些子项，并列出它们的 ID。”*
* **AI 自动执行**：AI 将会调用 `search_menu`，输入 `region="cn"`, `query="图像"`。
* **返回结果**：直接输出匹配项：
  > 1. [图像] -> ID: `china_图像-image_82479eb839` (一级菜单)
  > 2. [图效模式] -> ID: `china_图效模式-picture-mode_f427ba3e18` (二级菜单)
  > 3. [亮度] -> ID: `china_亮度-brightness_e38f902ac7` (三级菜单)

#### 场景 2：回溯某个节点在大屏设置中的面包屑路径
* **用户输入**：*“获取节点 china_亮度-brightness_e38f902ac7 的完整设置面包屑。”*
* **AI 自动执行**：AI 将会调用 `get_menu_path`，输入 `region="cn"`, `nodeId="china_亮度-brightness_e38f902ac7"`。
* **返回结果**：
  > 节点面包屑路径：`全部设置 > 图像 > 亮度`
  > 详细字段：SDR/HDR 标定状态、遥控器动作、备注。

#### 场景 3：生成交互设计文档所需的 Diff 变更日志
* **用户输入**：*“我想在中国区的图像设置里增加一个‘AI超分’的三级子菜单，帮我生成一份标准的变更对比供我写 PRD。”*
* **AI 自动执行**：AI 将会调用 `diff_menu`，输入 `region="cn"`, `parentNodeId="china_图像-image_82479eb839"`, `action="add"`, `targetName="AI超分 (AI Super Resolution)"`。
* **返回结果**：
  ```text
  全部设置 > 图像
      图效模式
      亮度
      色彩
    + AI超分 (AI Super Resolution) (新功能)
  ```

---

### 流程二：终端命令行手动执行流程 (本地单机运行)

如果您不依赖 AI，只是想在终端手动搜索和输出菜单层级，可以直接在控制台运行以下命令：

#### 1. 模糊检索菜单节点
```bash
# 命令格式: node scripts/menu-helper.js search <cn|overseas> <关键词>
# 示例：查找国内“护眼”相关的所有菜单项
node scripts/menu-helper.js search cn 护眼
```

#### 2. 获取节点绝对路径
```bash
# 命令格式: node scripts/menu-helper.js get-path <cn|overseas> <节点ID>
# 示例：获取特定 ID 的国内菜单详细面包屑
node scripts/menu-helper.js get-path cn china_图像-image_82479eb839
```

#### 3. 生成菜单层级变动差分 (Diff)
```bash
# 命令格式: node scripts/menu-helper.js diff <cn|overseas> <父节点ID> <动作:add|delete|modify> <变动项名称>
# 示例：在国内“图像”菜单下新增“低延迟模式”
node scripts/menu-helper.js diff cn china_图像-image_82479eb839 add "低延迟模式 (ALLM)"
```

---

## 🔍 第三部分：排错与自检流程

如果使用过程中发现路径无法解析，或者工具没有响应，请按照以下流程自检：

1. **环境检查**：
   In target directory, run:
   ```bash
   node scripts/validate-project.js
   ```
   *（检查各项技能定义、JSON 数据库目录是否齐全）*
2. **MCP 服务日志监控**：
   若 MCP 出现报错，可在 Workbuddy 的“MCP 服务管理”监控后台查看输出。任何程序错误都会输出到 `stderr`，确保不污染 `stdout` 通道。
