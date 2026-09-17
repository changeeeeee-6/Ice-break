import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { normalizeTagName } from '@/lib/tag-normalize';

// GET /api/tags?board=music - get all tags for a board with vote counts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const board = searchParams.get('board');

    if (!board) {
      return NextResponse.json(
        { error: '缺少 board 参数' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // Get all tags for this board
    const { data: tags, error: tagsError } = await client
      .from('tags')
      .select('id, board, name, normalized_name, created_by, created_at')
      .eq('board', board)
      .order('created_at', { ascending: false });

    if (tagsError) throw new Error(`查询标签失败: ${tagsError.message}`);
    if (!tags) return NextResponse.json({ success: true, data: [] });

    // Get vote counts for all tags in this board
    const tagIds = tags.map((t: { id: string }) => t.id);
    let votes: { tag_id: string; user_id: string }[] = [];

    if (tagIds.length > 0) {
      const { data: votesData, error: votesError } = await client
        .from('tag_votes')
        .select('tag_id, user_id')
        .in('tag_id', tagIds);

      if (votesError) throw new Error(`查询投票失败: ${votesError.message}`);
      votes = votesData || [];
    }

    // Get all user nicknames
    const userIds = new Set<string>();
    tags.forEach((t: { created_by: string }) => userIds.add(t.created_by));
    votes.forEach((v: { user_id: string }) => userIds.add(v.user_id));

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

    // Build response
    const result = tags.map((tag: { id: string; board: string; name: string; normalized_name: string; created_by: string; created_at: string }) => {
      const tagVotes = votes.filter((v: { tag_id: string }) => v.tag_id === tag.id);
      const voteCount = tagVotes.length;
      const voterIds = tagVotes.map((v: { user_id: string }) => v.user_id);

      return {
        id: tag.id,
        board: tag.board,
        name: tag.name,
        normalized_name: tag.normalized_name,
        created_by: tag.created_by,
        creator_name: userMap[tag.created_by] || '未知',
        created_at: tag.created_at,
        vote_count: voteCount,
        voter_ids: voterIds,
        voter_names: voterIds.map((id: string) => userMap[id] || '未知'),
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '服务器错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/tags - create a new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { board, name, user_id } = body as {
      board?: string;
      name?: string;
      user_id?: string;
    };

    if (!board || !name || !user_id) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const validBoards = ['music', 'games', 'anime', 'movies', 'sports'];
    if (!validBoards.includes(board)) {
      return NextResponse.json(
        { error: '无效的板块' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 200) {
      return NextResponse.json(
        { error: '标签名称长度需在1-200字符之间' },
        { status: 400 }
      );
    }

    const normalizedName = normalizeTagName(trimmedName);
    const client = getSupabaseClient();

    // Check if tag already exists (normalized dedup)
    const { data: existing, error: checkError } = await client
      .from('tags')
      .select('id, name')
      .eq('board', board)
      .eq('normalized_name', normalizedName)
      .maybeSingle();

    if (checkError) throw new Error(`查询标签失败: ${checkError.message}`);

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'duplicate',
        message: `标签「${existing.name}」已存在，请直接为它 +1 吧！`,
        existing_tag_id: existing.id,
      });
    }

    // Create new tag
    const { data, error } = await client
      .from('tags')
      .insert({
        board,
        name: trimmedName,
        normalized_name: normalizedName,
        created_by: user_id,
      })
      .select('id, board, name, normalized_name, created_by, created_at')
      .single();

    if (error) throw new Error(`创建标签失败: ${error.message}`);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '服务器错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
