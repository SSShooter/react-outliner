import { useState, useEffect } from 'react';
import { Outliner } from './components/Outliner';
import type { OutlineItem as OutlineItemType } from './types';
import { markedWrapped } from './md2html';
import { example } from './example';
import { Eye, EyeOff, Moon, Sun } from 'lucide-react';

function App() {
  const [data, setData] = useState<OutlineItemType[]>(example);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
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
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
            React Outliner Neo
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsReadOnly(!isReadOnly)}
              className={`p-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium ${isReadOnly
                ? (isDarkMode ? 'bg-blue-900/40 text-blue-400 border border-blue-800/50' : 'bg-blue-50 text-blue-600 border border-blue-100')
                : (isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 border border-gray-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200')
                }`}
              title={isReadOnly ? '切换到编辑模式' : '切换到只读模式'}
            >
              {isReadOnly ? <EyeOff size={20} /> : <Eye size={20} />}
              <span className="text-sm hidden sm:inline">{isReadOnly ? '只读模式' : '编辑模式'}</span>
            </button>
            
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 rounded-xl transition-all duration-300 ${isDarkMode
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-gray-700'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200'
                }`}
              title={isDarkMode ? '切换到浅色模式' : '切换到暗黑模式'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
        <Outliner
          readonly={isReadOnly}
          data={data}
          onChange={(data) => {
            console.log(data);
            setData(data);
          }}
          markdown={markedWrapped}
        />
      </div>
    </div>
  );
}

export default App;
