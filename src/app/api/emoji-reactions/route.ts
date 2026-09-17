import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/emoji-reactions?tag_id=xxx - get all emoji reactions for a tag
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get('tag_id');

    if (!tagId) {
      return NextResponse.json(
        { error: '缺少 tag_id 参数' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { data: reactions, error: reactionsError } = await client
      .from('emoji_reactions')
      .select('id, tag_id, user_id, emoji, created_at')
      .eq('tag_id', tagId)
      .order('created_at', { ascending: true });

    if (reactionsError) throw new Error(`查询 emoji 失败: ${reactionsError.message}`);
    if (!reactions || reactions.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Get user nicknames
    const userIds = [...new Set(reactions.map((r: { user_id: string }) => r.user_id))];
    let userMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await client
        .from('users')
        .select('id, nickname')
        .in('id', userIds);

      if (usersError) throw new Error(`查询用户失败: ${usersError.message}`);
      if (usersData) {
        usersData.forEach((u: { id: string; nickname: string }) => {
          userMap[u.id] = u.nickname;
        });
      }
    }

    const result = reactions.map((r: { id: string; tag_id: string; user_id: string; emoji: string; created_at: string }) => ({
      id: r.id,
      tag_id: r.tag_id,
      user_id: r.user_id,
      emoji: r.emoji,
      nickname: userMap[r.user_id] || '未知',
      created_at: r.created_at,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '服务器错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/emoji-reactions - send an emoji reaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag_id, user_id, emoji } = body as {
      tag_id?: string;
      user_id?: string;
      emoji?: string;
    };

    if (!tag_id || !user_id || !emoji) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // Basic emoji validation - ensure it's not empty after trim and not too long
    const trimmedEmoji = emoji.trim();
    if (trimmedEmoji.length === 0 || trimmedEmoji.length > 50) {
      return NextResponse.json(
        { error: '无效的 emoji' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    const { data, error } = await client
      .from('emoji_reactions')
      .insert({
        tag_id,
        user_id,
        emoji: trimmedEmoji,
      })
      .select('id, tag_id, user_id, emoji, created_at')
      .single();

    if (error) throw new Error(`发送 emoji 失败: ${error.message}`);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '服务器错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
