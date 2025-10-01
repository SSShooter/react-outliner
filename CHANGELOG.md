# Changelog

All notable changes to this project will be documented in this file.

## [0.4.0] - 2025-10-01

### Added

- **Undo/Redo functionality**: Complete history management and undo/redo operations
  - New `useHistory` hook for managing operation history
  - Keyboard shortcuts support (Ctrl+Z/Ctrl+Y) for undo/redo
  - Integrated into outliner component with history tracking for all editing operations
- **Markdown and KaTeX example support**:
  - New `md2html.ts` utility module for Markdown to HTML conversion
  - New `example.ts` file with rich example content
  - Added KaTeX mathematical formula rendering support
- **Improved item actions and styling**:
  - Refactored `OutlineItem` component styling system
  - Enhanced item interaction experience
  - Optimized CSS styles for better visual effects

### Fixed

- **Fixed wrong outdent behavior**: Fixed incorrect outdent operation when no topic content exists
  - Logic corrections in `OutlineItem.tsx`, `Outliner.tsx` and `outlineOperations.ts`

### Changed

- **Version bump**: Project version upgraded to 0.4.0
- **Dependencies update**: Updated project dependencies including new `marked` and `katex` libraries
- **ESLint configuration**: Improved code linting configuration

### Technical Details

- New files:
  - `src/hooks/useHistory.ts` - History management hook
  - `src/utils/moveToOperation.ts` - Move operation utilities
  - `src/md2html.ts` - Markdown conversion utility
  - `src/example.ts` - Example data
- Modified files:
  - `src/components/Outliner.tsx` - Integrated undo/redo functionality
  - `src/components/OutlineItem.tsx` - Improved actions and styling
  - `src/components/OutlineItem.css` - Style refactoring
  - `src/utils/outlineOperations.ts` - Fixed outdent operation
  - `package.json` - Dependencies and version update

### Dependencies

- Added: `katex ^0.16.22` - Mathematical formula rendering
- Added: `marked ^16.2.0` - Markdown parsing
- Added: `lucide-react ^0.488.0` - Icon library
- Updated: React-related dependencies to latest versions
