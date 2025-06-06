import { useState } from 'react'
import { Outliner } from './components/Outliner'
import type { OutlineItem as OutlineItemType } from './types';

function App() {
  const [data, setData] = useState<OutlineItemType[]>([
    {
      id: 'root1',
      topic: '大纲示例',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2563eb'
      },
      children: [
        {
          id: 'child1',
          topic: '普通节点',
          children: []
        },
        {
          id: 'child2',
          topic: '带样式的节点',
          style: {
            color: '#059669',
            background: '#ecfdf5',
            fontWeight: 'bold',
            border: '1px solid #10b981',
            borderRadius: '4px',
            padding: '2px 6px'
          },
          children: []
        },
        {
          id: 'child3',
          topic: '带子节点的节点',
          style: {
            color: '#7c3aed',
            fontFamily: 'Georgia, serif'
          },
          children: [
            {
              id: 'subchild1',
              topic: '子节点',
              style: {
                textDecoration: 'underline',
                fontStyle: 'italic'
              },
              children: []
            }
          ]
        }
      ],
    },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">React Outliner Neo</h1>
        <p className="mb-4 text-gray-600">点击节点右侧的调色板图标可以编辑节点样式</p>
        <Outliner
          data={data}
          onChange={(data) => {
            console.log(data)
            setData(data)
          }}
        />
      </div>
    </div>
  )
}

export default App
