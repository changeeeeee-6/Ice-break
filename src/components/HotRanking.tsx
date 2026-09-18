'use client';

interface TagData {
  id: string;
  name: string;
  vote_count: number;
}

interface HotRankingProps {
  tags: TagData[];
  boardName: string;
  onClose: () => void;
}

export default function HotRanking({ tags, boardName, onClose }: HotRankingProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">
            {boardName} · 热门排行
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md bg-[#2d2d2d] border border-border flex items-center justify-center text-[#9b9b9b] hover:bg-[#363636] hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Ranking List */}
        <div className="space-y-1">
          {tags.map((tag, index) => (
            <div
              key={tag.id}
              className="flex items-center gap-3 p-2.5 rounded-md transition-colors hover:bg-[#2d2d2d]"
            >
              <span
                className={`text-sm font-semibold w-7 text-center ${
                  index < 3 ? 'text-[#b3a9f7]' : 'text-[#6c6c6c]'
                }`}
              >
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#e0e0e0] truncate">
                  {tag.name}
                </div>
                <div className="text-xs text-[#6c6c6c] mt-0.5">
                  {tag.vote_count} 人 +1
                </div>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[rgba(124,108,240,0.14)] border border-[rgba(124,108,240,0.35)] text-[#b3a9f7] text-sm font-semibold">
                +{tag.vote_count}
              </div>
            </div>
          ))}
        </div>

        {tags.length === 0 && (
          <p className="text-center text-[#6c6c6c] py-8 text-sm">暂无热门标签</p>
        )}
      </div>
    </div>
  );
}
