import { useState, useCallback } from 'react';
import { OutlineItem } from './OutlineItem';
import './Outliner.css';
import type { OutlineItem as OutlineItemType, ItemOperation } from '../types';
import { addSiblingOperation, addSiblingBeforeOperation, indentOperation, moveDownOperation, moveUpOperation, outdentOperation } from '../utils/outlineOperations';
import { moveToOperation } from '../utils/moveToOperation';

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

export function Outliner({ data, onChange,readonly }: OutlinerProps) {
  const [items, setItems] = useState<OutlineItemType[]>(
    data.map(addChildren)
  );
  const [focusId, setFocusId] = useState<string | undefined>();

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

  const deleteItem = (id: string, parentId?: string) => {
    let nextFocusId: string | undefined;

    // Helper function to find the last visible child of an item
    const findLastVisibleChild = (item: OutlineItemType): string => {
      if (!item.children.length || item.expanded === false) {
        return item.id;
      }
      return findLastVisibleChild(item.children[item.children.length - 1]);
    };

    const deleteItemFromTree = (items: OutlineItemType[]): OutlineItemType[] => {
      // Handle root level items
      if (!parentId) {
        const currentIndex = items.findIndex(item => item.id === id);
        if (currentIndex !== -1) {
          // Set focus to previous sibling's last visible child if exists
          if (currentIndex > 0) {
            const prevItem = items[currentIndex - 1];
            nextFocusId = findLastVisibleChild(prevItem);
          }
        }
      }

      return items.map(item => {
        // If this is the parent item, handle the deletion and set focus
        if (item.id === parentId) {
          const currentIndex = item.children.findIndex(child => child.id === id);
          if (currentIndex !== -1) {
            const newChildren = [...item.children];
            newChildren.splice(currentIndex, 1);
            // Set focus to previous sibling's last visible child if exists, otherwise to parent
            if (currentIndex > 0) {
              const prevItem = item.children[currentIndex - 1];
              nextFocusId = findLastVisibleChild(prevItem);
            } else {
              nextFocusId = item.id;
            }
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
    
    // Set the focus after state update
    if (nextFocusId) {
      setFocusId(nextFocusId);
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
    setFocusId(newItem.id);
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
        setFocusId(newItem.id);
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
        setFocusId(newItem.id);
      }
    } else if (operation.type === 'indent') {
      const newItems = indentOperation(items, operation.id, operation.parentId, operation.topic);
      handleItemsChange(newItems);
      
      if (operation.shouldFocusCurrent) {
        setFocusId(operation.id);
      }
    } else if (operation.type === 'outdent') {
      if (!operation.parentId) return;

      const newItems = outdentOperation(items, operation.id, operation.parentId, operation.topic);
      handleItemsChange(newItems);
      
      if (operation.shouldFocusCurrent) {
        setFocusId(operation.id);
      }
    } else if (operation.type === 'moveUp') {
      const newItems = moveUpOperation(items, operation.id, operation.parentId);
      handleItemsChange(newItems);
      
      if (operation.shouldFocusCurrent) {
        setFocusId(operation.id);
      }
    } else if (operation.type === 'moveDown') {
      const newItems = moveDownOperation(items, operation.id, operation.parentId);
      handleItemsChange(newItems);
      
      if (operation.shouldFocusCurrent) {
        setFocusId(operation.id);
      }
    } else if (operation.type === 'moveTo') {
      if (operation.draggedId && operation.targetId && operation.dropPosition) {
        const dropPosition = operation.dropPosition;
        const newItems = moveToOperation(items, operation.draggedId, operation.targetId, dropPosition);
        handleItemsChange(newItems);
        
        if (operation.shouldFocusCurrent) {
          setFocusId(operation.draggedId);
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
            item={item}
            level={0}
            onUpdate={updateItem}
            onDelete={deleteItem}
            onAddChild={addChild}
            onOperation={handleOperation}
            focusId={focusId}
            onFocusItem={setFocusId}
            readonly={readonly}
          />
        ))}
      </div>
    </div>
  );
}