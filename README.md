# React Outliner Neo

一个基于React和TypeScript开发的大纲编辑器组件，支持层级结构的内容组织和丰富的快捷键操作。

## 功能特点

- 丰富的键盘快捷操作
  - Enter: 创建新的同级条目
  - Tab: 缩进条目（增加层级）
  - Shift + Tab: 减少缩进（减少层级）
  - Alt + ↑: 向上移动条目
  - Alt + ↓: 向下移动条目
  - ↑/↓: 在条目间快速导航
- 支持条目的展开/折叠
- 支持条目的删除操作

## 安装

```bash
pnpm install
```

## 开发

```bash
pnpm dev
```

## 构建

```bash
pnpm build
```

## 使用方法

```tsx
import { Outliner } from './components/Outliner';

const initialData = [
  {
    topic: '根节点',
    children: [
      {
        topic: '子节点1',
        children: [
          {
            topic: '子节点1.1'
          }
        ]
      }
    ]
  }
];

function App() {
  const handleChange = (data) => {
    console.log('大纲数据已更新:', data);
  };

  return (
    <Outliner
      data={initialData}
      onChange={handleChange}
    />
  );
}
```

## 技术栈

- React 18
- TypeScript
- Vite
- TailwindCSS
- Lucide React (图标库)

## 开发环境要求

- Node.js >= 18
- pnpm >= 8