'use client';

import { useState } from 'react';

interface NicknameEntryProps {
  onNicknameSet: (userInfo: { id: string; nickname: string }) => void;
}

export default function NicknameEntry({ onNicknameSet }: NicknameEntryProps) {
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('请输入昵称');
      return;
    }
    if (trimmed.length > 100) {
      setError('昵称不能超过100个字符');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '注册失败');
      }

      onNicknameSet({ id: data.data.id, nickname: data.data.nickname });
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-bg flex items-center justify-center px-4">
      <div className="board-card p-8 md:p-12 w-full max-w-md text-center animate-fade-in-up relative z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          破冰大作战
        </h1>
        <p className="text-gray-500 mb-8 text-sm md:text-base">
          输入你的昵称，发现志同道合的同学！
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="输入你的昵称 (支持 emoji)"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors text-center text-lg"
              maxLength={100}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '加入中...' : '开始破冰'}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-400">
          昵称将展示给其他同学，支持 emoji 表情
        </p>
      </div>
    </div>
  );
}
