"use client";

import { useEffect } from "react";

// Route-segment error boundary for the shared /api page. Keeps a render
// failure contained to this page (friendly retry card) instead of bubbling up
// to the root error boundary and blanking the whole site with a full-screen
// 500. The data layer (lib/oceanleo-auth/account.ts) already normalizes the
// gateway's numeric fields; this is defense-in-depth.
export default function ApiError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[api] render error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 p-6 text-center">
        <h1 className="text-lg font-semibold text-neutral-900">页面暂时无法加载</h1>
        <p className="mt-2 text-sm text-neutral-600">
          模型列表或余额信息加载失败，请稍后重试。
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-5 inline-flex rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          重新加载
        </button>
      </div>
    </div>
  );
}
