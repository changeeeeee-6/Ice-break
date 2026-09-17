import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// POST /api/votes - toggle vote on a tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tag_id, user_id } = body as {
      tag_id?: string;
      user_id?: string;
    };

    if (!tag_id || !user_id) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // Check if user already voted for this tag
    const { data: existing, error: checkError } = await client
      .from('tag_votes')
      .select('id')
      .eq('tag_id', tag_id)
      .eq('user_id', user_id)
      .maybeSingle();

    if (checkError) throw new Error(`查询投票失败: ${checkError.message}`);

    if (existing) {
      // Remove vote (cancel)
      const { error: deleteError } = await client
        .from('tag_votes')
        .delete()
        .eq('id', existing.id);

      if (deleteError) throw new Error(`取消投票失败: ${deleteError.message}`);

      return NextResponse.json({ success: true, action: 'removed' });
    } else {
      // Add vote
      const { error: insertError } = await client
        .from('tag_votes')
        .insert({ tag_id, user_id });

      if (insertError) throw new Error(`投票失败: ${insertError.message}`);

      return NextResponse.json({ success: true, action: 'added' });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '服务器错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
