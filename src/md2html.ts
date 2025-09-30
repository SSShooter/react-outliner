import { marked, Tokens } from "marked";
import 'katex/dist/katex.min.css'
import katex from 'katex'

/**
 * 将 Markdown 字符串转换为 HTML
 * 支持：
 *  - 所有 CommonMark 基础语法
 *  - GitHub Flavored Markdown（表格、任务列表、删除线、自动链接等）
 * 规则：
 *  - 原文中出现的 HTML 标签原样保留，不做转义
 *  - 其余 Markdown 语法全部编译为对应 HTML
 *  - 结果不包含包裹元素，直接返回生成的 HTML 片段
 */
export function md2html(md: string): string {
  // 1. 先把代码块保护起来，防止内部内容被后续规则误伤
  const codeBlockPlaceholders: string[] = [];
  const codeBlockRegex = /^```(\w*)\n([\s\S]*?)\n```$/gm;
  md = md.replace(codeBlockRegex, (_, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlockPlaceholders.length}__`;
    // 对代码本体做 HTML 转义
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    codeBlockPlaceholders.push(
      `<pre><code${lang ? ` class="language-${lang}"` : ''}>${escaped}</code></pre>`
    );
    return placeholder;
  });

  // 2. 保护行内代码
  const inlineCodePlaceholders: string[] = [];
  md = md.replace(/`([^`\n]+)`/g, (_, code) => {
    const placeholder = `__INLINE_CODE_${inlineCodePlaceholders.length}__`;
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    inlineCodePlaceholders.push(`<code>${escaped}</code>`);
    return placeholder;
  });

  // 3. 保护原生 HTML 标签（简单策略：以 <tag...> 开头且不再嵌套同类标签）
  //    注：这里只做“不处理”，所以直接保留即可，后续规则会跳过它们
  //    为了简单，不做完整 HTML 解析，而是依赖用户保证标签正确闭合

  // 4. 转换 GFM 删除线
  md = md.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');

  // 5. 转换粗体 / 斜体
  md = md.replace(/\*\*\*([^*\n]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  md = md.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  md = md.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  md = md.replace(/___([^_\n]+)___/g, '<strong><em>$1</em></strong>');
  md = md.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
  md = md.replace(/_([^_\n]+)_/g, '<em>$1</em>');

  // 6. 转换链接与图片
  md = md.replace(/!?\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    if (match.startsWith('!')) {
      // 图片
      return `<img src="${src}" alt="${alt}">`;
    }
    return `<a href="${src}">${alt}</a>`;
  });

  // 7. 转换自动链接
  md = md.replace(/<([^>\s]+@[^>\s]+)>/g, '<a href="mailto:$1">$1</a>');
  md = md.replace(/<((https?:\/\/|ftp:\/\/)[^>]+)>/g, '<a href="$1">$1</a>');

  // 8. 转换标题
  md = md.replace(/^(#{1,6})\s(.*)$/gm, (_, level, text) => {
    const n = level.length;
    return `<h${n}>${text.trim()}</h${n}>`;
  });

  // 9. 转换引用
  md = md.replace(/^(>\s?.*(?:\n>\s?.*)*)/gm, (block) => {
    const lines = block.split(/\n/).map(l => l.replace(/^>\s?/, ''));
    return `<blockquote>${lines.join('\n')}</blockquote>`;
  });

  // 10. 转换无序 / 有序列表
  const listItemRegex = /^(\s*)([*+-]|\d+\.)\s(.*)$/gm;
  let listMatch;
  const listStack: { type: string; indent: number }[] = [];
  let result = '';
  let lastIndex = 0;

  while ((listMatch = listItemRegex.exec(md)) !== null) {
    const [full, indentStr, marker, content] = listMatch;
    const indent = indentStr.length;
    const type = /^\d/.test(marker) ? 'ol' : 'ul';

    // 找到正确的层级
    while (listStack.length && listStack[listStack.length - 1].indent >= indent) {
      const closed = listStack.pop();
      result += `</${closed!.type}>`;
    }
    if (!listStack.length || listStack[listStack.length - 1].type !== type) {
      result += `<${type}>`;
      listStack.push({ type, indent });
    }

    result += `<li>${content}</li>`;
    lastIndex = listMatch.index + full.length;
  }

  while (listStack.length) {
    const closed = listStack.pop();
    result += `</${closed!.type}>`;
  }

  if (lastIndex < md.length) {
    result += md.slice(lastIndex);
  } else if (!result) {
    result = md; // 没有列表
  }
  md = result;

  // 11. 转换 GFM 任务列表
  md = md.replace(
    /^(\s*)[*+-] \[([ x])\] (.*)$/gm,
    (_, indent, checked, text) => {
      const isChecked = checked === 'x';
      return `${indent}<li><input type="checkbox"${isChecked ? ' checked' : ''} disabled> ${text}</li>`;
    }
  );
  md = md.replace(
    /^(\s*)\d+\. \[([ x])\] (.*)$/gm,
    (_, indent, checked, text) => {
      const isChecked = checked === 'x';
      return `${indent}<li><input type="checkbox"${isChecked ? ' checked' : ''} disabled> ${text}</li>`;
    }
  );

  // 12. 转换水平分割线
  md = md.replace(/^(---+|\*\*\*+|___+)$/gm, '<hr>');

  // 13. 转换 GFM 表格
  const tableRegex = /^(\|?.+\|.+)\n\|?\s*:?-+:?(\s*\|:?-+:?)*\s*\|?\n((\|?.+\|.*\n?)+)/gm;
  md = md.replace(tableRegex, (match, headerRow, _, bodyRows) => {
    const splitRow = (row: string) =>
      row.split('|').map(c => c.trim()).filter(c => c !== '');
    const headers = splitRow(headerRow);
    const body = bodyRows.split('\n').filter(Boolean).map(splitRow);

    let html = '<table><thead><tr>';
    headers.forEach(h => (html += `<th>${h}</th>`));
    html += '</tr></thead><tbody>';
    body.forEach((row: string[]) => {
      html += '<tr>';
      row.forEach(c => (html += `<td>${c}</td>`));
      html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
  });

  // 14. 处理段落（剩余行视为段落，跳过空白行）
  const lines = md.split(/\n+/);
  const paragraphs: string[] = [];
  let buffer: string[] = [];

  for (const line of lines) {
    if (line.trim() === '') {
      if (buffer.length) {
        paragraphs.push(`<p>${buffer.join('<br>')}</p>`);
        buffer = [];
      }
    } else if (
      line.startsWith('<h') ||
      line.startsWith('<ul') ||
      line.startsWith('<ol') ||
      line.startsWith('<blockquote') ||
      line.startsWith('<pre') ||
      line.startsWith('<table') ||
      line.startsWith('<hr')
    ) {
      // 已经是块级 HTML，直接推进
      if (buffer.length) {
        paragraphs.push(`<p>${buffer.join('<br>')}</p>`);
        buffer = [];
      }
      paragraphs.push(line);
    } else {
      // 普通段落行
      buffer.push(line);
    }
  }
  if (buffer.length) {
    paragraphs.push(`<p>${buffer.join('<br>')}</p>`);
  }
  md = paragraphs.join('\n');

  // 15. 还原代码块与行内代码
  codeBlockPlaceholders.forEach((block, i) => {
    md = md.replace(`__CODE_BLOCK_${i}__`, block);
  });
  inlineCodePlaceholders.forEach((code, i) => {
    md = md.replace(`__INLINE_CODE_${i}__`, code);
  });

  return md.trim();
}

export const markedWrapped = (text: string, ) => {
  if (!text) return ''
  // if (!obj.useMd) return text
  try {
    // Configure marked renderer to add target="_blank" to links
    const renderer = {
      link(token: Tokens.Link) {
        const href = token.href || ''
        const title = token.title ? ` title="${token.title}"` : ''
        const text = token.text || ''
        return `<a href="${href}"${title} target="_blank">${text}</a>`
      },
    }

    // let html = md2html(text)

    // Handle display math ($$...$$)
    text = text.replace(/\$\$([^$]+)\$\$/g, (_, math) => {
      return katex.renderToString(math.trim(), { displayMode: true, output: 'html' })
    })

    // Handle inline math ($...$)
    text = text.replace(/\$([^$]+)\$/g, (_, math) => {
      return katex.renderToString(math.trim(), { displayMode: false, output: 'html' })
    })

    marked.use({ renderer, gfm: true })
    const html = marked(text) as string

    return html.trim()
  } catch (error) {
    console.log('md2html error', error)
    return text
  }
}