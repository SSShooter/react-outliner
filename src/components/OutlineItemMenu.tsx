import { useRef, useEffect, useState } from 'react';
import { Trash, EllipsisVertical, ArrowRight, ArrowLeft } from 'lucide-react';
import type { OutlineItem as OutlineItemType, ItemOperation, OutlinerI18n } from '../types';

interface Props {
  item: OutlineItemType;
  items: OutlineItemType[];
  level: number;
  parentId?: string;
  onOperation: (operation: ItemOperation) => void;
  onDelete: (id: string, parentId?: string) => void;
  i18n: OutlinerI18n;
}

export function OutlineItemMenu({
  item,
  items,
  level,
  parentId,
  onOperation,
  onDelete,
  i18n,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div
      className="outline-item-menu-wrapper"
      ref={menuContainerRef}
    >
      <button
        className="outline-item-menu-btn"
        title={i18n.menuTitle}
        draggable="false"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((v) => !v);
        }}
      >
        <EllipsisVertical size={12} />
      </button>
      {menuOpen && (
        <div className="outline-item-menu-dropdown">
          <button
            className="outline-item-menu-item"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              onOperation({
                type: 'outdent',
                id: item.id,
                parentId,
                shouldFocusCurrent: true,
                topic: item.topic,
              });
              setMenuOpen(false);
            }}
          >
            <ArrowLeft size={12} />
            <span>{i18n.outdent}</span>
          </button>
          <button
            className="outline-item-menu-item"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              onOperation({
                type: 'indent',
                id: item.id,
                parentId,
                shouldFocusCurrent: true,
                topic: item.topic,
              });
              setMenuOpen(false);
            }}
          >
            <ArrowRight size={12} />
            <span>{i18n.indent}</span>
          </button>
          {(level > 0 || items.length > 1) && (
            <button
              className="outline-item-menu-item outline-item-menu-item-danger"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                onDelete(item.id, parentId);
                setMenuOpen(false);
              }}
            >
              <Trash size={12} />
              <span>{i18n.delete}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
