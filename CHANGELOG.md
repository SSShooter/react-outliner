# Changelog

All notable changes to this project will be documented in this file.

## [0.8.1] - 2026-05-27

### Added
- **Breadcrumbs**: Added optional `fileName` prop to display in the Outliner breadcrumb root, along with text truncation and icon styling.
- **i18n**: Introduced internationalization support for outliner interface labels and localization.

### Changed
- **Drag-and-Drop**: Moved drag-and-drop handles to item dots and optimized drag visual states.
- **Build**: Stripped console and debugger statements from production builds in Vite configuration.

### Fixed
- **SSR**: Render content directly in read-only mode for Server-Side Rendering (SSR).

## [0.6.5] - 2026-04-29

### Changed
- **UI Structure**: Consolidated OutlineItem menu and collapse buttons into a unified button group.
- **Refactoring**: Refactored hover visibility logic for outline item buttons.

## [0.6.3] - 2026-04-29

### Changed
- **Dependencies**: Added `lucide-react` as a peer dependency and externalized it in the build configuration.
- **Component Structure**: Extracted item menu logic into a separate `OutlineItemMenu` component, and transitioned collapse button visibility to `data-state` attributes for cleaner styling logic.
- **Breadcrumbs**: Render outliner breadcrumb container unconditionally to simplify component structure.

### Fixed
- **UI Bug**: Prevented multiple menu buttons from appearing simultaneously.

## [0.6.0] - 2026-04-27

### Added
- **Zooming**: Implemented node zooming functionality with breadcrumb navigation support.
- **Context Menu**: Replaced the individual delete button with a context menu for indent, outdent, and delete operations. Added specific styling for leaf node menu positioning.

### Fixed
- **Shortcuts**: Added support for the Cmd modifier in undo/redo keyboard shortcuts.

## [0.5.1] - 2026-04-25

### Added
- **Read-only Mode**: Added a read-only mode toggle.

### Changed
- **Hover State**: Refined outline item hover state behavior.
- **Dependencies**: Upgraded `lucide-react` to v1.11.0 and removed Vite optimization exclusions.

## [0.5.0] - 2026-04-24

### Added
- **Text Splitting**: Implemented text splitting at the cursor position on Enter key press.
- **Auto-expand**: Automatically expand the parent node when adding a new child item.

### Fixed
- **IME Handling**: Ignored keyboard events while composing in `OutlineItem`.

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
