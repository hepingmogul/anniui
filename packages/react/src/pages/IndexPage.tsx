import { useNavigate } from 'react-router-dom'

const components = [
  { name: 'Button', path: '/button', desc: '操作按钮，支持多种变体与状态', category: '基础' },
  { name: 'Space', path: '/space', desc: '设置组件间距，支持水平/垂直排列', category: '布局' },
  { name: 'Divider', path: '/divider', desc: '区隔内容的分割线，支持虚线与文字', category: '布局' },
  { name: 'Input', path: '/input', desc: '基础输入框，支持前缀、错误状态', category: '表单' },
  { name: 'Checkbox', path: '/checkbox', desc: '多项选择，支持半选与禁用状态', category: '表单' },
  { name: 'Badge', path: '/badge', desc: '徽标，用于展示消息数量或状态', category: '数据展示' },
  { name: 'Card', path: '/card', desc: '通用卡片容器，支持悬停效果', category: '数据展示' },
  { name: 'Spinner', path: '/spinner', desc: '加载旋转器，支持多种尺寸与颜色', category: '反馈' },
  { name: 'Toast', path: '/toast', desc: '全局消息提示，自动消失', category: '反馈' },
  { name: 'Tabs', path: '/tabs', desc: '选项卡切换，支持禁用状态', category: '导航' },
  { name: 'Breadcrumb', path: '/breadcrumb', desc: '面包屑导航，显示当前页面路径', category: '导航' },
  { name: 'Follow', path: '/follow', desc: '弹层定位，根据 trigger 计算 target 最佳摆放', category: '工具' },
]

const categoryColors: Record<string, string> = {
  基础: 'bg-info-light text-info',
  布局: 'bg-primary-light text-primary',
  表单: 'bg-success-light text-success',
  数据展示: 'bg-warning-light text-warning',
  反馈: 'bg-danger-light text-danger',
  导航: 'bg-info-light text-info-fg',
  工具: 'bg-primary-light text-primary',
}

export default function IndexPage() {
  const navigate = useNavigate()

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">React UI 组件库</h1>
      <p className="text-sm text-neutral-500 mb-8">
        共 {components.length} 个组件，点击卡片进入对应的示例页面。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((comp) => (
          <button
            key={comp.path}
            onClick={() => navigate(comp.path)}
            className="text-left p-4 rounded-lg border border-neutral-200 bg-surface hover:border-neutral-400 hover:shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-neutral-900">{comp.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[comp.category]}`}>
                {comp.category}
              </span>
            </div>
            <p className="text-sm text-neutral-500">{comp.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
