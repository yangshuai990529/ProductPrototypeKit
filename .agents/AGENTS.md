# Project-Scoped Rules: ProductPrototypeKit Slash Commands

This file defines the shortcut rules and orchestration guidelines for the `ProductPrototypeKit` workspace in Workbuddy.

## 1. Shortcut Command Registration

When the user types `/ProductPrototypeKit`, `/ppk`, or mentions the project name in the chat:
1. **Trigger Action**: Intercept the request and route it to the `ProductPrototypeKit` workspace workflow.
2. **First Command Instruction**: Immediately respond with:
   - "🤖 TCL OS 灵悉 UI 原型生成 Copilot 已激活！"
   - Confirming the user's intent classification (A to H) and proceeding to the structured analysis.

---

## 2. Orchestrated Workflow (Sequential Skill Invocation)

When executing a prototype generation task under this shortcut command, you MUST execute the following custom skills in order:

### Step 1: Classifier (`requirement-intent-classifier`)
- Classify the user's input requirement into Categories A to H (e.g., Settings menu modification, Control Center adjustments).

### Step 2: Context Interviewer (`product-context-builder`)
- Verify if any platform rules (CN/Overseas), menu paths, or functional details are missing.
- If missing, initiate the Smart Interview (asking 3 target questions max).

### Step 3: Menu Analyzer (`menu-tree-analyzer`)
- **MCP Preferred (Strict Accuracy)**: If the `product-prototype-kit` MCP server is configured and active, the Agent/Copilot **MUST** use the MCP tools (`search_menu`, `get_menu_path`) for menu tree database retrieval.
- **Strict Accuracy Constraint**: The retrieved menu nodes, IDs, and paths must be 100% accurate matching the database. No fabrication of nodes or paths is allowed under any circumstances. Hallucination is strictly forbidden.
- If MCP is not configured, fall back to running `node scripts/menu-helper.js`.

### Step 4: Design Review Gating (`product-design-review`)
- Output the mandatory **10-point design proposal** (Demand understanding, Goals, Scenarios, Page structure changes, etc.).
- **IMPORTANT (Mandatory User Confirmation Gate)**: Stop and wait for the user's explicit manual confirmation. **Regardless of whether it is a China (CN) or Overseas project**, the Copilot/Agent **MUST NOT** directly execute the generator or generate any prototype files until the user explicitly confirms (e.g., typing "确认", "Proceed", or "Generate").

### Step 5: Generator (`prototype-generator`)
- Upon user approval, generate the deliverables into the `prototype/` folder:
  - `index.html` (Mode 1: Vanilla CSS/JS using the new TV Tokens) OR `react-app/` (Mode 2: React + Tailwind + Shadcn components library from templates).
  - `README.md`, `PRODUCT_SPEC.md`, `TEST_CASE.md`.
- **IMPORTANT (Full Path Menu Reconstruction & Full Interaction)**:
  - The generated settings menu, from the first level (e.g. System Settings root) to the final target menu item level, **MUST be fully reconstructed** (including all sibling items at each level). Do not just render a few items.
  - Sibling items at each level must be rendered and focusable (though their specific control adjustments like switches, toggles, sliders, or sub-entries can be non-functional dummy elements).
  - The entire selected path from the first level to the target setting item **MUST have complete, unbroken end-to-end interactions** (D-pad focus movement, selection, enter, back/escape). No shortcuts or missing interaction steps are allowed.
  - These layout and interaction rules **MUST be strictly applied and take effect for both China (CN) and Overseas prototypes**.
