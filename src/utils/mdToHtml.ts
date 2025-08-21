/**
 * 简单的 Markdown 到 HTML 转换函数
 * 支持基本的 Markdown 语法：标题、粗体、斜体、链接、列表等
 */
export function mdToHtml(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown;
  
  // 转换标题 (h1-h6)
  html = html.replace(/^#{1,6}\s+(.+)$/gm, (match, content) => {
    const level = match.trim().indexOf(' ');
    return `<h${level}>${content}</h${level}>`;
  });
  
  // 转换粗体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // 转换斜体
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // 转换链接
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  
  // 转换无序列表
  html = html.replace(/^\s*-\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // 转换有序列表
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
  
  // 转换代码块
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // 转换段落
  html = html.replace(/^(?!<[a-z]).+$/gm, '<p>$&</p>');
  
  return html;
}