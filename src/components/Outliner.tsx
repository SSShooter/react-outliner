import { useState, useCallback } from 'react';
import { OutlineItem } from './OutlineItem';
import type { OutlineItem as OutlineItemType, ItemOperation } from '../types';

export type Node = {
  topic: string;
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

    const deleteItemFromTree = (items: OutlineItemType[]): OutlineItemType[] => {
      // Handle root level items
      if (!parentId) {
        const currentIndex = items.findIndex(item => item.id === id);
        if (currentIndex !== -1) {
          // Set focus to previous sibling if exists
          if (currentIndex > 0) {
            nextFocusId = items[currentIndex - 1].id;
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
            // Set focus to previous sibling if exists, otherwise to parent
            if (currentIndex > 0) {
              nextFocusId = item.children[currentIndex - 1].id;
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

      if (operation.parentId) {
        const addSiblingToParent = (items: OutlineItemType[]): OutlineItemType[] => {
          return items.map(item => {
            if (item.id === operation.parentId) {
              const newChildren = [...item.children];
              const currentIndex = newChildren.findIndex(child => child.id === operation.id);
              if (currentIndex !== -1) {
                newChildren.splice(currentIndex + 1, 0, newItem);
              }
              return { ...item, children: newChildren };
            }
            if (item.children.length) {
              return { ...item, children: addSiblingToParent(item.children) };
            }
            return item;
          });
        };
        handleItemsChange(addSiblingToParent(items));
      } else {
        const currentIndex = items.findIndex(item => item.id === operation.id);
        if (currentIndex !== -1) {
          const newItems = [...items];
          newItems.splice(currentIndex + 1, 0, newItem);
          handleItemsChange(newItems);
        }
      }
      if (operation.shouldFocusNew) {
        setFocusId(newItem.id);
      }
    } else if (operation.type === 'indent') {
      if (operation.parentId) {
        const indentInParent = (items: OutlineItemType[]): OutlineItemType[] => {
          return items.map(item => {
            if (item.id === operation.parentId) {
              const children = [...item.children];
              const currentIndex = children.findIndex(child => child.id === operation.id);
              if (currentIndex > 0) {
                const itemToMove = children[currentIndex];
                itemToMove.content = operation.content || itemToMove.content;
                const newParent = children[currentIndex - 1];
                children.splice(currentIndex, 1);
                newParent.children.push(itemToMove);
                return { ...item, children };
              }
            }
            if (item.children.length) {
              return { ...item, children: indentInParent(item.children) };
            }
            return item;
          });
        };
        handleItemsChange(indentInParent(items));
      } else {
        const currentIndex = items.findIndex(item => item.id === operation.id);
        if (currentIndex > 0) {
          const newItems = [...items];
          const itemToMove = newItems[currentIndex];
          itemToMove.content = operation.content || itemToMove.content;
          newItems.splice(currentIndex, 1);
          newItems[currentIndex - 1].children.push(itemToMove);
          handleItemsChange(newItems);
        }
      }
      if (operation.shouldFocusCurrent) {
        setFocusId(operation.id);
      }
    } else if (operation.type === 'outdent') {
      if (!operation.parentId) return;

      const findParentAndOutdent = (
        items: OutlineItemType[],
        targetId: string,
        parentId: string
      ): OutlineItemType[] => {
        // First try to handle the case where the parent is at the root level
        const parentIndex = items.findIndex(item => item.id === parentId);
        if (parentIndex !== -1) {
          const parent = items[parentIndex];
          const targetIndex = parent.children.findIndex(child => child.id === targetId);
          if (targetIndex !== -1) {
            const itemToMove = parent.children[targetIndex];
            itemToMove.content = operation.content || itemToMove.content;
            // Remove the item from its parent
            parent.children.splice(targetIndex, 1);
            // Insert it after the parent in the root array
            items.splice(parentIndex + 1, 0, itemToMove);
            return items;
          }
        }

        // If not found at root level, recursively search through all items
        return items.map(item => {
          if (item.children.length > 0) {
            const childParentIndex = item.children.findIndex(child => child.id === parentId);
            if (childParentIndex !== -1) {
              const childParent = item.children[childParentIndex];
              const targetIndex = childParent.children.findIndex(child => child.id === targetId);
              if (targetIndex !== -1) {
                const itemToMove = childParent.children[targetIndex];
                itemToMove.content = operation.content || itemToMove.content;
                // Remove the item from its parent
                childParent.children.splice(targetIndex, 1);
                // Insert it after its parent in the current level
                item.children.splice(childParentIndex + 1, 0, itemToMove);
              }
            }
            return {
              ...item,
              children: findParentAndOutdent(item.children, targetId, parentId)
            };
          }
          return item;
        });
      };

      handleItemsChange(findParentAndOutdent(items, operation.id, operation.parentId));
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