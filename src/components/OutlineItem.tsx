import React, { useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { OutlineItemMenu } from './OutlineItemMenu';
import './OutlineItem.css';
import type { OutlineItem as OutlineItemType, ItemOperation } from '../types';
import { globalRef } from '../utils/globalRef';

interface Props {
  item: OutlineItemType;
  items: OutlineItemType[];
  level: number;
  parentId?: string;
  onUpdate: (id: string, update: Partial<OutlineItemType>, shouldSaveHistory?: boolean) => void;
  onFinishEditing?: (id: string, update: Partial<OutlineItemType>) => void;
  onDelete: (id: string, parentId?: string) => void;
  onAddChild: (parentId: string) => void;
  onOperation: (operation: ItemOperation) => void;
  onZoom?: (id: string) => void;
  readonly?: boolean;
}

// More efficient method to check if an item is a descendant of another using DOM contains
const isDescendant = (targetId: string, draggedId: string): boolean => {
  // Get DOM elements
  const draggedElement = document.querySelector(
    `[data-item-id="${draggedId}"]`,
  );
  const targetElement = document.querySelector(`[data-item-id="${targetId}"]`);

  // If either element doesn't exist, return false
  if (!draggedElement || !targetElement) return false;

  // Get the container elements
  const draggedContainer = draggedElement.closest('.outline-item-container');
  const targetContainer = targetElement.closest('.outline-item-container');

  // If either container doesn't exist, return false
  if (!draggedContainer || !targetContainer) return false;

  // Check if the dragged container contains the target container
  return draggedContainer.contains(targetContainer);
};

let draggedId: string | undefined;

export function OutlineItem({
  item,
  items,
  level,
  parentId,
  onUpdate,
  onFinishEditing,
  onDelete,
  onAddChild,
  onOperation,
  onZoom,
  readonly,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isEditingRef = useRef(false);

  // 确保组件初始化时显示HTML内容
  useEffect(() => {
    if (contentRef.current && !isEditingRef.current) {
      const htmlContent = globalRef.markdown
        ? globalRef.markdown(item.topic, item)
        : item.topic;
      contentRef.current.innerHTML = htmlContent;
    }
  }, [item.topic, item]);

  const handleFocus = () => {
    if (contentRef.current) {
      // 获得焦点时显示原始 Markdown 文本
      contentRef.current.textContent = item.topic;
      isEditingRef.current = true;
      // Move cursor to the end of topic
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 如果正在使用输入法组合输入（如中文输入法），忽略按键事件
    if (e.nativeEvent.isComposing) {
      return;
    }

    const topic = contentRef.current?.textContent?.trim();
    if (e.key === 'ArrowUp' && e.altKey) {
      e.preventDefault();
      onOperation({
        type: 'moveUp',
        id: item.id,
        parentId,
        shouldFocusCurrent: true,
      });
    } else if (e.key === 'ArrowDown' && e.altKey) {
      e.preventDefault();
      onOperation({
        type: 'moveDown',
        id: item.id,
        parentId,
        shouldFocusCurrent: true,
      });
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const allItems = document.querySelectorAll('[data-outline-item]');
      const currentIndex = Array.from(allItems).findIndex(
        (el) => el === contentRef.current,
      );

      if (currentIndex === -1) return;

      let nextIndex;
      if (e.key === 'ArrowUp') {
        nextIndex = currentIndex - 1;
      } else {
        nextIndex = currentIndex + 1;
      }

      if (nextIndex >= 0 && nextIndex < allItems.length) {
        const nextItem = allItems[nextIndex] as HTMLElement;
        // 先触发当前元素的blur事件保存内容
        if (contentRef.current) {
          contentRef.current.blur();
        }
        // 然后聚焦到下一个元素，这会自动触发其onFocus事件
        nextItem.focus();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        // Shift+Enter: Add sibling before current node
        onOperation({
          type: 'addSiblingBefore',
          id: item.id,
          parentId,
          shouldFocusNew: true,
        });
      } else {
        // Get cursor position and split text
        const selection = window.getSelection();
        const fullText = contentRef.current?.textContent || '';

        if (selection && selection.rangeCount > 0 && contentRef.current) {
          const range = selection.getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(contentRef.current);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          const cursorPosition = preCaretRange.toString().length;

          const textBeforeCursor = fullText.substring(0, cursorPosition);
          const textAfterCursor = fullText.substring(cursorPosition);

          if (textBeforeCursor.trim() === '' && textAfterCursor.trim() === '') {
            // Both parts empty: Outdent
            onOperation({
              type: 'outdent',
              id: item.id,
              parentId,
              shouldFocusCurrent: true,
              topic: '',
            });
          } else if (textAfterCursor.trim() !== '') {
            // Has content after cursor: Split into two nodes
            // Immediately update the DOM to show only text before cursor
            contentRef.current.textContent = textBeforeCursor;
            // Update current node with text before cursor
            onUpdate(item.id, { topic: textBeforeCursor }, false);
            // Add sibling with text after cursor
            onOperation({
              type: 'addSibling',
              id: item.id,
              parentId,
              shouldFocusNew: true,
              newNodeContent: textAfterCursor,
            });
          } else {
            // Only has content before cursor or cursor at end: Add empty sibling
            onOperation({
              type: 'addSibling',
              id: item.id,
              parentId,
              shouldFocusNew: true,
            });
          }
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        onOperation({
          type: 'outdent',
          id: item.id,
          parentId,
          shouldFocusCurrent: true,
          topic,
        });
      } else {
        onOperation({
          type: 'indent',
          id: item.id,
          parentId,
          shouldFocusCurrent: true,
          topic,
        });
      }
    } else if (e.key === 'Backspace' && topic === '' && level > 0) {
      e.preventDefault();
      onDelete(item.id, parentId);
    }
  };

  const handleBlur = (e: React.FormEvent<HTMLDivElement>) => {
    if (isEditingRef.current) {
      const markdownText = e.currentTarget.textContent || '';
      
      // 编辑完成时保存到历史记录
      if (onFinishEditing) {
        onFinishEditing(item.id, { topic: markdownText });
      } else {
        onUpdate(item.id, { topic: markdownText }, true);
      }
      
      isEditingRef.current = false;

      // 失去焦点后恢复HTML显示
      if (contentRef.current) {
        const htmlContent = globalRef.markdown
          ? globalRef.markdown(markdownText, item)
          : markdownText;
        contentRef.current.innerHTML = htmlContent;
      }
    }
  };

  const toggleCollapse = () => {
    onUpdate(item.id, { expanded: item.expanded === false ? true : false }, false);
  };

  const [dragState, setDragState] = React.useState<
    'before' | 'inside' | 'after' | undefined
  >(undefined);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    draggedId = item.id;
    e.dataTransfer.effectAllowed = 'move';

    // Add a class to the dragged element
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    // Remove the class from the dragged element
    e.currentTarget.classList.remove('dragging');
    setDragState(undefined);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();

    // console.log(`handleDragOver: ${item.id}, draggedId: ${draggedId}`)

    // If we can't get the ID or it's the same as current item, don't show drop indicators
    if (!draggedId || draggedId === item.id) {
      setDragState(undefined);
      return;
    }

    // If target is a descendant of dragged item, don't allow drop
    if (isDescendant(item.id, draggedId)) {
      setDragState(undefined);
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    e.dataTransfer.dropEffect = 'move';

    // Get the bounding rectangle of the target element
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY;

    // Calculate the position relative to the element
    const relativeY = mouseY - rect.top;
    const height = rect.height;

    let dragState: 'before' | 'inside' | 'after' | undefined;
    // Determine drop position based on mouse position
    // Top 25% - before, middle 50% - inside, bottom 25% - after
    if (relativeY < height * 0.25) {
      dragState = 'before';
    } else if (relativeY > height * 0.75) {
      dragState = 'after';
    } else {
      dragState = 'inside';
    }

    setDragState(dragState);
  };

  const handleDragLeave = () => {
    setDragState(undefined);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (draggedId && draggedId !== item.id) {
      onOperation({
        id: draggedId,
        type: 'moveTo',
        draggedId,
        targetId: item.id,
        parentId,
        dropPosition: dragState,
        shouldFocusCurrent: true,
      });
    }

    setDragState(undefined);
  };

  // Determine the CSS classes based on drag state
  const dragOverClass =
    dragState === 'before'
      ? 'drag-over'
      : dragState === 'after'
      ? 'drag-over-bottom'
      : dragState === 'inside'
      ? 'drag-over-inside'
      : '';

  return (
    <div
      ref={containerRef}
      className={`outline-item-container`}
      style={{
        pointerEvents: readonly ? 'none' : 'auto',
      }}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragLeave={handleDragLeave}
    >
      {/* Vertical lines for alignment */}
      {level > 0 && (
        <div
          className="outline-item-vertical-line"
          style={{
            left: `${level * 24 - 13}px`,
            height: '100%',
          }}
        />
      )}

      <div
        className={`outline-item-wrapper ${dragOverClass}`}
        style={{ marginLeft: `${level * 24}px` }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <button
          onClick={toggleCollapse}
          className="outline-item-collapse-btn"
          data-state={
            item.children.length === 0
              ? 'hidden'
              : item.expanded === false
              ? 'collapsed'
              : 'expanded'
          }
        >
          {item.expanded === false ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </button>
        {!readonly && (
          <OutlineItemMenu
            item={item}
            items={items}
            level={level}
            parentId={parentId}
            onOperation={onOperation}
            onDelete={onDelete}
          />
        )}
        <div className="outline-item-front">
          <div
            className={`outline-item-dot${onZoom ? ' outline-item-dot-zoomable' : ''}`}
            title="点击进入"
            style={onZoom ? { pointerEvents: 'auto' } : undefined}
            onClick={onZoom ? (e) => { e.stopPropagation(); onZoom(item.id); } : undefined}
          />
        </div>
        <div
          ref={contentRef}
          contentEditable={readonly ? false : 'plaintext-only'}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="outline-item-topic"
          data-outline-item
          data-item-id={item.id}
          suppressContentEditableWarning={true}
        />
      </div>

      {item.expanded !== false &&
        item.children.map((child) => (
          <OutlineItem
            key={child.id}
            items={item.children}
            item={child}
            level={level + 1}
            parentId={item.id}
            onUpdate={onUpdate}
            onFinishEditing={onFinishEditing}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onOperation={onOperation}
            onZoom={onZoom}
            readonly={readonly}
          />
        ))}
    </div>
  );
}
