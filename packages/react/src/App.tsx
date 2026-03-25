import { Moon, Sun } from 'lucide-react'
import { lazy, Suspense } from 'react'
import { NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { Aside, Container, Main, useTheme } from './index'

const ContainerPage = lazy(() => import('./pages/ContainerPage'))
const BadgePage = lazy(() => import('./pages/BadgePage'))
const BreadcrumbPage = lazy(() => import('./pages/BreadcrumbPage'))
const ButtonPage = lazy(() => import('./pages/ButtonPage'))
const CardPage = lazy(() => import('./pages/CardPage'))
const CheckboxPage = lazy(() => import('./pages/CheckboxPage'))
const CascaderPage = lazy(() => import('./pages/CascaderPage'))
const DividerPage = lazy(() => import('./pages/DividerPage'))
const FormPage = lazy(() => import('./pages/FormPage'))
const IndexPage = lazy(() => import('./pages/IndexPage'))
const InputPage = lazy(() => import('./pages/InputPage'))
const InputNumberPage = lazy(() => import('./pages/InputNumberPage'))
const RadioPage = lazy(() => import('./pages/RadioPage'))
const SliderPage = lazy(() => import('./pages/SliderPage'))
const GridPage = lazy(() => import('./pages/GridPage'))
const SpacePage = lazy(() => import('./pages/SpacePage'))
const SpinnerPage = lazy(() => import('./pages/SpinnerPage'))
const SwitchPage = lazy(() => import('./pages/SwitchPage'))
const TabsPage = lazy(() => import('./pages/TabsPage'))
const ToastPage = lazy(() => import('./pages/ToastPage'))
const DialogPage = lazy(() => import('./pages/DialogPage'))
const AnchorPage = lazy(() => import('./pages/AnchorPage'))
const FollowPage = lazy(() => import('./pages/FollowPage'))
const PopoverPage = lazy(() => import('./pages/PopoverPage'))

const navItems = [
  { label: '总览', path: '/' },
  { label: '基础', type: 'group' },
  { label: 'Button', path: '/button' },
  { label: '布局', type: 'group' },
  { label: 'Container', path: '/container' },
  { label: 'Row / Col', path: '/grid' },
  { label: 'Space', path: '/space' },
  { label: 'Divider', path: '/divider' },
  { label: '表单', type: 'group' },
  { label: 'Form', path: '/form' },
  { label: 'Input', path: '/input' },
  { label: 'InputNumber', path: '/input-number' },
  { label: 'Checkbox', path: '/checkbox' },
  { label: 'Cascader', path: '/cascader' },
  { label: 'Radio', path: '/radio' },
  { label: 'Switch', path: '/switch' },
  { label: 'Slider', path: '/slider' },
  { label: '数据展示', type: 'group' },
  { label: 'Badge', path: '/badge' },
  { label: 'Card', path: '/card' },
  { label: '反馈', type: 'group' },
  { label: 'Spinner', path: '/spinner' },
  { label: 'Toast', path: '/toast' },
  { label: 'Dialog', path: '/dialog' },
  { label: 'Popover', path: '/popover' },
  { label: '导航', type: 'group' },
  { label: 'Tabs', path: '/tabs' },
  { label: 'Breadcrumb', path: '/breadcrumb' },
  { label: 'Anchor', path: '/anchor' },
  { label: '工具', type: 'group' },
  { label: 'Follow', path: '/follow' },
]

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-4 py-3 w-full text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors border-t border-neutral-200 dark:border-neutral-700"
      aria-label={theme === 'dark' ? '切换为明亮模式' : '切换为暗黑模式'}
    >
      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      {theme === 'dark' ? '明亮模式' : '暗黑模式'}
    </button>
  )
}

function Layout() {
  return (
    <Container className="h-screen bg-neutral-50 overflow-hidden">
      <Aside className="w-48 border-r border-neutral-200 dark:border-neutral-700 bg-surface">
        <div className="px-4 py-5 border-b border-neutral-100 dark:border-neutral-700">
          <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">React UI</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {navItems.map((item, i) =>
            item.type === 'group' ? (
              <p key={i} className="px-4 pt-4 pb-1 text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                {item.label}
              </p>
            ) : (
              <NavLink
                key={item.path}
                to={item.path!}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `block px-4 py-1.5 text-sm rounded-md mx-2 transition-colors ${isActive
                    ? 'bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`
                }
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>
        <ThemeToggle />
      </Aside>

      <Main className="max-w-3xl mx-auto px-8 py-10">
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </Main>
    </Container>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<IndexPage />} />
        <Route path="button" element={<ButtonPage />} />
        <Route path="badge" element={<BadgePage />} />
        <Route path="breadcrumb" element={<BreadcrumbPage />} />
        <Route path="card" element={<CardPage />} />
        <Route path="checkbox" element={<CheckboxPage />} />
        <Route path="cascader" element={<CascaderPage />} />
        <Route path="divider" element={<DividerPage />} />
        <Route path="form" element={<FormPage />} />
        <Route path="input" element={<InputPage />} />
        <Route path="input-number" element={<InputNumberPage />} />
        <Route path="radio" element={<RadioPage />} />
        <Route path="slider" element={<SliderPage />} />
        <Route path="container" element={<ContainerPage />} />
        <Route path="grid" element={<GridPage />} />
        <Route path="space" element={<SpacePage />} />
        <Route path="spinner" element={<SpinnerPage />} />
        <Route path="switch" element={<SwitchPage />} />
        <Route path="tabs" element={<TabsPage />} />
        <Route path="toast" element={<ToastPage />} />
        <Route path="dialog" element={<DialogPage />} />
        <Route path="popover" element={<PopoverPage />} />
        <Route path="anchor" element={<AnchorPage />} />
        <Route path="follow" element={<FollowPage />} />
      </Route>
    </Routes>
  )
}
