# Cascader 组件功能需求梳理

## 1. 目标与范围

`Cascader` 用于多层级数据的路径选择，适合行政区划、组织架构、类目体系等场景。  
本需求文档聚焦组件能力定义，不包含视觉细节稿与业务数据接口实现。

开发基线：
- 基于现有 `packages/react/src/core/Popover/Popover.tsx` 实现弹层能力，不重复造弹层基础轮子
- Cascader 重点实现“输入框 + 级联面板内容 + 选择逻辑”，弹层开关与定位能力复用 Popover
- 多选勾选控件统一复用 `packages/react/src/core/Checkbox/Checkbox.tsx`

参考来源：
- Arco Design Cascader 组件文档（能力对标）  
  https://arco.design/react/components/cascader

## 2. 使用场景

- 省/市/区三级地址选择
- 组织树路径选择（集团 -> 分部 -> 团队）
- 商品类目选择（一级类目 -> 二级类目 -> 叶子类目）
- 任意深度树结构路径选择

## 3. 数据模型要求

### 3.1 选项结构

- 每个节点至少包含：
  - `name: ReactNode`：展示文本
  - `value: string | number`：唯一值
  - `children?: Option[]`：子节点
- 默认 option 数据格式统一为 `{ value, name }`
- 支持字段映射配置：
  - `valueKey`：指定值字段名（默认 `value`）
  - `nameKey`：指定展示字段名（默认 `name`）
- 可选字段：
  - `disabled?: boolean`：禁用当前节点
  - `isLeaf?: boolean`：标识叶子节点（用于懒加载）
  - `extra?: any`：业务附加信息

### 3.2 值模型

- 单选：
  - 默认返回完整路径值数组：`(string | number)[]`（本项目默认策略）
  - 可扩展为仅返回叶子值（通过配置控制）
- 多选：
  - 返回多条路径：`Array<(string | number)[]>`
  - 支持“父子关联勾选”与“父子独立勾选”两种策略
  - 默认父子关联策略与 `TreeSelect` 保持一致

## 4. 核心功能需求

### 4.1 选择模式

- 支持单选（默认）和多选（`multiple`）两种模式
- 支持仅叶子节点可选（`checkStrictly=false` 时默认）
- 支持非叶子节点可选（`changeOnSelect` 或 `checkStrictly=true`）

### 4.2 受控与非受控

- 非受控：`defaultValue` 初始化后内部维护状态
- 受控：`value` + `onChange` 由外部驱动
- 受控和非受控行为与现有输入类组件保持一致

### 4.3 面板展开与路径导航

- 点击输入框弹出级联面板，按层级并列展示
- 鼠标悬停或点击可触发下一级展开（策略可配置）
- 当前选中路径需有明显高亮状态
- 支持 `popupVisible` / `onPopupVisibleChange` 控制弹层开关
- 弹层实现要求基于 `Popover`：
  - 开关映射到 `open` / `defaultOpen` / `onOpenChange`
  - 关闭行为复用外部点击关闭与 `Esc` 关闭能力
  - 定位能力复用 `placement` / `offset` / `zIndex`
  - 弹层内容通过 Portal 挂载到 `document.body`

### 4.4 搜索能力

- 支持输入关键字过滤路径（`showSearch`）
- 默认匹配 `name` 文本（受 `nameKey` 影响），且可自定义过滤函数
- 搜索结果展示完整路径（例如：`浙江 / 杭州 / 西湖区`）
- 搜索命中后可直接选择结果并回填值
- 支持可配置的远程搜索模式：
  - 未配置远程搜索时，使用本地筛选（默认）
  - 配置远程搜索后，支持由业务侧返回匹配结果

### 4.5 懒加载能力

- 支持节点级异步加载子节点（如 `loadMore`）
- 展开未加载节点时触发加载，并展示 loading 状态
- 加载失败应支持重试
- 异步加载中避免重复请求同一节点

### 4.6 多选展示策略

- 支持输入框内 Tag 展示已选项
- 支持 `maxTagCount` 超出折叠显示（例如 `+3`）
- 支持 `showCheckedStrategy`：
  - 展示全部勾选路径
  - 仅展示父节点
  - 仅展示叶子节点
- 多选节点勾选 UI 使用现有 `Checkbox` 组件实现（含 `disabled`、`indeterminate` 能力）

### 4.7 清空与重置

- 支持 `allowClear` 显示清空按钮
- 清空后触发 `onChange(undefined | [])`
- 支持受控模式下外部重置值

### 4.8 禁用与只读

- 支持组件整体禁用 `disabled`
- 支持节点级禁用 `option.disabled`
- 只读模式下允许展示，不允许交互修改

### 4.9 面板自定义渲染

- 支持自定义渲染每列标题区域
- 支持自定义渲染面板底部操作区
- 自定义渲染应与默认交互兼容（不破坏选择、关闭、键盘导航）

## 5. 交互与可用性需求

### 5.1 输入与回填

- 有值时展示选中路径文本或自定义渲染内容
- 无值时展示 `placeholder`
- 支持通过 `valueKey`、`nameKey` 适配后端字段结构

### 5.2 键盘可访问性

- 支持 `Tab` 聚焦、`Enter` 打开或选择、`Esc` 关闭
- 支持方向键在同层与跨层导航
- 多选模式下支持空格键勾选

### 5.3 无障碍

- 提供必要的 ARIA 语义（combobox/listbox/tree 相关角色）
- 焦点可见，且屏幕阅读器可读当前路径与状态

## 6. 状态与事件需求

- `onChange(value, selectedOptions)`：值变化
- `onSearch(inputValue)`：搜索输入变化
- `onClear()`：清空
- `onPopupVisibleChange(visible)`：弹层开关
- `onLoadMore(option)`：懒加载触发

事件触发要求：
- 用户交互与受控回写均需触发一致的事件语义
- 禁用状态下不触发变更事件
- `onPopupVisibleChange` 与 Popover 的 `onOpenChange` 语义保持一致（布尔开关）

## 7. 视觉与布局要求（功能相关）

- 支持尺寸：`small` / `default` / `large`
- 支持状态：默认、悬停、聚焦、禁用、错误
- 支持弹层宽度跟随输入框或自定义宽度
- 层级列数过多时支持滚动容器
- 弹层基础样式容器沿用 Popover Content 能力，在此基础上扩展 Cascader 面板样式

## 8. 性能与工程要求

- 1,000+ 节点下基础展开与选择应保持流畅
- 搜索建议做防抖处理（可配置）
- 避免不必要重渲染，选项节点建议做 memo 化
- 为后续虚拟滚动扩展预留接口

## 9. 与 Form 集成要求

- 支持 `Form.Item` 校验与状态联动
- 支持必填、错误态、校验提示信息展示
- 支持 `name` 绑定与表单重置行为

## 10. 非功能需求

- 类型定义完整（TypeScript）：暴露 `Option`、`Value`、事件签名
- 主题变量可扩展（颜色、圆角、间距、阴影）
- 国际化支持（placeholder、空态、加载文案）
- 单元测试覆盖核心路径：单选、多选、搜索、懒加载、禁用、清空

## 11. 验收标准（MVP）

- 支持单选/多选、受控/非受控、清空、禁用
- 支持基础搜索与路径展示
- 支持懒加载基础流程（加载、成功、失败重试）
- 支持 Form 集成与基础键盘交互
- 关键行为具备测试用例并通过
- 多选场景使用 `Checkbox` 组件且勾选状态表现正确（选中/半选/禁用）

## 12. 暂不纳入本期

- 虚拟滚动与超大数据专项优化
- 移动端手势交互优化
- 高级自定义面板（完全自绘列布局）
- 重写或替换现有 Popover 定位/关闭机制

## 13. 已确认决策

- 默认值模型采用“路径数组”优先
- 多选时父子关联策略默认与 `TreeSelect` 保持一致
- 搜索模式需支持服务端远程搜索，可配置；未配置时使用本地筛选
- 需支持自定义渲染每列标题与底部操作区
- option 数据格式统一为 `{ value, name }`，并支持 `valueKey`、`nameKey` 自定义映射
- 多选勾选控件使用 `@packages/react/src/core/Checkbox/Checkbox.tsx`

