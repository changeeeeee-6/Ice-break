'use client';

interface TagData {
  id: string;
  name: string;
  vote_count: number;
}

interface HotRankingProps {
  tags: TagData[];
  boardName: string;
  boardColor: string;
  onClose: () => void;
}

export default function HotRanking({ tags, boardName, boardColor, onClose }: HotRankingProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {boardName}热门排行
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Ranking List */}
        <div className="space-y-3">
          {tags.map((tag, index) => (
            <div
              key={tag.id}
              className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-gray-50"
            >
              <span className="text-sm font-bold w-8 text-center" style={{ color: boardColor }}>
                #{index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate">
                  {tag.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  已有 {tag.vote_count} 人 +1
                </div>
              </div>
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-sm font-bold"
                style={{ background: boardColor }}
              >
                <span>+{tag.vote_count}</span>
              </div>
            </div>
          ))}
        </div>

        {tags.length === 0 && (
          <p className="text-center text-gray-400 py-8">暂无热门标签</p>
        )}
      </div>
    </div>
  );
}
