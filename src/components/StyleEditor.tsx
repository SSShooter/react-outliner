import React from 'react';
import type { OutlineItem } from '../types';

interface StyleEditorProps {
  item: OutlineItem;
  onUpdate: (id: string, update: Partial<OutlineItem>) => void;
}

export function StyleEditor({ item, onUpdate }: StyleEditorProps) {
  const handleStyleChange = (
    property: keyof Required<OutlineItem>['style'], 
    value: string
  ) => {
    const newStyle = {
      ...(item.style || {}),
      [property]: value
    };
    
    onUpdate(item.id, { style: newStyle });
  };

  return (
    <div className="style-editor">
      <h3 className="text-lg font-medium mb-2">样式编辑</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">字体大小</label>
          <input
            type="text"
            value={item.style?.fontSize || ''}
            onChange={(e) => handleStyleChange('fontSize', e.target.value)}
            placeholder="例如: 16px"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">字体系列</label>
          <input
            type="text"
            value={item.style?.fontFamily || ''}
            onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
            placeholder="例如: Arial, sans-serif"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">文字颜色</label>
          <div className="flex items-center mt-1">
            <input
              type="color"
              value={item.style?.color || '#000000'}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="h-8 w-8 rounded-md border-gray-300 mr-2"
            />
            <input
              type="text"
              value={item.style?.color || ''}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              placeholder="例如: #FF0000"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">背景颜色</label>
          <div className="flex items-center mt-1">
            <input
              type="color"
              value={item.style?.background || '#ffffff'}
              onChange={(e) => handleStyleChange('background', e.target.value)}
              className="h-8 w-8 rounded-md border-gray-300 mr-2"
            />
            <input
              type="text"
              value={item.style?.background || ''}
              onChange={(e) => handleStyleChange('background', e.target.value)}
              placeholder="例如: #FFFF00"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">字体粗细</label>
          <select
            value={item.style?.fontWeight || ''}
            onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">默认</option>
            <option value="normal">正常</option>
            <option value="bold">粗体</option>
            <option value="lighter">细体</option>
          </select>
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">字体样式</label>
          <select
            value={item.style?.fontStyle || ''}
            onChange={(e) => handleStyleChange('fontStyle', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">默认</option>
            <option value="normal">正常</option>
            <option value="italic">斜体</option>
            <option value="oblique">倾斜</option>
          </select>
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">文本装饰</label>
          <select
            value={item.style?.textDecoration || ''}
            onChange={(e) => handleStyleChange('textDecoration', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">默认</option>
            <option value="underline">下划线</option>
            <option value="line-through">删除线</option>
            <option value="overline">上划线</option>
          </select>
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">宽度</label>
          <input
            type="text"
            value={item.style?.width || ''}
            onChange={(e) => handleStyleChange('width', e.target.value)}
            placeholder="例如: 100%"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">边框</label>
          <input
            type="text"
            value={item.style?.border || ''}
            onChange={(e) => handleStyleChange('border', e.target.value)}
            placeholder="例如: 1px solid #ccc"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">边框圆角</label>
          <input
            type="text"
            value={item.style?.borderRadius || ''}
            onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
            placeholder="例如: 4px"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">内边距</label>
          <input
            type="text"
            value={item.style?.padding || ''}
            onChange={(e) => handleStyleChange('padding', e.target.value)}
            placeholder="例如: 5px 10px"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
} 