import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Outliner } from '../components/Outliner';
import { OutlineItem } from '../types';

describe('Outliner Component', () => {
  // Sample test data
  const sampleData: OutlineItem[] = [
    {
      id: 'item1',
      topic: 'Root Item 1',
      children: [
        {
          id: 'item1-1',
          topic: 'Child Item 1-1',
          children: [],
        },
        {
          id: 'item1-2',
          topic: 'Child Item 1-2',
          children: [],
        },
      ],
    },
    {
      id: 'item2',
      topic: 'Root Item 2',
      children: [],
    },
  ];

  let onChange: Mock<(items: OutlineItem[]) => void> = vi.fn();

  beforeEach(() => {
    // Create a mock function for onChange
    onChange = vi.fn();
  });

  it('renders all outline items correctly', () => {
    render(<Outliner data={sampleData} onChange={onChange} />);
    
    // Check if root items are rendered
    expect(screen.getByText('Root Item 1')).toBeInTheDocument();
    expect(screen.getByText('Root Item 2')).toBeInTheDocument();
    
    // Check if child items are rendered
    expect(screen.getByText('Child Item 1-1')).toBeInTheDocument();
    expect(screen.getByText('Child Item 1-2')).toBeInTheDocument();
  });

  it('collapses and expands items when clicking the collapse button', () => {
    render(<Outliner data={sampleData} onChange={onChange} />);
    
    // Find the collapse button for the first root item
    const rootItem = screen.getByText('Root Item 1').closest<HTMLElement>('.outline-item-wrapper');
    const collapseButton = within(rootItem!).getByRole('button', { name: '' });
    
    // Initially, children should be visible
    expect(screen.getByText('Child Item 1-1')).toBeVisible();
    expect(screen.getByText('Child Item 1-2')).toBeVisible();
    
    // Click to collapse
    fireEvent.click(collapseButton);
    
    // Check that onChange was called with updated data
    expect(onChange).toHaveBeenCalled();
    const updatedData = onChange.mock.calls[0][0];
    expect(updatedData[0].expanded).toBe(false);
    
    // Click to expand again
    fireEvent.click(collapseButton);
    
    // Check that onChange was called with updated data
    expect(onChange).toHaveBeenCalledTimes(2);
    const reexpandedData = onChange.mock.calls[1][0];
    expect(reexpandedData[0].expanded).toBe(true);
  });

  it('adds a sibling item when pressing Enter', () => {
    render(<Outliner data={sampleData} onChange={onChange} />);
    
    // Find the editable content of the first child item
    const childItem = screen.getByText('Child Item 1-1');
    
    // Focus and press Enter
    fireEvent.click(childItem);
    fireEvent.keyDown(childItem, { key: 'Enter' });
    
    // Check that onChange was called with updated data
    expect(onChange).toHaveBeenCalled();
    const updatedData = onChange.mock.calls[0][0];
    
    // Verify a new sibling was added after the first child
    expect(updatedData[0].children.length).toBe(3);
    expect(updatedData[0].children[1].topic).toBe('');
  });

  it('adds a sibling before the current item when pressing Shift+Enter', () => {
    render(<Outliner data={sampleData} onChange={onChange} />);
    
    // Find the editable content of the second child item
    const childItem = screen.getByText('Child Item 1-2');
    
    // Focus and press Shift+Enter
    fireEvent.click(childItem);
    fireEvent.keyDown(childItem, { key: 'Enter', shiftKey: true });
    
    // Check that onChange was called with updated data
    expect(onChange).toHaveBeenCalled();
    const updatedData = onChange.mock.calls[0][0];
    
    // Verify a new sibling was added before the second child
    expect(updatedData[0].children.length).toBe(3);
    expect(updatedData[0].children[1].topic).toBe('');
  });

  it('indents an item when pressing Tab', () => {
    render(<Outliner data={sampleData} onChange={onChange} />);
    
    // Find the editable content of the second child item
    const childItem = screen.getByText('Child Item 1-2');
    
    // Focus and press Tab
    fireEvent.click(childItem);
    fireEvent.keyDown(childItem, { key: 'Tab' });
    
    // Check that onChange was called with updated data
    expect(onChange).toHaveBeenCalled();
    const updatedData = onChange.mock.calls[0][0];
    
    // Verify the item was indented (became a child of the previous item)
    expect(updatedData[0].children.length).toBe(1);
    expect(updatedData[0].children[0].children.length).toBe(1);
    expect(updatedData[0].children[0].children[0].topic).toBe('Child Item 1-2');
  });

  it('outdents an item when pressing Shift+Tab', () => {
    // Create test data with a nested structure
    const nestedData: OutlineItem[] = [
      {
        id: 'item1',
        topic: 'Root Item 1',
        children: [
          {
            id: 'item1-1',
            topic: 'Child Item 1-1',
            children: [
              {
                id: 'item1-1-1',
                topic: 'Nested Item 1-1-1',
                children: [],
              },
            ],
          },
        ],
      },
    ];
    
    render(<Outliner data={nestedData} onChange={onChange} />);
    
    // Find the editable content of the nested item
    const nestedItem = screen.getByText('Nested Item 1-1-1');
    
    // Focus and press Shift+Tab
    fireEvent.click(nestedItem);
    fireEvent.keyDown(nestedItem, { key: 'Tab', shiftKey: true });
    
    // Check that onChange was called with updated data
    expect(onChange).toHaveBeenCalled();
    const updatedData = onChange.mock.calls[0][0];
    
    // Verify the item was outdented (became a sibling of its former parent)
    expect(updatedData[0].children.length).toBe(2);
    expect(updatedData[0].children[1].topic).toBe('Nested Item 1-1-1');
  });

  it('outdents an item when pressing Enter on an empty item', () => {
    // Create test data with a nested structure
    const nestedData: OutlineItem[] = [
      {
        id: 'item1',
        topic: 'Root Item 1',
        children: [
          {
            id: 'item1-1',
            topic: 'Child Item 1-1',
            children: [
              {
                id: 'item1-1-1',
                topic: 'Nested Item 1-1-1',
                children: [],
              },
            ],
          },
        ],
      },
    ];
    
    render(<Outliner data={nestedData} onChange={onChange} />);
    
    // Find the editable content of the nested item
    const nestedItem = screen.getByText('Nested Item 1-1-1');
    
    // First, create a new sibling by pressing Enter
    fireEvent.click(nestedItem);
    fireEvent.keyDown(nestedItem, { key: 'Enter' });
    
    // Reset the mock to clear previous calls
    onChange.mockReset();
    
    // Now find the newly created empty item (it should be the second child of item1-1)
    const currentFocus = document.activeElement!;
    
    // Press Enter on the empty item to outdent it
    fireEvent.keyDown(currentFocus, { key: 'Enter' });
    
    // Check that onChange was called with updated data
    expect(onChange).toHaveBeenCalled();
    const updatedData = onChange.mock.calls[0][0];
    
    // Verify the empty item was outdented (became a sibling of its former parent)
    expect(updatedData[0].children.length).toBe(2);
    // The second child of the root should be the outdented empty item
    expect(updatedData[0].children[1].topic).toBe('');
  });

  it('deletes an item when pressing Backspace on an empty item', () => {
    render(<Outliner data={sampleData} onChange={onChange} />);
    
    // Find the editable content of the first child item
    const childItem = screen.getByText('Child Item 1-1');
    
    // Clear the content and press Backspace
    fireEvent.click(childItem);
    fireEvent.input(childItem, { target: { textContent: '' } });
    fireEvent.keyDown(childItem, { key: 'Backspace' });
    
    // Check that onChange was called with updated data
    expect(onChange).toHaveBeenCalled();
    const updatedData = onChange.mock.calls[0][0];
    
    // Verify the item was deleted
    expect(updatedData[0].children.length).toBe(1);
    expect(updatedData[0].children[0].topic).toBe('Child Item 1-2');
  });

  it('moves an item up when pressing Alt+ArrowUp', () => {
    render(<Outliner data={sampleData} onChange={onChange} />);
    
    // Find the editable content of the second child item
    const childItem = screen.getByText('Child Item 1-2');
    
    // Focus and press Alt+ArrowUp
    fireEvent.click(childItem);
    fireEvent.keyDown(childItem, { key: 'ArrowUp', altKey: true });
    
    // Check that onChange was called with updated data
    expect(onChange).toHaveBeenCalled();
    const updatedData = onChange.mock.calls[0][0];
    
    // Verify the item was moved up
    expect(updatedData[0].children[0].topic).toBe('Child Item 1-2');
    expect(updatedData[0].children[1].topic).toBe('Child Item 1-1');
  });

  it('moves an item down when pressing Alt+ArrowDown', () => {
    render(<Outliner data={sampleData} onChange={onChange} />);
    
    // Find the editable content of the first child item
    const childItem = screen.getByText('Child Item 1-1');
    
    // Focus and press Alt+ArrowDown
    fireEvent.click(childItem);
    fireEvent.keyDown(childItem, { key: 'ArrowDown', altKey: true });
    
    // Check that onChange was called with updated data
    expect(onChange).toHaveBeenCalled();
    const updatedData = onChange.mock.calls[0][0];
    
    // Verify the item was moved down
    expect(updatedData[0].children[0].topic).toBe('Child Item 1-2');
    expect(updatedData[0].children[1].topic).toBe('Child Item 1-1');
  });

  it('updates item topic when editing content', () => {
    render(<Outliner data={sampleData} onChange={onChange} />);
    
    // Find the editable content of the first root item
    const rootItem = screen.getByText('Root Item 1');
    
    // Edit the content
    fireEvent.click(rootItem);
    fireEvent.input(rootItem, { target: { textContent: 'Updated Root Item' } });
    fireEvent.blur(rootItem);
    
    // Check that onChange was called with updated data
    expect(onChange).toHaveBeenCalled();
    const updatedData = onChange.mock.calls[0][0];
    
    // Verify the item topic was updated
    expect(updatedData[0].topic).toBe('Updated Root Item');
  });
});