import { useState } from 'react';
import { Outliner } from './components/Outliner';
import type { OutlineItem as OutlineItemType } from './types';
import { marked } from 'marked';

const example = [
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
];

function App() {
  const [data, setData] = useState<OutlineItemType[]>(example);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          React Outliner Neo
        </h1>
        <Outliner
          // readonly
          data={data}
          onChange={(data) => {
            console.log(data);
            setData(data);
          }}
          markdown={(text) => marked.parse(text, { async: false }) as string}
        />
      </div>
    </div>
  );
}

export default App;
