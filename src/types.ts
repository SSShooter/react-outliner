export interface OutlineItem {
  id: string;
  content: string;
  children: OutlineItem[];
  isCollapsed: boolean;
}

export type OutlineItemUpdate = Partial<OutlineItem>;

export interface ItemOperation {
  type: 'addSibling' | 'indent' | 'outdent';
  id: string;
  parentId?: string;
  shouldFocusNew?: boolean;
  shouldFocusCurrent?: boolean;
}