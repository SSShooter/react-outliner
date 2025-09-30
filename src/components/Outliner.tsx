import { useState, useCallback } from 'react';
import { OutlineItem } from './OutlineItem';
import './OutlineItem.css';
import type { OutlineItem as OutlineItemType, ItemOperation } from '../types';
import { addSiblingOperation, addSiblingBeforeOperation, indentOperation, moveDownOperation, moveUpOperation, outdentOperation } from '../utils/outlineOperations';
import { moveToOperation } from '../utils/moveToOperation';
import { globalRef } from '../utils/globalRef';

export interface OutlineData  {
  id: string;
  topic: string;
  children?: OutlineData[];
  expanded?: boolean;
}

export interface OutlinerProps {
  data: OutlineData[];
  onChange?: (data: OutlineItemType[]) => void;
  readonly?: boolean;
  markdown?: (text:string, item:OutlineItemType ) => string;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function addChildren(input: OutlineData):OutlineItemType{
  return {
    ...input,
    children: input.children? input.children.map(addChildren):[],
  }
}

export function Outliner({ data, onChange,readonly,markdown }: OutlinerProps) {
  globalRef.markdown = markdown;
  const [items, setItems] = useState<OutlineItemType[]>(
    data.map(addChildren)
  );

  // Notify parent component when items change
  const handleItemsChange = useCallback((newItems: OutlineItemType[]) => {
    // Only trigger onChange if data actually changed
    const currentNodesJson = JSON.stringify(newItems);
    const previousNodesJson = JSON.stringify(data);
    
    setItems(newItems);
    if (currentNodesJson !== previousNodesJson && onChange) {
      onChange(newItems);
    }
  }, [onChange, data]);

  const updateItem = (id: string, update: Partial<OutlineItemType>) => {
    const updateItemInTree = (items: OutlineItemType[]): OutlineItemType[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, ...update };
        }
        if (item.children.length) {
          return {
            ...item,
            children: updateItemInTree(item.children)
          };
        }
        return item;
      });
    };

    handleItemsChange(updateItemInTree(items));
  };

  // 抽象的focus函数，用于在下一个渲染周期中聚焦指定元素
  const focusElement = (itemId: string, delay: number = 0) => {
    setTimeout(() => {
      const element = document.querySelector(`[data-item-id="${itemId}"]`) as HTMLElement;
      if (element) {
        element.focus();
      }
    }, delay);
  };

  const deleteItem = (id: string, parentId?: string) => {

    // 在删除前找到下一个应该获得焦点的元素
    const currentElement = document.querySelector(`[data-item-id="${id}"]`) as HTMLElement;
    let nextFocusElement: HTMLElement | null = null;

    if (currentElement) {
      // 尝试找到前一个兄弟节点的最后一个可见子节点
      const allItems = document.querySelectorAll('[data-outline-item]');
      const currentIndex = Array.from(allItems).findIndex(el => el === currentElement);

      if (currentIndex > 0) {
        nextFocusElement = allItems[currentIndex - 1] as HTMLElement;
      } else if (parentId) {
        // 如果没有前一个兄弟节点，则聚焦到父节点
        nextFocusElement = document.querySelector(`[data-item-id="${parentId}"]`) as HTMLElement;
      }
    }

    const deleteItemFromTree = (items: OutlineItemType[]): OutlineItemType[] => {
      return items.map(item => {
        // If this is the parent item, handle the deletion
        if (item.id === parentId) {
          const currentIndex = item.children.findIndex(child => child.id === id);
          if (currentIndex !== -1) {
            const newChildren = [...item.children];
            newChildren.splice(currentIndex, 1);
            return { ...item, children: newChildren };
          }
        }

        // Continue searching in children
        if (item.children.length) {
          return {
            ...item,
            children: deleteItemFromTree(item.children)
          };
        }
        return item;
      }).filter(item => item.id !== id); // Remove the item if it's at this level
    };

    const newItems = deleteItemFromTree(items);
    handleItemsChange(newItems);

    // 在下一个渲染周期中设置焦点
    if (nextFocusElement) {
      const itemId = nextFocusElement.getAttribute('data-item-id');
      if (itemId) {
        focusElement(itemId);
      }
    }
  };

  const addChild = (parentId: string) => {
    const newItem = {
      id: generateId(),
      topic: '',
      children: [],
    };

    const addChildToItem = (items: OutlineItemType[]): OutlineItemType[] => {
      return items.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [...item.children, newItem],
          };
        }
        if (item.children.length) {
          return {
            ...item,
            children: addChildToItem(item.children)
          };
        }
        return item;
      });
    };

    handleItemsChange(addChildToItem(items));

    // 在下一个渲染周期中聚焦新创建的子项
    focusElement(newItem.id);
  };

  const handleOperation = (operation: ItemOperation) => {
    if (operation.type === 'addSibling') {
      const newItem = {
        id: generateId(),
        topic: '',
        children: [],
      };

      const newItems = addSiblingOperation(items, operation.id, operation.parentId, newItem);
      handleItemsChange(newItems);

      if (operation.shouldFocusNew) {
        focusElement(newItem.id);
      }
    } else if (operation.type === 'addSiblingBefore') {
      const newItem = {
        id: generateId(),
        topic: '',
        children: [],
      };

      const newItems = addSiblingBeforeOperation(items, operation.id, operation.parentId, newItem);
      handleItemsChange(newItems);

      if (operation.shouldFocusNew) {
        focusElement(newItem.id);
      }
    } else if (operation.type === 'indent') {
      const newItems = indentOperation(items, operation.id, operation.parentId, operation.topic);
      handleItemsChange(newItems);

      if (operation.shouldFocusCurrent) {
        focusElement(operation.id);
      }
    } else if (operation.type === 'outdent') {
      if (!operation.parentId) return;

      const newItems = outdentOperation(items, operation.id, operation.parentId, operation.topic || '');
      handleItemsChange(newItems);

      if (operation.shouldFocusCurrent) {
        focusElement(operation.id);
      }
    } else if (operation.type === 'moveUp') {
      const newItems = moveUpOperation(items, operation.id, operation.parentId);
      handleItemsChange(newItems);

      if (operation.shouldFocusCurrent) {
        focusElement(operation.id);
      }
    } else if (operation.type === 'moveDown') {
      const newItems = moveDownOperation(items, operation.id, operation.parentId);
      handleItemsChange(newItems);

      if (operation.shouldFocusCurrent) {
        focusElement(operation.id);
      }
    } else if (operation.type === 'moveTo') {
      if (operation.draggedId && operation.targetId && operation.dropPosition) {
        const dropPosition = operation.dropPosition;
        const newItems = moveToOperation(items, operation.draggedId, operation.targetId, dropPosition);
        handleItemsChange(newItems);

        if (operation.shouldFocusCurrent) {
          focusElement(operation.draggedId);
        }
      }
    }
  };

  return (
    <div className="outliner-container">      
      <div className="outliner-items">
        {items.map((item) => (
          <OutlineItem
            key={item.id}
            items={items}
            item={item}
            level={0}
            onUpdate={updateItem}
            onDelete={deleteItem}
            onAddChild={addChild}
            onOperation={handleOperation}
            readonly={readonly}
          />
        ))}
      </div>
    </div>
  );
}