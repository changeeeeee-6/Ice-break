'use client';

import { useState, useEffect } from 'react';
import NicknameEntry from '@/components/NicknameEntry';
import MainBoard from '@/components/MainBoard';

interface UserInfo {
  id: string;
  nickname: string;
}

export default function Home() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId = localStorage.getItem('icebreaker_user_id');
    const storedName = localStorage.getItem('icebreaker_nickname');
    if (storedId && storedName) {
      setUser({ id: storedId, nickname: storedName });
    }
    setLoading(false);
  }, []);

  const handleNicknameSet = (userInfo: UserInfo) => {
    localStorage.setItem('icebreaker_user_id', userInfo.id);
    localStorage.setItem('icebreaker_nickname', userInfo.nickname);
    setUser(userInfo);
  };

  if (loading) {
    return (
      <div className="app-bg flex items-center justify-center">
        <div className="text-white text-xl font-medium animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return <NicknameEntry onNicknameSet={handleNicknameSet} />;
  }

  return <MainBoard user={user} />;
}
