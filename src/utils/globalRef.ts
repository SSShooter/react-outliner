import { OutlineItem } from '../types';

export const globalRef: {
  markdown?: (text: string, item: OutlineItem) => string;
} = { markdown: undefined };
