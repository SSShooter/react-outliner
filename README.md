# React Outliner Neo

A React and TypeScript-based outline editor component that supports hierarchical content organization with rich keyboard shortcuts.

## Features

- Rich keyboard shortcuts
  - Enter: Create new sibling item
  - Tab: Indent item (increase level)
  - Shift + Tab: Outdent item (decrease level)
  - Alt + ↑: Move item up
  - Alt + ↓: Move item down
  - ↑/↓: Quick navigation between items
- Support for expanding/collapsing items
- Support for deleting items
- **Dark mode support** - Built-in CSS variables for seamless theme switching
- **Markdown rendering** - Optional markdown support for rich text formatting
- **Drag and drop** - Intuitive item reordering with visual feedback
- **Read-only mode** - Display-only mode for viewing outlines

## Installation

```bash
pnpm i react-outliner-neo
```

## Usage

```tsx
import { Outliner } from "react-outliner-neo";
import { marked } from "marked";

const initialData = [
  {
    topic: "Root Node",
    children: [
      {
        topic: "**Bold text** and *italic text*",
        children: [
          {
            topic: "Child Node 1.1",
          },
        ],
      },
    ],
  },
];

function App() {
  const handleChange = (data) => {
    console.log("Outline data updated:", data);
  };

  // Optional: Enable markdown rendering
  const markdownRenderer = (text: string) => {
    return marked.parseInline(text);
  };

  return (
    <div className="dark"> {/* Add 'dark' class for dark mode */}
      <Outliner 
        data={initialData} 
        onChange={handleChange}
        markdown={markdownRenderer} // Enable markdown rendering
        readonly={false} // Set to true for read-only mode
      />
    </div>
  );
}
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `OutlineData[]` | Required | Initial outline data |
| `onChange` | `(data: OutlineItem[]) => void` | Optional | Callback when outline changes |
| `readonly` | `boolean` | `false` | Enable read-only mode |
| `markdown` | `(text: string) => string` | Optional | Markdown renderer function |

### Data Structure

```tsx
interface OutlineData {
  id?: string; // Auto-generated if not provided
  topic: string;
  children?: OutlineData[];
  expanded?: boolean; // Default: true
}
```

## Styling & Theming

### Dark Mode

Add the `dark` class to any parent element to enable dark mode:

```tsx
<div className="dark">
  <Outliner data={data} />
</div>
```

### Custom Styling

Import the CSS file and customize CSS variables:

```tsx
import "react-outliner-neo/style.css";
```

```css
:root {
  --primary-color: #3b35ab;
  --text-color: #1f2937;
  --bg-color: transparent;
  /* ... other variables */
}

.dark {
  --primary-color: #6b9ff3;
  --text-color: #f9fafb;
  /* ... dark mode variables */
}
```

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Lucide React (Icon library)

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Development Requirements

- Node.js >= 18
- pnpm >= 8
