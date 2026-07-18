---
name: ppk
description: 🤖 TCL OS 灵悉 UI 原型生成 Copilot 统一入口。输入 /ppk 并描述您的 TV 产品需求（例如：智能低蓝光护眼模式），系统将依次调用分类、面试、寻址、方案评审及原型生成流。
---

## 职责介绍

作为 `ProductPrototypeKit` 的总调度协调者（Orchestrator），当用户输入 `/ppk` 激活本技能时，你必须根据工作区中的编排规则，依次串联调用以下 5 个项目级子技能（Workbuddy Skills）来满足用户的需求：

1. **意图分类**：调用 `/requirement-intent-classifier` 识别需求分类（A 到 H）。
2. **上下文面试**：调用 `/product-context-builder` 确认国内 (TCL OS) / 海外 (Google TV / Fire TV) 环境参数，缺失时进行不超过 3 个问题的提问。
3. **设置树寻址**：调用 `/menu-tree-analyzer`，使用本地 `node scripts/menu-helper.js` 检索具体节点并输出路径 Diff。
4. **设计方案评审**：调用 `/product-design-review` 生成符合 10 点规范的评审提案，并**阻断等待用户回复确认**。
5. **原型与文档生成**：在收到确认后，调用 `/prototype-generator` 自动生成交互式 Demo 及相关文档。

---

## 编排执行规则

- 在执行流的第一步，请明确响应：“🤖 TCL OS 灵悉 UI 原型生成 Copilot 已激活！”
- 严格遵循分步逻辑，未获得用户对于 10 点方案设计评审的确认前，禁止调用第 5 步的生成指令。
