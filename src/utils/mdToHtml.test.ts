import { describe, it, expect } from 'vitest';
import { mdToHtml } from './mdToHtml';

describe('mdToHtml', () => {
  it('should convert h1 heading', () => {
    const markdown = '# 标题1';
    const html = mdToHtml(markdown);
    expect(html).toContain('<h1>标题1</h1>');
  });

  it('should convert h2 heading', () => {
    const markdown = '## 标题2';
    const html = mdToHtml(markdown);
    expect(html).toContain('<h2>标题2</h2>');
  });

  it('should convert h3 heading', () => {
    const markdown = '### 标题3';
    const html = mdToHtml(markdown);
    expect(html).toContain('<h3>标题3</h3>');
  });

  it('should convert multiple headings', () => {
    const markdown = '# 标题1\n## 标题2\n### 标题3';
    const html = mdToHtml(markdown);
    expect(html).toContain('<h1>标题1</h1>');
    expect(html).toContain('<h2>标题2</h2>');
    expect(html).toContain('<h3>标题3</h3>');
  });
});