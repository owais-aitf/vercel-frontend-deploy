'use client';

import { useEffect, useCallback, useRef } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  const shortcutsRef = useRef(shortcuts);

  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, altKey, shiftKey, metaKey } = event;

    // Don't trigger shortcuts when user is typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    const matchingShortcut = shortcutsRef.current.find((shortcut) => {
      return (
        shortcut.key.toLowerCase() === key.toLowerCase() &&
        !!shortcut.ctrlKey === ctrlKey &&
        !!shortcut.altKey === altKey &&
        !!shortcut.shiftKey === shiftKey &&
        !!shortcut.metaKey === metaKey
      );
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault !== false) {
        event.preventDefault();
      }
      matchingShortcut.action();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcutsRef.current;
};

// Common keyboard shortcuts
export const commonShortcuts = {
  // Navigation
  ESCAPE: { key: 'Escape', description: 'Close modal/dialog' },
  ENTER: { key: 'Enter', description: 'Confirm action' },

  // With Ctrl/Cmd
  SAVE: { key: 's', ctrlKey: true, metaKey: true, description: 'Save' },
  COPY: { key: 'c', ctrlKey: true, metaKey: true, description: 'Copy' },
  PASTE: { key: 'v', ctrlKey: true, metaKey: true, description: 'Paste' },
  UNDO: { key: 'z', ctrlKey: true, metaKey: true, description: 'Undo' },
  REDO: { key: 'y', ctrlKey: true, metaKey: true, description: 'Redo' },
  FIND: { key: 'f', ctrlKey: true, metaKey: true, description: 'Find' },
  NEW: { key: 'n', ctrlKey: true, metaKey: true, description: 'New' },

  // Custom app shortcuts
  SEARCH: {
    key: 'k',
    ctrlKey: true,
    metaKey: true,
    description: 'Global search',
  },
  HELP: { key: '?', shiftKey: true, description: 'Show help' },
  THEME: {
    key: 'd',
    ctrlKey: true,
    metaKey: true,
    description: 'Toggle theme',
  },
  CHATBOT: {
    key: 'j',
    ctrlKey: true,
    metaKey: true,
    description: 'Open chatbot',
  },
};
