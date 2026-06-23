// 功能区图标（与 ConsoleClient.tsx 的 functions + SiteShell 子栏 1:1）。
// 纯内联 SVG，零外部资源。

export function IconReply() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 14l-5-4 5-4v3h6a4 4 0 014 4v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconResearch() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" strokeLinecap="round" />
      <path d="M8.5 11a2.5 2.5 0 012.5-2.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconCompetition() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLetter() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="M4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTranslate() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h7M7 5v2c0 3-1.5 5.5-4 7M5 9c.8 2.2 2.5 3.8 4.5 4.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 20l4-9 4 9M14.5 17h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
