// LeoChat 只有小窗，没有整页：这个地址一律跳到 LeoBay（`?bay=` 详情参数原样带上）。
import { redirect } from "next/navigation";

type Search = Record<string, string | string[] | undefined>;

export default async function LeoChatRedirect({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const bay = Array.isArray(sp?.bay) ? sp.bay[0] : sp?.bay;
  redirect(typeof bay === "string" && bay ? `/bay?bay=${encodeURIComponent(bay)}` : "/bay");
}
