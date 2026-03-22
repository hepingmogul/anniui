# React 项目初始化指南

本指南基于当前 monorepo 工程结构（pnpm workspace），介绍如何在 `packages/` 目录下新建并初始化一个 React 子包。

---

## 前置条件

| 工具 | 版本要求 |
|------|----------|
| Node.js | >= 18.x |
| pnpm | >= 8.x |

安装 pnpm（如果尚未安装）：

```bash
npm install -g pnpm
```

---

## 目录结构

```
ui/
├── package.json              # 根 package.json（private: true）
├── pnpm-workspace.yaml       # workspace 配置
├── docs/                     # 项目文档
└── packages/
    └── react/             # React UI 子包（本指南目标）
        ├── index.html
        ├── package.json
        ├── tsconfig.json
        ├── vite.config.ts
        └── src/
            ├── main.tsx
            └── App.tsx
```

---

## 第一步：初始化子包

在 `packages/` 下创建新的 React 子包目录，并初始化 `package.json`：

```bash
mkdir packages/react
cd packages/react
pnpm init
```

生成的 `package.json` 建议修改为如下结构：

```json
{
  "name": "@anniui/react",
  "version": "0.0.1",
  "private": true,
  "description": "React UI 组件库",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

> `name` 字段使用 `@ui/` 前缀，与 workspace 内其他包保持统一命名规范。

---

## 第二步：安装依赖

在子包目录内安装 React 及构建工具：

```bash
# 安装 React 核心依赖
pnpm add react react-dom

# 安装开发依赖（TypeScript + Vite）
pnpm add -D typescript vite @vitejs/plugin-react @types/react @types/react-dom
```

如需在整个 workspace 根目录统一安装，可在根目录执行：

```bash
pnpm add react react-dom -w
```

---

## 第三步：配置 TypeScript

在子包根目录创建 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

---

## 第四步：配置 Vite

在子包根目录创建 `vite.config.ts`：

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

---

## 第五步：创建入口文件

**`index.html`**（子包根目录）：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React UI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**`src/main.tsx`**：

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**`src/App.tsx`**：

```tsx
export default function App() {
  return (
    <div>
      <h1>Hello, React!</h1>
    </div>
  )
}
```

---

## 第六步：在根目录安装所有依赖

回到 monorepo 根目录，执行：

```bash
cd ../../   # 回到 ui/ 根目录
pnpm install
```

pnpm 会根据 `pnpm-workspace.yaml` 自动识别所有子包并统一安装依赖。

---

## 第七步：启动开发服务器

```bash
# 在子包目录内启动
cd packages/react
pnpm dev

# 或者在根目录通过 --filter 启动指定包
pnpm --filter @anniui/react dev
```

默认访问地址：[http://localhost:5173](http://localhost:5173)

---

## 在 Workspace 内引用其他包

如果需要在 `react` 中使用 workspace 内的其他包（例如组件库 `@anniui/react`），可以直接添加依赖：

```bash
pnpm add @anniui/react --workspace
```

然后在代码中正常 import：

```ts
import { Button } from '@anniui/react'
```

---

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装所有 workspace 依赖 |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产产物 |
| `pnpm --filter <name> <script>` | 在指定子包中执行脚本 |
| `pnpm add <pkg> -w` | 在根 workspace 安装依赖 |
| `pnpm add <pkg> --workspace` | 引用 workspace 内部包 |
