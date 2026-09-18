'use client';

import { useState, useEffect, useCallback } from 'react';

interface TagData {
  id: string;
  name: string;
  vote_count: number;
  has_voted: boolean;
  voter_names: string[];
  creator_name: string | null;
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
  onClose: () => void;
  onDataChange: () => void;
  onVote: (tagId: string) => void;
}

const QUICK_EMOJIS = [
  '😂', '❤️', '👍', '🎉', '🔥', '😍', '🤣', '💯',
  '😎', '🥳', '😭', '🤔', '👏', '💪', '✨', '🙌',
  '😘', '🤩', '😜', '🫡', '💀', '🤝', '👀', '🫶',
];

export default function TagDetailModal({ tag, userId, onClose, onDataChange, onVote }: TagDetailModalProps) {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground truncate pr-2">
            {tag.name}
          </h3>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-md bg-[#2d2d2d] border border-border flex items-center justify-center text-[#9b9b9b] hover:bg-[#363636] hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-[#1e1e1e] border border-border rounded-md p-3 text-center">
            <div className="text-xl font-semibold text-[#b3a9f7]">{tag.vote_count}</div>
            <div className="text-xs text-[#9b9b9b] mt-1">+1 人数</div>
          </div>
          <div className="flex-1 bg-[#1e1e1e] border border-border rounded-md p-3 text-center">
            <div className="text-xl font-semibold text-foreground">{reactions.length}</div>
            <div className="text-xs text-[#9b9b9b] mt-1">表情互动</div>
          </div>
        </div>

        {/* Creator - 完全匿名：仅已加入者可见发起人，其他人不显示这一栏 */}
        {tag.creator_name && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-[#9b9b9b] mb-2 uppercase tracking-wide">添加者</h4>
            <div className="inline-flex items-center gap-1.5 bg-[rgba(152,195,121,0.12)] border border-[rgba(152,195,121,0.3)] text-[#98c379] rounded px-2.5 py-1 text-sm">
              {tag.creator_name}
            </div>
          </div>
        )}

        {/* Voters */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-medium text-[#9b9b9b] uppercase tracking-wide">
              +1 过的同学（{tag.vote_count}）
            </h4>
            <button
              onClick={() => onVote(tag.id)}
              className={
                tag.has_voted
                  ? 'px-3 py-1 rounded-md bg-[#2d2d2d] border border-border text-[#9b9b9b] text-xs font-medium hover:bg-[#363636] transition-colors'
                  : 'btn-primary px-3 py-1 rounded-md text-xs font-medium'
              }
            >
              {tag.has_voted ? '取消我的 +1' : '我也 +1'}
            </button>
          </div>

          {tag.vote_count === 0 ? (
            <p className="text-[#6c6c6c] text-sm">还没有人为这个标签 +1，快来支持一下吧</p>
          ) : tag.has_voted ? (
            <div className="flex flex-wrap gap-2">
              {tag.voter_names.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-[rgba(124,108,240,0.12)] border border-[rgba(124,108,240,0.3)] text-[#c4bcf7] rounded px-2.5 py-1 text-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <div className="bg-[#1e1e1e] border border-border rounded-md p-3">
              <p className="text-sm text-[#9b9b9b]">
                已有 {tag.vote_count} 人 +1。为保护隐私，发起人和 +1 名单均匿名，
                你也点一下 <span className="font-medium text-[#b3a9f7]">＋1</span> 加入就能看到都有谁。
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {Array.from({ length: Math.min(tag.vote_count, 8) }).map((_, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center bg-[#2d2d2d] text-[#6c6c6c] border border-border rounded px-2.5 py-1 text-xs"
                  >
                    匿名
                  </span>
                ))}
                {tag.vote_count > 8 && (
                  <span className="inline-flex items-center text-[#6c6c6c] text-sm px-1">
                    等 {tag.vote_count} 人
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Emoji Interaction Wall */}
        <div className="border-t border-border pt-4">
          <h4 className="text-xs font-medium text-[#9b9b9b] uppercase tracking-wide mb-3">
            互动表情（{reactions.length}）
          </h4>

          {/* Emoji Wall */}
          <div className="max-h-40 overflow-y-auto custom-scrollbar mb-3">
            {reactions.length === 0 ? (
              <p className="text-[#6c6c6c] text-sm text-center py-2">还没有表情互动，快来发第一个吧</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {reactions.map((r) => (
                  <div
                    key={r.id}
                    className="inline-flex items-center gap-1 bg-[#2d2d2d] border border-border rounded px-2.5 py-1 text-sm"
                    title={r.nickname}
                  >
                    <span className="text-base">{r.emoji}</span>
                    <span className="text-xs text-[#9b9b9b] max-w-[4rem] truncate">{r.nickname}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Emoji Buttons */}
          <div className="flex flex-wrap gap-1 mb-3">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendEmoji(emoji)}
                disabled={sending}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#2d2d2d] transition-colors text-lg disabled:opacity-50"
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
              placeholder="输入或粘贴 emoji…"
              className="field-input flex-1 px-3 py-2 rounded-md text-sm"
              maxLength={50}
            />
            <button
              type="submit"
              disabled={sending || !emojiInput.trim()}
              className="btn-primary px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap"
            >
              发送
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
