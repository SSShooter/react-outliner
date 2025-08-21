import React, { useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Trash } from 'lucide-react';
import './OutlineItem.css';
import type { OutlineItem as OutlineItemType, ItemOperation } from '../types';
import { mdToHtml } from '../utils/mdToHtml';

interface Props {
  item: OutlineItemType;
  level: number;
  parentId?: string;
  onUpdate: (id: string, update: Partial<OutlineItemType>) => void;
  onDelete: (id: string, parentId?: string) => void;
  onAddChild: (parentId: string) => void;
  onOperation: (operation: ItemOperation) => void;
  focusId?: string;
  onFocusItem: (id: string) => void;
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
  level,
  parentId,
  onUpdate,
  onDelete,
  onAddChild,
  onOperation,
  focusId,
  onFocusItem,
  readonly,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 当不是焦点项时，显示 HTML
  useEffect(() => {
    if (focusId !== item.id && contentRef.current && item.topic) {
      contentRef.current.innerHTML = mdToHtml(item.topic);
    }
  }, [focusId, item.id, item.topic]);

  useEffect(() => {
    if (focusId === item.id && contentRef.current) {
      // 获得焦点时显示原始 Markdown 文本
      contentRef.current.textContent = item.topic;
      contentRef.current.focus();
      // Move cursor to the end of topic
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [focusId, item.id, item.topic]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
        const itemId = nextItem.getAttribute('data-item-id');
        if (itemId) {
          onFocusItem(itemId);
        }
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
      } else if (topic) {
        // Enter with content: Add sibling after current node
        onOperation({
          type: 'addSibling',
          id: item.id,
          parentId,
          shouldFocusNew: true,
        });
      } else {
        // Enter with empty content: Outdent
        onOperation({
          type: 'outdent',
          id: item.id,
          parentId,
          shouldFocusCurrent: true,
        });
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
    } else if (e.key === 'Backspace' && topic === '') {
      e.preventDefault();
      onDelete(item.id, parentId);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const markdownText = e.currentTarget.textContent || '';
    
    // 保存原始的 Markdown 文本
    onUpdate(item.id, { topic: markdownText });
    
    // 如果不是编辑状态，将 Markdown 转换为 HTML 并显示
    if (focusId !== item.id) {
      const htmlContent = mdToHtml(markdownText);
      if (contentRef.current) {
        contentRef.current.innerHTML = htmlContent;
      }
    }
  };

  const toggleCollapse = () => {
    onUpdate(item.id, { expanded: item.expanded === false ? true : false });
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
          className={`outline-item-collapse-btn ${
            item.children.length ? '' : 'hidden'
          } ${item.expanded === false ? 'collapsed' : 'expanded'}`}
        >
          {item.expanded === false ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronDown size={14} />
          )}
        </button>

        <div className="outline-item-dot" />

        <div
          ref={contentRef}
          contentEditable={readonly ? false : true}
          onBlur={handleInput}
          onKeyDown={handleKeyDown}
          onClick={() => onFocusItem(item.id)}
          className="outline-item-topic"
          data-outline-item
          data-item-id={item.id}
          suppressContentEditableWarning={true}
        >
          {item.topic || ' '}
        </div>

        {!readonly && (
          <div className="outline-item-actions">
            <button
              onClick={() => onDelete(item.id, parentId)}
              className="outline-item-delete-btn"
              title="Delete"
            >
              <Trash size={14} />
            </button>
          </div>
        )}
      </div>

      {item.expanded !== false &&
        item.children.map((child) => (
          <OutlineItem
            key={child.id}
            item={child}
            level={level + 1}
            parentId={item.id}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onOperation={onOperation}
            focusId={focusId}
            onFocusItem={onFocusItem}
            readonly={readonly}
          />
        ))}
    </div>
  );
}
