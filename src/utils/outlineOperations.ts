import type { OutlineItem as OutlineItemType } from '../types';

/**
 * 通用的树形结构遍历和操作函数
 * @param items 要操作的树形数据
 * @param targetId 目标节点ID
 * @param parentId 父节点ID
 * @param operation 对找到的节点执行的操作函数
 * @returns 操作后的新树形数据
 */
function traverseAndOperate(
  items: OutlineItemType[],
  targetId: string,
  parentId: string | undefined,
  operation: (params: {
    items: OutlineItemType[],
    targetIndex: number,
    parent?: OutlineItemType
  }) => OutlineItemType[]
): OutlineItemType[] {
  // 如果有父节点ID，则在父节点的子节点中查找目标节点
  if (parentId) {
    return items.map(item => {
      // 找到父节点
      if (item.id === parentId) {
        const targetIndex = item.children.findIndex(child => child.id === targetId);
        if (targetIndex !== -1) {
          // 执行操作并返回更新后的父节点
          const newChildren = operation({
            items: [...item.children],
            targetIndex,
            parent: item
          });
          return { ...item, children: newChildren };
        }
        return item;
      }
      // 递归处理子节点
      if (item.children.length) {
        return {
          ...item,
          children: traverseAndOperate(item.children, targetId, parentId, operation)
        };
      }
      return item;
    });
  } else {
    // 在根级别查找目标节点
    const targetIndex = items.findIndex(item => item.id === targetId);
    if (targetIndex !== -1) {
      // 执行操作并返回更新后的数组
      return operation({
        items: [...items],
        targetIndex
      });
    }
    return items;
  }
}

/**
 * 在指定节点后添加一个新的兄弟节点
 */
export function addSiblingOperation(
  items: OutlineItemType[],
  targetId: string,
  parentId: string | undefined,
  newItem: OutlineItemType
): OutlineItemType[] {
  return traverseAndOperate(items, targetId, parentId, ({ items, targetIndex }) => {
    const newItems = [...items];
    newItems.splice(targetIndex + 1, 0, newItem);
    return newItems;
  });
}

/**
 * 在指定节点前添加一个新的兄弟节点
 */
export function addSiblingBeforeOperation(
  items: OutlineItemType[],
  targetId: string,
  parentId: string | undefined,
  newItem: OutlineItemType
): OutlineItemType[] {
  return traverseAndOperate(items, targetId, parentId, ({ items, targetIndex }) => {
    const newItems = [...items];
    newItems.splice(targetIndex, 0, newItem);
    return newItems;
  });
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
  return traverseAndOperate(items, targetId, parentId, ({ items, targetIndex }) => {
    // 只有当目标节点不是第一个节点时才能缩进
    if (targetIndex > 0) {
      const newItems = [...items];
      const itemToMove = newItems[targetIndex];
      // 更新主题（如果提供了新主题）
      itemToMove.topic = topic || itemToMove.topic;
      // 从原位置移除
      newItems.splice(targetIndex, 1);
      // 添加到前一个节点的子节点中
      newItems[targetIndex - 1].children.push(itemToMove);
      return newItems;
    }
    return items;
  });
}

/**
 * 将指定节点向上移动
 */
export function moveUpOperation(
  items: OutlineItemType[],
  targetId: string,
  parentId: string | undefined
): OutlineItemType[] {
  return traverseAndOperate(items, targetId, parentId, ({ items, targetIndex }) => {
    // 只有当目标节点不是第一个节点时才能向上移动
    if (targetIndex > 0) {
      const newItems = [...items];
      // 交换当前节点和上一个节点的位置
      [newItems[targetIndex - 1], newItems[targetIndex]] = 
      [newItems[targetIndex], newItems[targetIndex - 1]];
      return newItems;
    }
    return items;
  });
}

/**
 * 将指定节点向下移动
 */
export function moveDownOperation(
  items: OutlineItemType[],
  targetId: string,
  parentId: string | undefined
): OutlineItemType[] {
  return traverseAndOperate(items, targetId, parentId, ({ items, targetIndex }) => {
    // 只有当目标节点不是最后一个节点时才能向下移动
    if (targetIndex !== -1 && targetIndex < items.length - 1) {
      const newItems = [...items];
      // 交换当前节点和下一个节点的位置
      [newItems[targetIndex], newItems[targetIndex + 1]] = 
      [newItems[targetIndex + 1], newItems[targetIndex]];
      return newItems;
    }
    return items;
  });
}

/**
 * 将指定节点取消缩进（移动到其父节点所在层级）
 */
export function outdentOperation(
  items: OutlineItemType[],
  targetId: string,
  parentId: string,
  topic: string
): OutlineItemType[] {
  // 处理父节点在根级别的情况
  const parentIndex = items.findIndex(item => item.id === parentId);
  if (parentIndex !== -1) {
    const parent = items[parentIndex];
    const targetIndex = parent.children.findIndex(child => child.id === targetId);
    if (targetIndex !== -1) {
      const itemToMove = parent.children[targetIndex];
      itemToMove.topic = topic;
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
          itemToMove.topic = topic;
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