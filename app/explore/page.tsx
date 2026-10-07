// `/explore` 已并入 LeoBay 的「素材」：一律跳到 /bay?kind=material，原有参数（app、types、scene…）原样带上。
import { redirect } from "next/navigation";

type Search = Record<string, string | string[] | undefined>;

export default async function ExploreRedirect({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  params.set("kind", "material");
  for (const [key, value] of Object.entries(sp ?? {})) {
    if (key === "kind") continue;
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string" && first) params.set(key, first);
  }
  redirect(`/bay?${params.toString()}`);
}
