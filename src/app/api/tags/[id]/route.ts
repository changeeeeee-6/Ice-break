import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/tags/[id]?user_id=xxx - get tag detail
// 匿名规则：只有当前用户对该标签 +1 过，才返回具体投票者昵称；
// 否则只返回人数。
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUserId = request.nextUrl.searchParams.get('user_id');
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

    const voteList = votes || [];
    const hasVoted = currentUserId
      ? voteList.some((v: { user_id: string }) => v.user_id === currentUserId)
      : false;

    // Resolve nicknames. Creator name is always returned (public);
    // voter names are only resolved/output when the current user has voted.
    const userIds = new Set<string>();
    userIds.add(tag.created_by);
    if (hasVoted) {
      voteList.forEach((v: { user_id: string }) => userIds.add(v.user_id));
    }

    let userMap: Record<string, string> = {};
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

    const result = {
      id: tag.id,
      board: tag.board,
      name: tag.name,
      creator_name: userMap[tag.created_by] || '未知',
      created_at: tag.created_at,
      vote_count: voteList.length,
      has_voted: hasVoted,
      // 仅同投者可见具体名单
      voters: hasVoted
        ? voteList.map((v: { user_id: string; created_at: string }) => ({
            nickname: userMap[v.user_id] || '未知',
            voted_at: v.created_at,
          }))
        : [],
    };

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '服务器错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
