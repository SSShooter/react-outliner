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
  const result = findItemById(items, id);
  if (!result) {
    return { newTree: items };
  }

  const { item, parent, index } = result;

  if (parent) {
    // Item is in a parent's children array
    const newParentChildren = [...parent.children];
    newParentChildren.splice(index, 1);
    parent.children = newParentChildren;
    return { newTree: items, removedItem: item };
  } else {
    // Item is at the root level
    const newItems = [...items];
    newItems.splice(index, 1);
    return { newTree: newItems, removedItem: item };
  }
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
  const result = findItemById(items, targetId);
  if (!result) {
    return items;
  }

  const { item, parent, index } = result;

  if (position === 'inside') {
    // Insert as a child of the target item
    const newItem = {
      ...item,
      children: [...item.children, itemToInsert],
      // Ensure the parent is expanded
      expanded: item.expanded === false ? true : item.expanded
    };
    
    // Replace the item in the tree
    if (parent) {
      const newParentChildren = [...parent.children];
      newParentChildren[index] = newItem;
      parent.children = newParentChildren;
    } else {
      const newItems = [...items];
      newItems[index] = newItem;
      return newItems;
    }
    return items;
  }

  if (parent) {
    // Target is in a parent's children array
    const newParentChildren = [...parent.children];
    const insertIndex = position === 'before' ? index : index + 1;
    newParentChildren.splice(insertIndex, 0, itemToInsert);
    parent.children = newParentChildren;
    return items;
  } else {
    // Target is at the root level
    const newItems = [...items];
    const insertIndex = position === 'before' ? index : index + 1;
    newItems.splice(insertIndex, 0, itemToInsert);
    return newItems;
  }
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