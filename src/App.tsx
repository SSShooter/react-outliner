import { useState } from 'react'
import { Outliner, Node } from './components/Outliner'

function App() {
  const [data, setData] = useState<Node[]>([
    {
      id: 'xxx',
      topic: 'New Node',
      children: [],
    },
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">React Outliner Neo</h1>
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
