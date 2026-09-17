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
  { id: 'music', name: '音乐', emoji: '🎵', color: '#FF6B6B', bgColor: 'rgba(255, 107, 107, 0.12)' },
  { id: 'games', name: '游戏', emoji: '🎮', color: '#4ECDC4', bgColor: 'rgba(78, 205, 196, 0.12)' },
  { id: 'anime', name: '动漫', emoji: '📺', color: '#FFE66D', bgColor: 'rgba(255, 230, 109, 0.15)' },
  { id: 'movies', name: '影视', emoji: '🎬', color: '#A78BFA', bgColor: 'rgba(167, 139, 250, 0.12)' },
  { id: 'sports', name: '运动', emoji: '⚽', color: '#FB923C', bgColor: 'rgba(251, 146, 60, 0.12)' },
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
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/20 border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <h1 className="text-lg md:text-xl font-bold text-white">破冰大作战</h1>
          </div>
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
            <span className="text-sm text-white/80">你好，</span>
            <span className="font-semibold text-white text-sm md:text-base">{user.nickname}</span>
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

      {/* Footer */}
      <footer className="text-center mt-8 text-white/50 text-xs">
        数据每 5 秒自动刷新
      </footer>
    </div>
  );
}
