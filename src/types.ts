export interface OutlineItem {
  id: string;
  topic: string;
  style?: Partial<{
    fontSize: string
    fontFamily: string
    color: string
    background: string
    fontWeight: string
    width: string
    border: string
    textDecoration: string
    borderRadius: string
    padding: string
    fontStyle: string
  }>
  children: OutlineItem[];
  expanded?: boolean;
}

export type OutlineItemUpdate = Partial<OutlineItem>;

export interface ItemOperation {
  type: 'addSibling' | 'indent' | 'outdent' | 'moveUp' | 'moveDown' | 'addSiblingBefore' | 'moveTo';
  id: string;
  parentId?: string;
  shouldFocusNew?: boolean;
  shouldFocusCurrent?: boolean;
  topic?: string;
  // For drag and drop operations
  draggedId?: string;
  targetId?: string;
  dropPosition?: 'before' | 'after' | 'inside';
}