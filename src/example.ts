export const example = [
  {
    id: 'root1',
    topic: '项目计划',
    children: [
      {
        id: '1-1',
        topic: '# 前期准备',
        children: [
          { id: '1-1-1', topic: '## 需求分析', children: [] },
          { id: '1-1-2', topic: '**技术**选型', children: [] },
        ],
      },
      {
        id: '1-2',
        topic: '开发阶段',
        children: [
          { id: '1-2-1', topic: '### 后端开发', children: [] },
          { id: '1-2-2', topic: '### 前端开发', children: [] },
          { id: '1-2-3', topic: '### 单元测试', children: [] },
        ],
      },
      {
        id: '1-3',
        topic: '部署上线',
        children: [
          { id: '1-3-1', topic: '测试环境部署', children: [] },
          { id: '1-3-2', topic: '生产环境部署', children: [] },
        ],
      },
    ],
  },
  {
    id: 'root2',
    topic: '# 数学与科学',
    children: [
      {
        id: '2-1',
        topic: '## 基础数学公式',
        children: [
          { id: '2-1-1', topic: '勾股定理: $a^2 + b^2 = c^2$', children: [] },
          { id: '2-1-2', topic: '二次方程: $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$', children: [] },
          { id: '2-1-3', topic: '欧拉公式: $e^{i\\pi} + 1 = 0$', children: [] },
        ],
      },
      {
        id: '2-2',
        topic: '## 微积分',
        children: [
          { id: '2-2-1', topic: '导数定义: $f\'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$', children: [] },
          { id: '2-2-2', topic: '积分: $\\int_a^b f(x)dx$', children: [] },
          { id: '2-2-3', topic: '牛顿-莱布尼茨公式: $\\int_a^b f\'(x)dx = f(b) - f(a)$', children: [] },
        ],
      },
      {
        id: '2-3',
        topic: '## 统计学',
        children: [
          { id: '2-3-1', topic: '正态分布: $f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$', children: [] },
          { id: '2-3-2', topic: '标准差: $\\sigma = \\sqrt{\\frac{\\sum(x_i - \\mu)^2}{N}}$', children: [] },
        ],
      },
    ],
  },
  {
    id: 'root3',
    topic: '# Markdown 语法测试',
    children: [
      {
        id: '3-1',
        topic: '## 文本格式',
        children: [
          { id: '3-1-1', topic: '**粗体文本** 和 *斜体文本*', children: [] },
          { id: '3-1-2', topic: '~~删除线~~ 和 `行内代码`', children: [] },
          { id: '3-1-3', topic: '> 这是一个引用块', children: [] },
          { id: '3-1-4', topic: `这是一个多行文本
            这是一个多行文本
            这是一个多行文本
            这是一个多行文本`, children: [] },
        ],
      },
      {
        id: '3-3',
        topic: '## 链接',
        children: [
          { id: '3-3-1', topic: '[GitHub](https://github.com)', children: [] },
        ],
      },
    ],
  },
];
