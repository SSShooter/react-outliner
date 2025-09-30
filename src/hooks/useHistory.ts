import { useState, useCallback, useRef } from 'react';

export interface HistoryState<T> {
  data: T;
  timestamp: number;
}

export interface HistoryManager<T> {
  history: HistoryState<T>[];
  currentIndex: number;
  maxHistorySize: number;
}

export function useHistory<T>(initialData: T, maxHistorySize: number = 50) {
  const [historyManager, setHistoryManager] = useState<HistoryManager<T>>({
    history: [{ data: initialData, timestamp: Date.now() }],
    currentIndex: 0,
    maxHistorySize
  });
  console.log(historyManager,'historyManager')

  const isUndoRedoOperation = useRef(false);

  // 深拷贝函数
  const deepClone = useCallback(<U>(obj: U): U => {
    return JSON.parse(JSON.stringify(obj));
  }, []);

  // 保存历史状态
  const saveToHistory = useCallback((newData: T) => {
    // 如果是撤销/重做操作，不保存到历史
    if (isUndoRedoOperation.current) {
      isUndoRedoOperation.current = false;
      return;
    }

    setHistoryManager(prev => {
      const newHistory = [...prev.history];
      const currentIdx = prev.currentIndex;
      
      // 如果当前不在历史末尾，删除后面的历史
      if (currentIdx < newHistory.length - 1) {
        newHistory.splice(currentIdx + 1);
      }
      
      // 添加新的历史状态
      newHistory.push({
        data: deepClone(newData),
        timestamp: Date.now()
      });
      
      const newIndex = newHistory.length - 1;
      
      // 限制历史大小
      if (newHistory.length > prev.maxHistorySize) {
        newHistory.shift();
        return {
          ...prev,
          history: newHistory,
          currentIndex: newHistory.length - 1
        };
      }
      
      return {
        ...prev,
        history: newHistory,
        currentIndex: newIndex
      };
    });
  }, [deepClone]);

  // Undo 功能
  const undo = useCallback((): T | null => {
    console.log('undo',historyManager.currentIndex);
    if (historyManager.currentIndex > 0) {
      const newIndex = historyManager.currentIndex - 1;
      const historyState = historyManager.history[newIndex];
      
      setHistoryManager(prev => ({
        ...prev,
        currentIndex: newIndex
      }));
      
      // 设置标志，表示这是一个撤销操作
      isUndoRedoOperation.current = true;
      // 使用 setTimeout 确保在下一个事件循环中重置标志
      setTimeout(() => {
        isUndoRedoOperation.current = false;
      }, 0);
      
      return deepClone(historyState.data);
    }
    return null;
  }, [historyManager, deepClone]);

  // Redo 功能
  const redo = useCallback((): T | null => {
    console.log('redo',historyManager.currentIndex);
    if (historyManager.currentIndex < historyManager.history.length - 1) {
      const newIndex = historyManager.currentIndex + 1;
      const historyState = historyManager.history[newIndex];
      
      setHistoryManager(prev => ({
        ...prev,
        currentIndex: newIndex
      }));
      
      // 设置标志，表示这是一个重做操作
      isUndoRedoOperation.current = true;
      // 使用 setTimeout 确保在下一个事件循环中重置标志
      setTimeout(() => {
        isUndoRedoOperation.current = false;
      }, 0);
      
      return deepClone(historyState.data);
    }
    return null;
  }, [historyManager, deepClone]);

  // 检查是否可以 undo/redo
  const canUndo = historyManager.currentIndex > 0;
  const canRedo = historyManager.currentIndex < historyManager.history.length - 1;

  // 获取历史信息
  const getHistoryInfo = useCallback(() => ({
    currentIndex: historyManager.currentIndex,
    totalStates: historyManager.history.length,
    canUndo,
    canRedo
  }), [historyManager, canUndo, canRedo]);

  return {
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    getHistoryInfo
  };
}