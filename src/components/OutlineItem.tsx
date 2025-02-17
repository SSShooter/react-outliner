import React, { useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Trash } from 'lucide-react';
import type { OutlineItem as OutlineItemType, ItemOperation } from '../types';

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
}

export function OutlineItem({
  item,
  level,
  parentId,
  onUpdate,
  onDelete,
  onAddChild,
  onOperation,
  focusId,
  onFocusItem
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (focusId === item.id && contentRef.current) {
      contentRef.current.focus();
      // Move cursor to the end of content
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [focusId, item.id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const content = contentRef.current?.textContent?.trim()
    if (e.key === 'ArrowUp' && e.altKey) {
      e.preventDefault();
      onOperation({
        type: 'moveUp',
        id: item.id,
        parentId,
        shouldFocusCurrent: true
      });
    } else if (e.key === 'ArrowDown' && e.altKey) {
      e.preventDefault();
      onOperation({
        type: 'moveDown',
        id: item.id,
        parentId,
        shouldFocusCurrent: true
      });
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const allItems = document.querySelectorAll('[data-outline-item]');
      const currentIndex = Array.from(allItems).findIndex(el => el === contentRef.current);

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
      if (content) {
        onOperation({
          type: 'addSibling',
          id: item.id,
          parentId,
          shouldFocusNew: true
        });
      } else {
        onOperation({
          type: 'outdent',
          id: item.id,
          parentId,
          shouldFocusCurrent: true
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
          content
        });
      } else {
        onOperation({
          type: 'indent',
          id: item.id,
          parentId,
          shouldFocusCurrent: true,
          content
        });
      }
    } else if (e.key === 'Backspace' && content === '') {
      e.preventDefault();
      onDelete(item.id, parentId);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || '';
    onUpdate(item.id, { content });
  };

  const toggleCollapse = () => {
    onUpdate(item.id, { isCollapsed: !item.isCollapsed });
  };

  return (
    <div className="relative">
      {/* Vertical lines for alignment */}
      {level > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 border-l-2 border-gray-200"
          style={{
            left: `${(level * 24) - 13}px`,
            height: '100%'
          }}
        />
      )}

      <div
        className="flex items-baseline gap-1 hover:bg-gray-100 rounded px-2 py-1 relative group"
        style={{ marginLeft: `${level * 24}px` }}
      >
        <button
          onClick={toggleCollapse}
          className={`${item.isCollapsed ? '' : 'opacity-0 group-hover:opacity-100'} absolute left-[-19px] top-[13px] w-4 h-4 flex items-center justify-center ${item.children.length ? 'visible' : 'invisible'}`}
        >
          {item.isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Node dot */}
        <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />

        <div
          ref={contentRef}
          contentEditable="true"
          onBlur={handleInput}
          onKeyDown={handleKeyDown}
          onClick={() => onFocusItem(item.id)}
          className="flex-1 cursor-text py-0.5 ml-2 outline-none"
          data-outline-item
          data-item-id={item.id}
          suppressContentEditableWarning={true}
        >
          {item.content || ' '}
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
          <button
            onClick={() => onDelete(item.id, parentId)}
            className="p-1 hover:bg-gray-200 rounded text-red-600"
            title="Delete"
          >
            <Trash size={14} />
          </button>
        </div>
      </div>

      {!item.isCollapsed && item.children.map((child) => (
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
        />
      ))}
    </div>
  );
}