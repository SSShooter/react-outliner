import type { OutlineItem as OutlineItemType } from '../types';

/**
 * Find an item by its ID in the tree structure
 * @param items The tree structure to search in
 * @param id The ID to find
 * @returns The item and its parent if found, undefined otherwise
 */
function findItemById(
  items: OutlineItemType[],
  id: string,
  parent?: OutlineItemType
): { item: OutlineItemType; parent?: OutlineItemType; index: number } | undefined {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.id === id) {
      return { item, parent, index: i };
    }

    if (item.children.length) {
      const result = findItemById(item.children, id, item);
      if (result) {
        return result;
      }
    }
  }

  return undefined;
}

/**
 * Remove an item from its current position in the tree
 * @param items The tree structure
 * @param id The ID of the item to remove
 * @returns The new tree structure and the removed item
 */
function removeItemFromTree(
  items: OutlineItemType[],
  id: string
): { newTree: OutlineItemType[]; removedItem?: OutlineItemType } {
  let removedItem: OutlineItemType | undefined;

  const removeFromTree = (items: OutlineItemType[]): OutlineItemType[] => {
    return items.map(item => {
      if (item.id === id) {
        removedItem = item;
        return null; // Mark for removal
      }
      
      if (item.children.length > 0) {
        const newChildren = removeFromTree(item.children).filter(child => child !== null);
        return { ...item, children: newChildren };
      }
      
      return item;
    }).filter(item => item !== null) as OutlineItemType[];
  };

  const newTree = removeFromTree(items);
  return { newTree, removedItem };
}

/**
 * Insert an item at a specific position in the tree
 * @param items The tree structure
 * @param targetId The ID of the target item
 * @param itemToInsert The item to insert
 * @param position The position relative to the target (before, after, inside)
 * @returns The new tree structure
 */
function insertItemIntoTree(
  items: OutlineItemType[],
  targetId: string,
  itemToInsert: OutlineItemType,
  position: 'before' | 'after' | 'inside' = 'after'
): OutlineItemType[] {
  const insertIntoTree = (items: OutlineItemType[]): OutlineItemType[] => {
    const newItems: OutlineItemType[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.id === targetId) {
        if (position === 'before') {
          newItems.push(itemToInsert, item);
        } else if (position === 'after') {
          newItems.push(item, itemToInsert);
        } else if (position === 'inside') {
          // Insert as a child and ensure the parent is expanded
          newItems.push({
            ...item,
            children: [...item.children, itemToInsert],
            expanded: item.expanded === false ? true : item.expanded
          });
        }
      } else {
        // Process children recursively
        if (item.children.length > 0) {
          const newChildren = insertIntoTree(item.children);
          // Only create new object if children actually changed
          if (newChildren !== item.children) {
            newItems.push({ ...item, children: newChildren });
          } else {
            newItems.push(item);
          }
        } else {
          newItems.push(item);
        }
      }
    }
    
    return newItems;
  };

  return insertIntoTree(items);
}

/**
 * Move an item to a new position in the tree
 * @param items The tree structure
 * @param draggedId The ID of the item being dragged
 * @param targetId The ID of the target item
 * @param position The position relative to the target (before, after, inside)
 * @returns The new tree structure
 */
export function moveToOperation(
  items: OutlineItemType[],
  draggedId: string,
  targetId: string,
  position: 'before' | 'after' | 'inside'
): OutlineItemType[] {
  console.log('moveToOperation', items, draggedId, targetId, position);
  // Don't do anything if trying to move an item to itself
  if (draggedId === targetId) {
    return items;
  }

  // Check if target is a descendant of the dragged item
  const isDescendant = (parent: OutlineItemType, childId: string): boolean => {
    // Check if any of the children or their descendants have the target ID
    return parent.children.some(child => 
      child.id === childId || isDescendant(child, childId)
    );
  };

  const draggedItem = findItemById(items, draggedId);
  if (draggedItem && position === 'inside') {
    const targetItem = findItemById(items, targetId);
    if (targetItem && isDescendant(draggedItem.item, targetId)) {
      return items; // Prevent moving a parent into its own child
    }
  }

  // Remove the item from its current position
  const { newTree, removedItem } = removeItemFromTree([...items], draggedId);
  if (!removedItem) {
    return items;
  }

  // Insert the item at the new position
  return insertItemIntoTree(newTree, targetId, removedItem, position);
}