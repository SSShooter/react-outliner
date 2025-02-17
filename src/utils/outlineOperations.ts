import type { OutlineItem as OutlineItemType } from '../types';

/**
 * 在指定节点后添加一个新的兄弟节点
 */
export function addSiblingOperation(
  items: OutlineItemType[],
  targetId: string,
  parentId: string | undefined,
  newItem: OutlineItemType
): OutlineItemType[] {
  if (parentId) {
    return items.map(item => {
      if (item.id === parentId) {
        const newChildren = [...item.children];
        const currentIndex = newChildren.findIndex(child => child.id === targetId);
        if (currentIndex !== -1) {
          newChildren.splice(currentIndex + 1, 0, newItem);
        }
        return { ...item, children: newChildren };
      }
      if (item.children.length) {
        return { ...item, children: addSiblingOperation(item.children, targetId, parentId, newItem) };
      }
      return item;
    });
  } else {
    const currentIndex = items.findIndex(item => item.id === targetId);
    if (currentIndex !== -1) {
      const newItems = [...items];
      newItems.splice(currentIndex + 1, 0, newItem);
      return newItems;
    }
    return items;
  }
}

/**
 * 将指定节点缩进（成为其上一个兄弟节点的子节点）
 */
export function indentOperation(
  items: OutlineItemType[],
  targetId: string,
  parentId: string | undefined,
  topic?: string
): OutlineItemType[] {
  if (parentId) {
    return items.map(item => {
      if (item.id === parentId) {
        const children = [...item.children];
        const currentIndex = children.findIndex(child => child.id === targetId);
        if (currentIndex > 0) {
          const itemToMove = children[currentIndex];
          itemToMove.topic = topic || itemToMove.topic;
          const newParent = children[currentIndex - 1];
          children.splice(currentIndex, 1);
          newParent.children.push(itemToMove);
          return { ...item, children };
        }
      }
      if (item.children.length) {
        return { ...item, children: indentOperation(item.children, targetId, parentId, topic) };
      }
      return item;
    });
  } else {
    const currentIndex = items.findIndex(item => item.id === targetId);
    if (currentIndex > 0) {
      const newItems = [...items];
      const itemToMove = newItems[currentIndex];
      itemToMove.topic = topic || itemToMove.topic;
      newItems.splice(currentIndex, 1);
      newItems[currentIndex - 1].children.push(itemToMove);
      return newItems;
    }
    return items;
  }
}

/**
 * 将指定节点取消缩进（移动到其父节点所在层级）
 */
/**
 * 将指定节点向上移动
 */
export function moveUpOperation(
  items: OutlineItemType[],
  targetId: string,
  parentId: string | undefined
): OutlineItemType[] {
  if (parentId) {
    return items.map(item => {
      if (item.id === parentId) {
        const children = [...item.children];
        const currentIndex = children.findIndex(child => child.id === targetId);
        if (currentIndex > 0) {
          // 交换当前节点和上一个节点的位置
          [children[currentIndex - 1], children[currentIndex]] = 
          [children[currentIndex], children[currentIndex - 1]];
          return { ...item, children };
        }
      }
      if (item.children.length) {
        return { ...item, children: moveUpOperation(item.children, targetId, parentId) };
      }
      return item;
    });
  } else {
    const currentIndex = items.findIndex(item => item.id === targetId);
    if (currentIndex > 0) {
      const newItems = [...items];
      [newItems[currentIndex - 1], newItems[currentIndex]] = 
      [newItems[currentIndex], newItems[currentIndex - 1]];
      return newItems;
    }
    return items;
  }
}

/**
 * 将指定节点向下移动
 */
export function moveDownOperation(
  items: OutlineItemType[],
  targetId: string,
  parentId: string | undefined
): OutlineItemType[] {
  if (parentId) {
    return items.map(item => {
      if (item.id === parentId) {
        const children = [...item.children];
        const currentIndex = children.findIndex(child => child.id === targetId);
        if (currentIndex !== -1 && currentIndex < children.length - 1) {
          // 交换当前节点和下一个节点的位置
          [children[currentIndex], children[currentIndex + 1]] = 
          [children[currentIndex + 1], children[currentIndex]];
          return { ...item, children };
        }
      }
      if (item.children.length) {
        return { ...item, children: moveDownOperation(item.children, targetId, parentId) };
      }
      return item;
    });
  } else {
    const currentIndex = items.findIndex(item => item.id === targetId);
    if (currentIndex !== -1 && currentIndex < items.length - 1) {
      const newItems = [...items];
      [newItems[currentIndex], newItems[currentIndex + 1]] = 
      [newItems[currentIndex + 1], newItems[currentIndex]];
      return newItems;
    }
    return items;
  }
}

export function outdentOperation(
  items: OutlineItemType[],
  targetId: string,
  parentId: string,
  topic?: string
): OutlineItemType[] {
  // 处理父节点在根级别的情况
  const parentIndex = items.findIndex(item => item.id === parentId);
  if (parentIndex !== -1) {
    const parent = items[parentIndex];
    const targetIndex = parent.children.findIndex(child => child.id === targetId);
    if (targetIndex !== -1) {
      const itemToMove = parent.children[targetIndex];
      itemToMove.topic = topic || itemToMove.topic;
      // 从父节点中移除
      parent.children.splice(targetIndex, 1);
      // 插入到父节点后面
      items.splice(parentIndex + 1, 0, itemToMove);
      return items;
    }
  }

  // 如果不在根级别，递归搜索
  return items.map(item => {
    if (item.children.length > 0) {
      const childParentIndex = item.children.findIndex(child => child.id === parentId);
      if (childParentIndex !== -1) {
        const childParent = item.children[childParentIndex];
        const targetIndex = childParent.children.findIndex(child => child.id === targetId);
        if (targetIndex !== -1) {
          const itemToMove = childParent.children[targetIndex];
          itemToMove.topic = topic || itemToMove.topic;
          // 从父节点中移除
          childParent.children.splice(targetIndex, 1);
          // 插入到父节点后面
          item.children.splice(childParentIndex + 1, 0, itemToMove);
        }
      }
      return {
        ...item,
        children: outdentOperation(item.children, targetId, parentId, topic)
      };
    }
    return item;
  });
}