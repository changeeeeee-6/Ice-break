'use client';

interface TagData {
  id: string;
  name: string;
  vote_count: number;
  voter_ids: string[];
  voter_names: string[];
  creator_name: string;
}

interface TagDetailModalProps {
  tag: TagData;
  onClose: () => void;
}

export default function TagDetailModal({ tag, onClose }: TagDetailModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            📌 {tag.name}
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
          <div className="flex-1 bg-purple-50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{tag.voter_names.length}</div>
            <div className="text-xs text-purple-500 mt-1">参与同学</div>
          </div>
        </div>

        {/* Creator */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">👤 添加者</h4>
          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 rounded-full px-3 py-1 text-sm">
            <span>{tag.creator_name}</span>
          </div>
        </div>

        {/* Voters */}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2">
            ❤️ +1 过的同学 ({tag.voter_names.length})
          </h4>
          {tag.voter_names.length === 0 ? (
            <p className="text-gray-400 text-sm">还没有人为这个标签 +1</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tag.voter_names.map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-pink-50 text-pink-700 rounded-full px-3 py-1 text-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
