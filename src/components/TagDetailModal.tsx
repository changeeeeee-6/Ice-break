'use client';

import { useState, useEffect, useCallback } from 'react';

interface TagData {
  id: string;
  name: string;
  vote_count: number;
  voter_ids: string[];
  voter_names: string[];
  creator_name: string;
}

interface EmojiReaction {
  id: string;
  tag_id: string;
  user_id: string;
  emoji: string;
  nickname: string;
  created_at: string;
}

interface TagDetailModalProps {
  tag: TagData;
  userId: string;
  boardColor: string;
  onClose: () => void;
  onDataChange: () => void;
}

const QUICK_EMOJIS = [
  '😂', '❤️', '👍', '🎉', '🔥', '😍', '🤣', '💯',
  '😎', '🥳', '😭', '🤔', '👏', '💪', '✨', '🙌',
  '😘', '🤩', '😜', '🫡', '💀', '🤝', '👀', '🫶',
];

export default function TagDetailModal({ tag, userId, boardColor, onClose, onDataChange }: TagDetailModalProps) {
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);
  const [emojiInput, setEmojiInput] = useState('');
  const [sending, setSending] = useState(false);

  const fetchReactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/emoji-reactions?tag_id=${tag.id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setReactions(data.data);
      }
    } catch {
      // Silently handle
    }
  }, [tag.id]);

  useEffect(() => {
    fetchReactions();
    // Refresh reactions every 5 seconds along with main data
    const interval = setInterval(fetchReactions, 5000);
    return () => clearInterval(interval);
  }, [fetchReactions]);

  const sendEmoji = async (emoji: string) => {
    const trimmed = emoji.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      const res = await fetch('/api/emoji-reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_id: tag.id, user_id: userId, emoji: trimmed }),
      });

      const data = await res.json();
      if (data.success) {
        setEmojiInput('');
        fetchReactions();
        onDataChange();
      }
    } catch {
      // Silently handle
    } finally {
      setSending(false);
    }
  };

  const handleEmojiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emojiInput.trim()) {
      sendEmoji(emojiInput);
    }
  };

  const handleQuickEmoji = (emoji: string) => {
    sendEmoji(emoji);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {tag.name}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{tag.vote_count}</div>
            <div className="text-xs text-blue-500 mt-1">+1 人数</div>
          </div>
          <div className="flex-1 bg-indigo-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-indigo-600">{tag.voter_names.length}</div>
            <div className="text-xs text-indigo-500 mt-1">参与同学</div>
          </div>
        </div>

        {/* Creator */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">添加者</h4>
          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 rounded-full px-3 py-1 text-sm">
            <span>{tag.creator_name}</span>
          </div>
        </div>

        {/* Voters */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">
            +1 过的同学 ({tag.voter_names.length})
          </h4>
          {tag.voter_names.length === 0 ? (
            <p className="text-gray-400 text-sm">还没有人为这个标签 +1</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tag.voter_names.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Emoji Interaction Wall */}
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">
            互动表情 ({reactions.length})
          </h4>

          {/* Emoji Wall */}
          <div className="max-h-40 overflow-y-auto custom-scrollbar mb-3">
            {reactions.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-2">还没有表情互动，快来发第一个吧</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {reactions.map((r) => (
                  <div
                    key={r.id}
                    className="inline-flex items-center gap-1 bg-gray-50 rounded-full px-2.5 py-1 text-sm border border-gray-100"
                    title={r.nickname}
                  >
                    <span className="text-base">{r.emoji}</span>
                    <span className="text-xs text-gray-500 max-w-[4rem] truncate">{r.nickname}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Emoji Buttons */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleQuickEmoji(emoji)}
                disabled={sending}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-colors text-lg disabled:opacity-50"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Custom Emoji Input */}
          <form onSubmit={handleEmojiSubmit} className="flex gap-2">
            <input
              type="text"
              value={emojiInput}
              onChange={(e) => setEmojiInput(e.target.value)}
              placeholder="输入或粘贴 emoji..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-300 transition-colors"
              maxLength={50}
            />
            <button
              type="submit"
              disabled={sending || !emojiInput.trim()}
              className="px-3 py-2 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-40 hover:opacity-90"
              style={{ background: boardColor }}
            >
              发送
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
