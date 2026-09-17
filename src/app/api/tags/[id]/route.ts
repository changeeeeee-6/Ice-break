import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/tags/[id] - get tag detail (who added, who voted)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();

    // Get tag info
    const { data: tag, error: tagError } = await client
      .from('tags')
      .select('id, board, name, created_by, created_at')
      .eq('id', id)
      .maybeSingle();

    if (tagError) throw new Error(`查询标签失败: ${tagError.message}`);
    if (!tag) {
      return NextResponse.json({ error: '标签不存在' }, { status: 404 });
    }

    // Get votes for this tag
    const { data: votes, error: votesError } = await client
      .from('tag_votes')
      .select('user_id, created_at')
      .eq('tag_id', id);

    if (votesError) throw new Error(`查询投票失败: ${votesError.message}`);

    // Get user nicknames
    const userIds = new Set<string>();
    userIds.add(tag.created_by);
    (votes || []).forEach((v: { user_id: string }) => userIds.add(v.user_id));

    let userMap: Record<string, string> = {};
    if (userIds.size > 0) {
      const { data: usersData, error: usersError } = await client
        .from('users')
        .select('id, nickname')
        .in('id', Array.from(userIds));

      if (usersError) throw new Error(`查询用户失败: ${usersError.message}`);
      if (usersData) {
        usersData.forEach((u: { id: string; nickname: string }) => {
          userMap[u.id] = u.nickname;
        });
      }
    }

    const result = {
      id: tag.id,
      board: tag.board,
      name: tag.name,
      creator_name: userMap[tag.created_by] || '未知',
      created_at: tag.created_at,
      vote_count: (votes || []).length,
      voters: (votes || []).map((v: { user_id: string; created_at: string }) => ({
        nickname: userMap[v.user_id] || '未知',
        voted_at: v.created_at,
      })),
    };

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '服务器错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
