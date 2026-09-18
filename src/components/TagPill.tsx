'use client';

import { useState } from 'react';

interface TagData {
  id: string;
  name: string;
  vote_count: number;
  has_voted: boolean;
  voter_names: string[];
  creator_name: string | null;
}

interface TagPillProps {
  tag: TagData;
  userId: string;
  boardColor: string;
  boardBgColor: string;
  onVote: (tagId: string) => void;
  onClick: () => void;
}

export default function TagPill({ tag, userId, boardColor, boardBgColor, onVote, onClick }: TagPillProps) {
  const [animating, setAnimating] = useState(false);
  const hasVoted = tag.has_voted;

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimating(true);
    onVote(tag.id);
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <span
      className="tag-pill"
      style={{
        background: boardBgColor,
        border: `1px solid ${hasVoted ? boardColor : 'transparent'}`,
      }}
      onClick={onClick}
    >
      <span className="text-gray-700 max-w-[8rem] truncate">{tag.name}</span>

      {/* Vote button */}
      <button
        className={`vote-btn ${animating ? 'voted' : ''}`}
        style={{
          background: hasVoted ? boardColor : 'rgba(0,0,0,0.06)',
          color: hasVoted ? 'white' : boardColor,
        }}
        onClick={handleVote}
        title={hasVoted ? '取消 +1' : '+1'}
      >
        +1
      </button>

      {/* Vote count */}
      {tag.vote_count > 0 && (
        <span
          className="text-xs font-bold min-w-[1.25rem] text-center"
          style={{ color: boardColor }}
        >
          {tag.vote_count}
        </span>
      )}
    </span>
  );
}
