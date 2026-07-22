# Release Notes / 更新日志

## [V2.0.0] - 2026-07-23

### 🚀 重大更新与架构重构 (Architecture & Reliable MCP)

1. **共享核心领域层 (`src/domain/menu/`)**
   - 建立 `MenuRepository`、`ApplicabilityRepository` 与 `MenuService` 领域层架构，实现核心菜单检索与变更校验逻辑同 CLI、MCP 工具解耦。
   - 统一定义 `Result` 返回结构（`{ ok: true, data }` / `{ ok: false, error }`），提供稳定错误码，彻底杜绝 JavaScript 运行时未捕获异常泄漏。

2. **可信 MCP 工具层升级 (v2.0.0)**
   - 增加协议级 `structuredContent` 结构化载荷与 `content` 文本摘要双重输出，完美兼容各类 Agent/LLM 客户端。
   - 在 `tools/list` 中为所有工具完整暴露 `inputSchema` 与 `outputSchema` 声明。
   - 新增工具：`list_children`（列出子节点）、`get_node`（获取节点详情）、`validate_change`（菜单变更合规性校验）。
   - 完善 `-32700`（解析错误）、`-32601`（方法未找到）、`-32602`（参数非法）等 JSON-RPC 标准错误处理。

3. **海外平台适用性覆盖层 (Overseas Platform Applicability Layer)**
   - 新增 `knowledge/applicability/` 覆盖层目录与 `schema.json`，采用 **Ajv 2020 Draft** 验证引擎执行运行期校验。
   - 独立 `node_status`（`active` | `reference_only` | `inactive`）与 `applicability_status`（`confirmed` | `inferred` | `unknown` | `conflict`）状态模型。
   - 引入规范的海外操作系统机器枚举（`google_tv` / `fire_tv` / `android_tv_generic`）。
   - 内置 6 大数据质量异常拦截（单节点单记录约束、引用合法性、日期区间校验、`confirmed` 归属约束等）。

4. **自动化测试与基准评估体系**
   - 建立 `tests/` 自动化测试套件，涵盖核心单元测试、Ajv 数据质量拦截测试、MCP Stdio 协议合同测试以及 CLI 与 MCP 100% 语义 Parity 测试。
   - 建立包含 20 条中/海外真实节点的黄金评估集 (`evals/golden-dataset.json`)，评估通过率 **100%**。

---

## [V1.0.0] - 原始基线版本

- 包含 TCL OS（国内）与 Google TV / Fire TV（海外）菜单树基础数据库。
- 提供 `/ppk` 主编排指令与 Workbuddy 6 大原型设计技能。
- 提供基础 CLI 模糊搜索工具与第一代 MCP 服务。
