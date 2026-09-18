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
  onVote: (tagId: string) => void;
  onClick: () => void;
}

export default function TagPill({ tag, onVote, onClick }: TagPillProps) {
  const [animating, setAnimating] = useState(false);

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimating(true);
    onVote(tag.id);
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <span
      className={`tag-pill ${tag.has_voted ? 'voted' : ''}`}
      onClick={onClick}
    >
      <span className="text-[#d4d4d4] max-w-[8rem] truncate">{tag.name}</span>

      {/* Vote button */}
      <button
        className={`vote-btn ${tag.has_voted ? 'voted-on' : ''} ${animating ? 'animate-pop' : ''}`}
        onClick={handleVote}
        title={tag.has_voted ? '取消 +1' : '+1'}
      >
        +1
      </button>

      {/* Vote count */}
      {tag.vote_count > 0 && (
        <span
          className={`text-xs font-semibold min-w-[1.1rem] text-center ${
            tag.has_voted ? 'text-[#b3a9f7]' : 'text-[#8a8a8a]'
          }`}
        >
          {tag.vote_count}
        </span>
      )}
    </span>
  );
}
