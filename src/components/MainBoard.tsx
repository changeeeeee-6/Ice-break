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
  { id: 'music', name: '音乐' },
  { id: 'games', name: '游戏' },
  { id: 'anime', name: '动漫' },
  { id: 'movies', name: '影视' },
  { id: 'sports', name: '运动' },
  { id: 'other', name: '其他' },
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
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#1e1e1e]/85 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-base md:text-lg font-semibold text-foreground tracking-tight">
            破冰大作战
          </h1>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#9b9b9b]">你好，</span>
            <span className="font-medium text-foreground">{user.nickname}</span>
          </div>
        </div>
      </header>

      {/* Boards Grid */}
      <main className="max-w-6xl mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOARDS.map((board, index) => (
            <BoardSection
              key={board.id}
              board={board}
              userId={user.id}
              refreshKey={refreshKey}
              onDataChange={handleDataChange}
              style={{ animationDelay: `${index * 0.06}s` }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
