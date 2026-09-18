'use client';

import { useState, useEffect, CSSProperties } from 'react';
import TagPill from '@/components/TagPill';
import TagDetailModal from '@/components/TagDetailModal';
import HotRanking from '@/components/HotRanking';

interface TagData {
  id: string;
  board: string;
  name: string;
  normalized_name: string;
  created_by: string;
  creator_name: string;
  created_at: string;
  vote_count: number;
  has_voted: boolean;
  voter_names: string[];
}

interface BoardConfig {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
}

interface BoardSectionProps {
  board: BoardConfig;
  userId: string;
  refreshKey: number;
  onDataChange: () => void;
  style?: CSSProperties;
}

export default function BoardSection({ board, userId, refreshKey, onDataChange, style }: BoardSectionProps) {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'info' } | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [showHot, setShowHot] = useState(false);

  const fetchTags = async () => {
    try {
      const res = await fetch(`/api/tags?board=${board.id}&user_id=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTags(data.data);
      }
    } catch {
      // Silently handle network errors during refresh
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [refreshKey, board.id]);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTag.trim();
    if (!trimmed) return;
    if (trimmed.length > 200) {
      setMessage({ text: '标签不能超过200个字符', type: 'error' });
      return;
    }

    setAdding(true);
    setMessage(null);

    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: board.id, name: trimmed, user_id: userId }),
      });

      const data = await res.json();

      if (data.success) {
        setNewTag('');
        setMessage({ text: '标签添加成功！', type: 'info' });
        onDataChange();
      } else if (data.error === 'duplicate') {
        setMessage({ text: data.message, type: 'info' });
      } else {
        setMessage({ text: data.error || '添加失败', type: 'error' });
      }
    } catch {
      setMessage({ text: '网络错误，请重试', type: 'error' });
    } finally {
      setAdding(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleVote = async (tagId: string) => {
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_id: tagId, user_id: userId }),
      });

      const data = await res.json();
      if (data.success) {
        onDataChange();
      }
    } catch {
      // Silently handle
    }
  };

  const sortedTags = [...tags].sort((a, b) => b.vote_count - a.vote_count);
  const hotTags = sortedTags.slice(0, 5).filter((t) => t.vote_count > 0);

  // 始终从最新 tags 中派生，保证弹窗内投票状态随刷新同步
  const selectedTag = selectedTagId
    ? tags.find((t) => t.id === selectedTagId) ?? null
    : null;

  return (
    <>
      <div
        className="board-card p-5 animate-fade-in-up"
        style={style}
      >
        {/* Board Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">{board.name}</h2>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {tags.length}
            </span>
          </div>
          {hotTags.length > 0 && (
            <button
              onClick={() => setShowHot(true)}
              className="hot-badge"
              style={{ background: board.color }}
            >
              热门
            </button>
          )}
        </div>

        {/* Tags Area */}
        <div className="min-h-[4rem] mb-4">
          {loading ? (
            <div className="text-gray-400 text-sm text-center py-4">加载中...</div>
          ) : tags.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-4">
              还没有标签，快来添加第一个吧！
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagPill
                  key={tag.id}
                  tag={tag}
                  userId={userId}
                  boardColor={board.color}
                  boardBgColor={board.bgColor}
                  onVote={handleVote}
                  onClick={() => setSelectedTagId(tag.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Tag Input */}
        <form onSubmit={handleAddTag} className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="添加新标签..."
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-300 transition-colors"
            maxLength={200}
          />
          <button
            type="submit"
            disabled={adding || !newTag.trim()}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-40 hover:opacity-90"
            style={{ background: board.color }}
          >
            {adding ? '...' : '+ 添加'}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className={`mt-2 text-xs ${message.type === 'error' ? 'text-red-500' : 'text-blue-600'}`}>
            {message.text}
          </p>
        )}
      </div>

      {/* Hot Ranking Modal */}
      {showHot && (
        <HotRanking
          tags={hotTags}
          boardName={board.name}
          boardColor={board.color}
          onClose={() => setShowHot(false)}
        />
      )}

      {/* Tag Detail Modal */}
      {selectedTag && (
        <TagDetailModal
          tag={selectedTag}
          userId={userId}
          boardColor={board.color}
          onClose={() => setSelectedTagId(null)}
          onDataChange={onDataChange}
          onVote={handleVote}
        />
      )}
    </>
  );
}
