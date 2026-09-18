import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '破冰大作战 - 班会互动',
  description: '发现志同道合的同学，一起嗨翻班会！',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark" style={{ colorScheme: 'dark' }}>
      <body className="antialiased min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
