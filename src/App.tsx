import React, { useState } from 'react';
import { Outliner, Node } from './components/Outliner';

function App() {
  const [data, setData] = useState<Node[]>([
    {
      topic: 'New Node',
      children: []
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          Outliner
        </h1>
        <Outliner data={data} onChange={setData} />
      </div>
    </div>
  );
}

export default App;