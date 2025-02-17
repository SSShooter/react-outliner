import React, { useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Trash } from 'lucide-react';
import './OutlineItem.css';
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
    onUpdate(item.id, { expanded: item.expanded === false ? true : false });
  };

  return (
    <div className="outline-item-container">
      {/* Vertical lines for alignment */}
      {level > 0 && (
        <div
          className="outline-item-vertical-line"
          style={{
            left: `${(level * 24) - 13}px`,
            height: '100%'
          }}
        />
      )}

      <div
        className="outline-item-wrapper"
        style={{ marginLeft: `${level * 24}px` }}
      >
        <button
          onClick={toggleCollapse}
          className={`outline-item-collapse-btn ${item.children.length ? '' : 'hidden'} ${item.expanded === false ? 'collapsed' : 'expanded'}`}
        >
          {item.expanded === false ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Node dot */}
        <div className="outline-item-dot" />

        <div
          ref={contentRef}
          contentEditable="true"
          onBlur={handleInput}
          onKeyDown={handleKeyDown}
          onClick={() => onFocusItem(item.id)}
          className="outline-item-content"
          data-outline-item
          data-item-id={item.id}
          suppressContentEditableWarning={true}
        >
          {item.content || ' '}
        </div>

        <div className="outline-item-actions">
          <button
            onClick={() => onDelete(item.id, parentId)}
            className="outline-item-delete-btn"
            title="Delete"
          >
            <Trash size={14} />
          </button>
        </div>
      </div>

      {item.expanded !== false && item.children.map((child) => (
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