import { useState, useEffect } from 'react';
import { Outliner } from './components/Outliner';
import type { OutlineItem as OutlineItemType } from './types';
import { marked } from 'marked';
import { md2html } from './md2html'

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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 检查本地存储或系统偏好
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // 保存到本地存储
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    // 设置 HTML 的 class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}>
      <div className="max-w-4xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
            React Outliner Neo
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors duration-200 ${isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            title={isDarkMode ? '切换到浅色模式' : '切换到暗黑模式'}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
        <Outliner
          // readonly
          data={data}
          onChange={(data) => {
            console.log(data);
            setData(data);
          }}
          // markdown={(text) => marked.parse(text, { async: false }) as string}
          markdown={md2html}
        />
      </div>
    </div>
  );
}

export default App;
