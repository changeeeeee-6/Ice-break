import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname } = body as { nickname?: string };

    if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
      return NextResponse.json(
        { error: '昵称不能为空' },
        { status: 400 }
      );
    }

    const trimmedNickname = nickname.trim().slice(0, 100);
    const client = getSupabaseClient();

    const { data, error } = await client
      .from('users')
      .insert({ nickname: trimmedNickname })
      .select('id, nickname, created_at')
      .single();

    if (error) throw new Error(`创建用户失败: ${error.message}`);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '服务器错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
