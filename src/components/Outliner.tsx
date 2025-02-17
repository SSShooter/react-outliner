import { useState, useCallback } from 'react';
import { OutlineItem } from './OutlineItem';
import type { OutlineItem as OutlineItemType, ItemOperation } from '../types';
import { addSiblingOperation, indentOperation, moveDownOperation, moveUpOperation, outdentOperation } from '../utils/outlineOperations';

export type Node = {
  id: string;
  topic: string;
  expanded?: boolean;
  children?: Node[];
};

interface OutlinerProps {
  data: Node[];
  onChange: (data: Node[]) => void;
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Convert Node format to OutlineItem format
function nodeToOutlineItem(node: Node): OutlineItemType {
  return {
    id: generateId(),
    content: node.topic,
    children: node.children?.map(nodeToOutlineItem) || [],
    isCollapsed: false,
  };
}

// Convert OutlineItem format back to Node format
function outlineItemToNode(item: OutlineItemType): Node {
  return {
    id: item.id,
    topic: item.content,
    ...(item.children.length > 0 && { children: item.children.map(outlineItemToNode) }),
  };
}

export function Outliner({ data, onChange }: OutlinerProps) {
  const [items, setItems] = useState<OutlineItemType[]>(() => 
    data.map(nodeToOutlineItem)
  );
  const [focusId, setFocusId] = useState<string | undefined>();

  // Notify parent component when items change
  const handleItemsChange = useCallback((newItems: OutlineItemType[]) => {
    const newNodes = newItems.map(outlineItemToNode);
    // Only trigger onChange if data actually changed
    const currentNodesJson = JSON.stringify(newNodes);
    const previousNodesJson = JSON.stringify(data);
    
    setItems(newItems);
    if (currentNodesJson !== previousNodesJson) {
      onChange(newNodes);
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
      if (!item.children.length || item.isCollapsed) {
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
      content: '',
      children: [],
      isCollapsed: false,
    };

    const addChildToItem = (items: OutlineItemType[]): OutlineItemType[] => {
      return items.map(item => {
        if (item.id === parentId) {
          return {
            ...item,
            children: [...item.children, newItem],
            isCollapsed: false
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
        content: '',
        children: [],
        isCollapsed: false,
      };

      const newItems = addSiblingOperation(items, operation.id, operation.parentId, newItem);
      handleItemsChange(newItems);
      
      if (operation.shouldFocusNew) {
        setFocusId(newItem.id);
      }
    } else if (operation.type === 'indent') {
      const newItems = indentOperation(items, operation.id, operation.parentId, operation.content);
      handleItemsChange(newItems);
      
      if (operation.shouldFocusCurrent) {
        setFocusId(operation.id);
      }
    } else if (operation.type === 'outdent') {
      if (!operation.parentId) return;

      const newItems = outdentOperation(items, operation.id, operation.parentId, operation.content);
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
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">      
      <div className="">
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
          />
        ))}
      </div>
    </div>
  );
}