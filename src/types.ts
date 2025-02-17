export interface OutlineItem {
  id: string;
  content: string;
  children: OutlineItem[];
  expanded?: boolean;
}

export type OutlineItemUpdate = Partial<OutlineItem>;

export interface ItemOperation {
  type: 'addSibling' | 'indent' | 'outdent' | 'moveUp' | 'moveDown';
  id: string;
  parentId?: string;
  shouldFocusNew?: boolean;
  shouldFocusCurrent?: boolean;
  content?: string;
}