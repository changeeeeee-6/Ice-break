'use client';

import { useState, useEffect, useCallback } from 'react';
import BoardSection from '@/components/BoardSection';

interface User {
  id: string;
  nickname: string;
}

interface MainBoardProps {
  user: User;
}

export const BOARDS = [
  { id: 'music', name: '音乐', emoji: '', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.08)' },
  { id: 'games', name: '游戏', emoji: '', color: '#06B6D4', bgColor: 'rgba(6, 182, 212, 0.08)' },
  { id: 'anime', name: '动漫', emoji: '', color: '#6366F1', bgColor: 'rgba(99, 102, 241, 0.08)' },
  { id: 'movies', name: '影视', emoji: '', color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.08)' },
  { id: 'sports', name: '运动', emoji: '', color: '#0EA5E9', bgColor: 'rgba(14, 165, 233, 0.08)' },
] as const;

export type BoardId = typeof BOARDS[number]['id'];

export default function MainBoard({ user }: MainBoardProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDataChange = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="app-bg min-h-screen pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/40 border-b border-blue-100/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-blue-800">破冰大作战</h1>
          </div>
          <div className="flex items-center gap-2 bg-blue-50/80 rounded-full px-3 py-1.5">
            <span className="text-sm text-blue-600/80">你好，</span>
            <span className="font-semibold text-blue-800 text-sm md:text-base">{user.nickname}</span>
          </div>
        </div>
      </header>

      {/* Boards Grid */}
      <main className="max-w-6xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BOARDS.map((board, index) => (
            <BoardSection
              key={board.id}
              board={board}
              userId={user.id}
              refreshKey={refreshKey}
              onDataChange={handleDataChange}
              style={{ animationDelay: `${index * 0.1}s` }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
